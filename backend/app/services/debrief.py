"""Coaching debrief — turns a finished drill into a structured report via the LLM."""
from __future__ import annotations

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.debrief import Debrief
from app.models.session import DrillSession, SessionStatus
from app.models.turn import Speaker, Turn
from app.schemas.debrief import DebriefContent, DimensionScores
from app.schemas.scenario import Scenario
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
assessment, and dimension scores for clarity, deescalation, info_gathering, escalation, and \
status_communication.

Score each dimension 0-100 on this calibration: 85-100 excellent, 70-84 a solid pass, \
55-69 shaky but acceptable, below 55 genuinely poor. A competent responder who handles the \
incident reasonably should land in the 70s, not the 40s — reserve sub-55 scores for real \
mistakes, not for anything short of perfect."""


class _DebriefDraft(BaseModel):
    summary: str
    content: DebriefContent


def _grade(score: float) -> str:
    if score >= 82:
        return "A"
    if score >= 68:
        return "B"
    if score >= 54:
        return "C"
    if score >= 40:
        return "D"
    return "F"


def _dims_avg(d: DimensionScores) -> float:
    return (
        d.clarity + d.deescalation + d.info_gathering + d.escalation + d.status_communication
    ) / 5.0


def _overall_score(session: DrillSession, scenario: Scenario | None, dims: DimensionScores) -> int:
    """Grounded 0-100 score: measured per-turn quality + objectives met + outcome.

    The LLM's dimension scores alone are a harsh, middling signal that buries even a
    clean win at an F. We anchor the grade in what actually happened — how well each
    turn scored, how many objectives were met, and whether the incident was won or
    lost — so the grade tracks real performance, not the model's grading mood.
    """
    # Three grounded signals, blended so the grade spreads across the range instead
    # of collapsing onto F: measured per-turn quality, objectives met, and how far
    # the responder drove severity down toward the win line.
    perf = session.score if session.score is not None else _dims_avg(dims)

    total = len(scenario.objectives) if scenario else 0
    obj_pct = (len(session.objectives_met) / total * 100.0) if total else 0.0

    if scenario is not None:
        denom = max(1, session.severity_start - scenario.severity.win_below)
        progress = (session.severity_start - session.severity) / denom
        sev_pct = max(0.0, min(1.0, progress)) * 100.0
    else:
        sev_pct = 0.0

    base = 0.40 * perf + 0.30 * obj_pct + 0.30 * sev_pct

    # Outcome nudges the grade at the edges: a clean win lifts it, a blow-up sinks it.
    if scenario is not None:
        if session.status == SessionStatus.completed and session.severity < scenario.severity.win_below:
            base += 6.0
        elif session.severity >= scenario.severity.lose_at:
            base -= 10.0

    return max(0, min(100, round(base)))


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
    scenario = catalog.scenario_for_session(session)
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

    scenario = catalog.scenario_for_session(session)
    overall = _overall_score(session, scenario, draft.content.dimension_scores)

    debrief = Debrief(
        session_id=session.id,
        summary=draft.summary,
        overall_grade=_grade(overall),
        content=draft.content.model_dump(),
    )
    # Persist the composite as the session's headline score so the debrief's grade
    # and "x / 100" agree and the dashboard history reflects real performance.
    session.score = float(overall)
    db.add(debrief)
    db.commit()
    db.refresh(debrief)
    return debrief
