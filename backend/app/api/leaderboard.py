"""Global leaderboard route — all users ranked by total drill score.

A user's standing is the sum of their ``score`` across completed sessions — the
same quantity the dashboard surfaces as "readiness". The ranking is computed in
the database with a grouped aggregate so it scales past in-memory summing.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.session import DrillSession, SessionStatus
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[LeaderboardEntry])
def get_leaderboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[LeaderboardEntry]:
    """Top users ranked by total completed-drill score, highest first."""
    total = func.sum(DrillSession.score)
    rows = db.execute(
        select(
            User.id,
            User.display_name,
            User.avatar_url,
            total.label("points"),
            func.count(DrillSession.id).label("drills"),
        )
        .join(DrillSession, DrillSession.user_id == User.id)
        .where(DrillSession.status == SessionStatus.completed, DrillSession.score.is_not(None))
        .group_by(User.id)
        .order_by(total.desc())
        .limit(100)
    ).all()

    return [
        LeaderboardEntry(
            rank=i + 1,
            user_id=r.id,
            display_name=r.display_name,
            avatar_url=r.avatar_url,
            points=float(r.points or 0),
            drills=r.drills,
        )
        for i, r in enumerate(rows)
    ]
