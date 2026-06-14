"""Global leaderboard endpoint — ranking, ordering, and auth."""
from __future__ import annotations

from app.models.session import DrillSession, SessionStatus
from app.models.user import User


def _make_user(db, email, name):
    user = User(provider="google", provider_account_id=f"google:{email}", email=email, display_name=name)
    db.add(user)
    db.flush()
    return user


def _add_session(db, user, score, status=SessionStatus.completed):
    db.add(
        DrillSession(
            user_id=user.id,
            scenario_id="prod-outage-database",
            role="on_call_engineer",
            difficulty="production_like",
            status=status,
            severity=2,
            severity_start=5,
            confidence=50,
            score=score,
        )
    )


def test_leaderboard_ranks_by_total_score(client, db_session, auth_headers):
    high = _make_user(db_session, "high@x.com", "high_scorer")
    low = _make_user(db_session, "low@x.com", "low_scorer")
    _add_session(db_session, high, 100)
    _add_session(db_session, high, 80)   # high total = 180
    _add_session(db_session, low, 50)    # low total = 50
    db_session.commit()

    resp = client.get("/api/leaderboard", headers=auth_headers)
    assert resp.status_code == 200
    board = resp.json()

    # auth_headers' own user has no completed scored drills, so it is absent.
    names = [r["display_name"] for r in board]
    assert names == ["high_scorer", "low_scorer"]
    assert [r["rank"] for r in board] == [1, 2]
    assert board[0]["points"] == 180
    assert board[0]["drills"] == 2
    assert board[1]["points"] == 50


def test_leaderboard_excludes_active_and_unscored(client, db_session, auth_headers):
    u = _make_user(db_session, "mix@x.com", "mixed")
    _add_session(db_session, u, 70)                                  # counts
    _add_session(db_session, u, 999, status=SessionStatus.active)    # excluded: not completed
    _add_session(db_session, u, None)                               # excluded: no score
    db_session.commit()

    board = client.get("/api/leaderboard", headers=auth_headers).json()
    row = next(r for r in board if r["display_name"] == "mixed")
    assert row["points"] == 70
    assert row["drills"] == 1


def test_leaderboard_requires_auth(client):
    assert client.get("/api/leaderboard").status_code == 401
