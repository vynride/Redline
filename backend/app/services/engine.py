"""The scenario engine — advances a drill one turn at a time.

``step`` persists the responder's turn, asks the LLM (via the injected client) for
the persona's structured reaction, applies the resulting state deltas to the session,
persists the persona turn, and decides whether the drill has ended. It is deliberately
LLM-agnostic: callers pass any ``LLMClient`` (real Sarvam adapter or a test fake).
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.base import utcnow
from app.models.session import DrillSession, SessionStatus
from app.models.turn import Speaker, Turn
from app.schemas.common import Difficulty, Role
from app.schemas.engine import EngineTurnOutput
from app.schemas.scenario import Scenario
from app.services.llm import ChatMessage, LLMClient
from app.services.prompts import compile_system_prompt
from app.services import scenarios as catalog


def _clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def _build_messages(turns: list[Turn]) -> list[ChatMessage]:
    """Map the transcript to chat messages — persona is the assistant, responder the user."""
    messages: list[ChatMessage] = []
    for turn in turns:
        role = "assistant" if turn.speaker == Speaker.persona else "user"
        messages.append({"role": role, "content": turn.text})
    return messages


def _compute_score(db: Session, session_id: str) -> float:
    """Overall 0–100 score from the per-turn evaluation dimensions."""
    evals = [
        t.evaluation
        for t in db.scalars(select(Turn).where(Turn.session_id == session_id)).all()
        if t.evaluation
    ]
    if not evals:
        return 0.0
    per_turn = [
        (e.get("clarity", 0) + e.get("deescalation", 0) + e.get("info_gathering", 0)) / 15.0
        for e in evals
    ]
    return round(sum(per_turn) / len(per_turn) * 100, 1)


async def step(db: Session, session: DrillSession, user_text: str, llm: LLMClient) -> EngineTurnOutput:
    if session.status != SessionStatus.active:
        raise ValueError("Cannot advance a drill that is not active.")

    scenario: Scenario | None = catalog.get_scenario(session.scenario_id)
    if scenario is None:
        raise ValueError(f"Scenario '{session.scenario_id}' no longer exists.")

    ordered = db.scalars(
        select(Turn).where(Turn.session_id == session.id).order_by(Turn.index)
    ).all()
    next_index = (ordered[-1].index + 1) if ordered else 0

    user_turn = Turn(session_id=session.id, index=next_index, speaker=Speaker.user, text=user_text)
    db.add(user_turn)
    db.flush()

    system = compile_system_prompt(scenario, Role(session.role), Difficulty(session.difficulty))
    messages = _build_messages([*ordered, user_turn])
    output = await llm.generate(system=system, messages=messages, response_schema=EngineTurnOutput)

    new_severity = _clamp(session.severity + output.severity_delta, 0, scenario.severity.max)
    new_confidence = _clamp(session.confidence + output.confidence_delta, 0, 100)
    session.severity = new_severity
    session.confidence = new_confidence

    if output.objectives_met:
        session.objectives_met = list(dict.fromkeys([*session.objectives_met, *output.objectives_met]))

    persona_index = next_index + 1
    if output.escalation_event:
        session.escalation_timeline = [
            *session.escalation_timeline,
            {
                "event": output.escalation_event,
                "severity": new_severity,
                "turn_index": persona_index,
                "at": utcnow().isoformat(),
            },
        ]

    persona_turn = Turn(
        session_id=session.id,
        index=persona_index,
        speaker=Speaker.persona,
        text=output.utterance,
        emotion=output.emotion.value,
        severity_after=new_severity,
        confidence_after=new_confidence,
        evaluation=output.turn_eval.model_dump(),
    )
    db.add(persona_turn)
    db.flush()

    won = new_severity < scenario.severity.win_below
    lost = new_severity >= scenario.severity.lose_at
    if output.session_should_end or won or lost:
        session.status = SessionStatus.completed
        session.ended_at = utcnow()
        session.score = _compute_score(db, session.id)

    db.commit()
    db.refresh(session)
    return output
