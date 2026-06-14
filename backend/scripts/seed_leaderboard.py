#!/usr/bin/env python3
"""Seed demo competitors so the global leaderboard reads as a populated board.

The leaderboard ranks real users by total completed-drill score, but a fresh
install has only the owner's account, so the page would show a single row. This
inserts a handful of believable demo accounts, each with a spread of completed,
scored drills, alongside the real users.

Idempotent: if any ``provider="demo"`` account already exists it does nothing, so
it is safe to run repeatedly (and on startup). Run it from ``backend/`` so the
relative ``sqlite:///./redline.db`` path resolves:

    python -m scripts.seed_leaderboard
"""
from __future__ import annotations

import random
import sys
from datetime import timedelta

from app.db import SessionLocal
from app.models.base import utcnow
from app.models.session import DrillSession, SessionStatus
from app.models.user import User

# Handle, and the rough total score the account should land on. Spread across
# tiers (Gold >=1500, Silver >=500, Bronze below) so the board shows range.
_DEMO = [
    ("ops_kira", 2480),
    ("sev1_sam", 2210),
    ("nightshift_lee", 1980),
    ("rollback_rana", 1670),
    ("pager_pat", 1390),
    ("calm_quinn", 1120),
    ("oncall_omar", 860),
    ("warroom_wen", 610),
    ("rookie_ravi", 410),
    ("intern_iris", 180),
]

# Valid catalog scenario ids + enum values to satisfy NOT NULL columns. The
# leaderboard query never joins scenarios, but realistic values keep the rows
# self-consistent if inspected elsewhere.
_SCENARIOS = [
    "prod-outage-database",
    "payment-double-charge",
    "security-cred-leak",
    "latency-spike-checkout",
    "broken-release-migration",
    "support-enterprise-escalation",
]
_ROLES = ["on_call_engineer", "incident_commander", "ops_responder"]
_DIFFICULTIES = ["warmup", "production_like", "redline"]


def _sessions_for(total: float, rng: random.Random) -> list[float]:
    """Split a target total into 4-9 per-drill scores that sum to it."""
    n = rng.randint(4, 9)
    weights = [rng.random() for _ in range(n)]
    s = sum(weights)
    return [round(total * w / s, 1) for w in weights]


def main() -> int:
    rng = random.Random(1337)
    db = SessionLocal()
    try:
        if db.query(User).filter(User.provider == "demo").first() is not None:
            print("[seed] demo competitors already present, nothing to do")
            return 0

        now = utcnow()
        created_users = 0
        created_sessions = 0
        for handle, total in _DEMO:
            user = User(
                provider="demo",
                provider_account_id=f"demo:{handle}",
                email=f"{handle}@demo.redline",
                display_name=handle,
                avatar_url=None,
            )
            db.add(user)
            db.flush()  # assign user.id

            for score in _sessions_for(total, rng):
                started = now - timedelta(days=rng.randint(1, 28), minutes=rng.randint(0, 600))
                db.add(
                    DrillSession(
                        user_id=user.id,
                        scenario_id=rng.choice(_SCENARIOS),
                        role=rng.choice(_ROLES),
                        difficulty=rng.choice(_DIFFICULTIES),
                        status=SessionStatus.completed,
                        severity=rng.randint(1, 3),
                        severity_start=5,
                        confidence=rng.randint(40, 90),
                        score=score,
                        created_at=started,
                        ended_at=started + timedelta(minutes=rng.randint(6, 18)),
                    )
                )
                created_sessions += 1
            created_users += 1

        db.commit()
        print(f"[seed] added {created_users} demo competitors with {created_sessions} completed drills")
        return 0
    except Exception as exc:  # noqa: BLE001 — surface any insert/validation error
        db.rollback()
        print(f"[seed] failed to seed leaderboard: {exc}", file=sys.stderr)
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
