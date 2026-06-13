"""Engine and debrief tests using the fake LLM (no network)."""
from __future__ import annotations

from app.models.session import DrillSession, SessionStatus
from app.models.turn import Speaker, Turn
from app.models.user import User
from app.schemas.common import Emotion
from app.schemas.engine import EngineTurnOutput, TurnEval
from app.services import engine
from tests.conftest import FakeLLM

VALID = {"scenario_id": "prod-outage-payments", "role": "on_call_engineer", "difficulty": "production_like"}


def _make_session(db) -> DrillSession:
    user = User(email="e@b.com", hashed_password="x", display_name="E")
    db.add(user)
    db.commit()
    session = DrillSession(
        user_id=user.id, scenario_id="prod-outage-payments", role="on_call_engineer",
        difficulty="production_like", severity=8, severity_start=8, confidence=50,
        objectives_met=[], escalation_timeline=[],
    )
    db.add(session)
    db.commit()
    return session


async def test_step_applies_clamped_state_and_persists_turns(db_session):
    session = _make_session(db_session)
    llm = FakeLLM()
    out = await engine.step(db_session, session, "We're on it — seeing 500s across regions.", llm)

    assert isinstance(out, EngineTurnOutput)
    assert session.severity == 7  # 8 - 1
    assert session.confidence == 60  # 50 + 10
    assert session.objectives_met  # objective recorded
    assert len(session.turns) == 2  # responder + persona
    assert {t.speaker for t in session.turns} == {Speaker.user, Speaker.persona}
    # the LLM saw the system prompt and the responder's message
    assert llm.calls and llm.calls[-1][-1]["role"] == "user"


async def test_step_ends_on_lose_threshold(db_session):
    session = _make_session(db_session)
    blowup = EngineTurnOutput(
        utterance="This is unacceptable, I'm escalating to your CEO.",
        emotion=Emotion.angry, severity_delta=3, confidence_delta=-20,
        escalation_event="Customer escalated to executive leadership",
        turn_eval=TurnEval(clarity=1, deescalation=0, info_gathering=1, note="lost the room"),
    )
    out = await engine.step(db_session, session, "Uh, I don't really know what's wrong.", FakeLLM(blowup))
    assert session.severity == 10  # clamped at max, >= lose_at
    assert session.status == SessionStatus.completed
    assert session.ended_at is not None
    assert session.score is not None
    assert len(session.escalation_timeline) == 1


async def test_step_refuses_inactive_session(db_session):
    session = _make_session(db_session)
    session.status = SessionStatus.completed
    db_session.commit()
    try:
        await engine.step(db_session, session, "hello", FakeLLM())
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_debrief_generated_after_completion(client, db_session, auth_headers):
    from app.main import app
    from app.services.llm import get_llm_client

    app.dependency_overrides[get_llm_client] = lambda: FakeLLM()
    sid = client.post("/api/sessions", json=VALID, headers=auth_headers).json()["id"]

    session = db_session.get(DrillSession, sid)
    session.turns.append(Turn(index=1, speaker=Speaker.user, text="We're on it, 500s across regions."))
    session.turns.append(Turn(index=2, speaker=Speaker.persona, text="When is it fixed?",
                              evaluation={"clarity": 4, "deescalation": 3, "info_gathering": 4, "note": "ok"}))
    session.status = SessionStatus.completed
    db_session.commit()

    r = client.get(f"/api/sessions/{sid}/debrief", headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["overall_grade"] in {"A", "B", "C", "D", "F"}
    assert body["content"]["dimension_scores"]["clarity"] == 80
    assert body["summary"]
