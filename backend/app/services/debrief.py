"""Coaching debrief — turns a finished drill into a structured report via the LLM."""
from __future__ import annotations

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.debrief import Debrief
from app.models.session import DrillSession
from app.models.turn import Speaker, Turn
from app.schemas.debrief import DebriefContent
from app.schemas.common import Difficulty, Role
from app.services.llm import ChatMessage, LLMClient
from app.services import scenarios as catalog

_DEBRIEF_SYSTEM = """You are an expert incident-response coach. You are given the full \
transcript of a finished crisis drill, the scenario the responder faced, their objectives, \
and per-turn notes. Produce an honest, specific, and constructive debrief.

Be concrete: quote the responder's own words when you flag a moment where they lost control, \
explain why it hurt, and offer a stronger rewrite. Reward genuine de-escalation, structured \
information gathering, correct escalation, and clear status communication. Do not flatter.

Return the structured fields: a short overall summary, strengths, lost-control moments \
(quote / issue / better), missed information, an escalation assessment, a status-communication \
assessment, and dimension scores (0-100) for clarity, deescalation, info_gathering, escalation, \
and status_communication."""


class _DebriefDraft(BaseModel):
    summary: str
    content: DebriefContent


def _grade(avg: float) -> str:
    if avg >= 90:
        return "A"
    if avg >= 80:
        return "B"
    if avg >= 70:
        return "C"
    if avg >= 60:
        return "D"
    return "F"


def _transcript_block(turns: list[Turn]) -> str:
    lines: list[str] = []
    for turn in turns:
        who = "RESPONDER" if turn.speaker == Speaker.user else "PERSONA"
        line = f"[{turn.index}] {who}: {turn.text}"
        if turn.evaluation:
            e = turn.evaluation
            line += (
                f"\n     (eval clarity={e.get('clarity')} deescalation={e.get('deescalation')} "
                f"info={e.get('info_gathering')} note={e.get('note')!r})"
            )
        lines.append(line)
    return "\n".join(lines)


def _build_messages(session: DrillSession, turns: list[Turn]) -> tuple[str, list[ChatMessage]]:
    scenario = catalog.get_scenario(session.scenario_id)
    title = scenario.title if scenario else session.scenario_id
    objectives = "\n".join(f"  - {o}" for o in (scenario.objectives if scenario else [])) or "  (none)"
    met = "\n".join(f"  - {o}" for o in (session.objectives_met or [])) or "  (none)"
    role_label = Role(session.role).value.replace("_", " ")
    difficulty = Difficulty(session.difficulty).value

    context = f"""SCENARIO: {title}
RESPONDER ROLE: {role_label}    DIFFICULTY: {difficulty}
SEVERITY: started at {session.severity_start}, ended at {session.severity} (lower is better)
FINAL STATUS: {session.status.value}

OBJECTIVES:
{objectives}

OBJECTIVES THE RESPONDER MET:
{met}

TRANSCRIPT:
{_transcript_block(turns)}
"""
    return _DEBRIEF_SYSTEM, [{"role": "user", "content": context}]


async def get_or_create_debrief(db: Session, session: DrillSession, llm: LLMClient) -> Debrief:
    existing = db.scalar(select(Debrief).where(Debrief.session_id == session.id))
    if existing is not None:
        return existing

    turns = db.scalars(select(Turn).where(Turn.session_id == session.id).order_by(Turn.index)).all()
    system, messages = _build_messages(session, list(turns))
    draft = await llm.generate(system=system, messages=messages, response_schema=_DebriefDraft)

    scores = draft.content.dimension_scores
    avg = (
        scores.clarity + scores.deescalation + scores.info_gathering
        + scores.escalation + scores.status_communication
    ) / 5.0

    debrief = Debrief(
        session_id=session.id,
        summary=draft.summary,
        overall_grade=_grade(avg),
        content=draft.content.model_dump(),
    )
    db.add(debrief)
    db.commit()
    db.refresh(debrief)
    return debrief
