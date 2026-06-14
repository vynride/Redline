"""The scenario engine — advances a drill one turn at a time.

``step`` persists the responder's turn, asks the LLM (via the injected client) for
the persona's structured reaction, applies the resulting state deltas to the session,
persists the persona turn, and decides whether the drill has ended. It is deliberately
LLM-agnostic: callers pass any ``LLMClient`` (real Sarvam adapter or a test fake).
"""
from __future__ import annotations

import re

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


# Filler words that shouldn't count toward objective similarity (they inflate overlap).
_OBJECTIVE_STOPWORDS = frozenset(
    "a an the to of for and or in on at by with your you their our is are be that this".split()
)


def _normalize_objective(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def _match_objectives(reported: list[str], canonical: list[str]) -> list[str]:
    """Snap each model-reported objective to the canonical scenario objective it refers to.

    The LLM is asked to echo objective wording verbatim but it paraphrases — different
    casing, punctuation, or word order — so a literal match silently drops genuinely-met
    objectives (the HUD row never turns green). Match on normalized text with substring and
    content-token-overlap fallbacks, and return the *canonical* strings so the HUD checklist,
    the met count, and the debrief all compare cleanly. Reported items that match no scenario
    objective (hallucinations) are dropped.
    """
    norm_canon = [(c, set(_normalize_objective(c).split()) - _OBJECTIVE_STOPWORDS) for c in canonical]
    matched: list[str] = []
    for item in reported:
        norm = _normalize_objective(item)
        if not norm:
            continue
        tokens = set(norm.split()) - _OBJECTIVE_STOPWORDS
        best: str | None = None
        best_score = 0.0
        for canon, canon_tokens in norm_canon:
            canon_norm = _normalize_objective(canon)
            # Substring either direction is a confident match.
            if norm == canon_norm or norm in canon_norm or canon_norm in norm:
                best, best_score = canon, 1.0
                break
            # Otherwise, fraction of the canonical objective's content words present.
            if canon_tokens:
                score = len(tokens & canon_tokens) / len(canon_tokens)
                if score > best_score:
                    best, best_score = canon, score
        if best is not None and best_score >= 0.6 and best not in matched:
            matched.append(best)
    return matched


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


async def opening(db: Session, session: DrillSession, llm: LLMClient) -> EngineTurnOutput:
    """Generate and persist the persona's opening utterance before the first user turn."""
    if session.status != SessionStatus.active:
        raise ValueError("Cannot open a drill that is not active.")

    scenario: Scenario | None = catalog.scenario_for_session(session)
    if scenario is None:
        raise ValueError(f"Scenario '{session.scenario_id}' no longer exists.")

    system = compile_system_prompt(scenario, Role(session.role), Difficulty(session.difficulty))
    seed: list[ChatMessage] = [{"role": "user", "content": "Begin the incident. Open the call in character."}]
    output = await llm.generate(system=system, messages=seed, response_schema=EngineTurnOutput)

    persona_turn = Turn(
        session_id=session.id,
        index=0,
        speaker=Speaker.persona,
        text=output.utterance,
        emotion=output.emotion.value,
        severity_after=session.severity,
        confidence_after=session.confidence,
        evaluation=output.turn_eval.model_dump(),
    )
    db.add(persona_turn)
    db.commit()
    db.refresh(session)
    return output


async def step(db: Session, session: DrillSession, user_text: str, llm: LLMClient) -> EngineTurnOutput:
    if session.status != SessionStatus.active:
        raise ValueError("Cannot advance a drill that is not active.")

    scenario: Scenario | None = catalog.scenario_for_session(session)
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
        # Snap to canonical objective text so the HUD/debrief match exactly (the LLM paraphrases).
        matched = _match_objectives(output.objectives_met, scenario.objectives)
        if matched:
            session.objectives_met = list(dict.fromkeys([*session.objectives_met, *matched]))

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
