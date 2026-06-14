"""Render a finished drill's debrief to a polished, self-contained PDF.

The on-screen debrief (``app/(app)/debrief/[sessionId]``) is the source of truth for
layout and tone; this mirrors its sections, labels, and colour coding so a downloaded
report reads like the page it came from. Rendering is HTML → PDF via WeasyPrint, with a
Jinja2 template (``app/templates/debrief.html``) holding the dark Redline styling. The
context is assembled here so the template stays declarative.
"""
from __future__ import annotations

import re
from datetime import datetime
from functools import lru_cache

from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path

from app.models.debrief import Debrief
from app.models.session import DrillSession, SessionStatus
from app.models.turn import Speaker, Turn
from app.schemas.common import Difficulty, Role
from app.schemas.debrief import DebriefContent
from app.schemas.scenario import Scenario

_TEMPLATE_DIR = Path(__file__).resolve().parents[1] / "templates"

# --- Label maps, mirrored from frontend/lib/labels.ts so the PDF reads identically. ---
_ARCHETYPE_LABELS = {
    "production_outage": "Production outage",
    "payment_failure": "Payment failure",
    "security_alert": "Security alert",
    "support_escalation": "Support escalation",
    "broken_release": "Broken release",
    "latency_spike": "Latency spike",
}
_ROLE_LABELS = {
    "on_call_engineer": "On-call engineer",
    "incident_commander": "Incident commander",
    "support_lead": "Support lead",
    "customer_support_agent": "Customer support agent",
    "ops_responder": "Ops responder",
}
_DIFFICULTY_LABELS = {
    "warmup": "Warm-up",
    "production_like": "Production-like",
    "redline": "Redline",
}
# Difficulty → SEV badge, mirrored from frontend/lib/scenarioMeta.ts.
_SEV = {
    "redline": {"label": "SEV-1", "color": "#FB7185", "bg": "rgba(244,63,94,0.12)"},
    "production_like": {"label": "SEV-2", "color": "#FCD34D", "bg": "rgba(251,191,36,0.12)"},
    "warmup": {"label": "SEV-3", "color": "#C4B5FD", "bg": "rgba(139,92,246,0.14)"},
}
_EM_DASH = re.compile(r"\s*—\s*")


def _clean(text: str) -> str:
    """Mirror frontend ``lib/text.clean``: an em dash (+ spaces) becomes ', '.

    The web UI runs every API string through this before display; the PDF renders
    DB content server-side, so it applies the same rule to stay consistent.
    """
    return _EM_DASH.sub(", ", text)


_DIMENSIONS = [
    ("clarity", "Clarity"),
    ("deescalation", "De-escalation"),
    ("info_gathering", "Info gathering"),
    ("escalation", "Escalation"),
    ("status_communication", "Status comms"),
]

# Tone → colour, matching the Tailwind tokens the page uses.
_POSITIVE = "#34D399"  # emerald-400
_NEGATIVE = "#FB7185"  # rose-400
_ACCENT = "#C4B5FD"    # violet-300
_PRIMARY = "#F5F3FF"


def _grade_color(grade: str) -> str:
    if grade[:1] in ("A", "B"):
        return _POSITIVE
    if grade[:1] == "C":
        return _ACCENT
    if grade[:1] == "D":
        return "#FCD34D"  # amber-300
    return _NEGATIVE


def _dim_tone(score: int) -> str:
    if score >= 70:
        return _POSITIVE
    if score >= 40:
        return _ACCENT
    return _NEGATIVE


def _outcome(session: DrillSession, scenario: Scenario | None) -> dict[str, str]:
    """Win / loss / held / ended, derived exactly as the page derives it."""
    if scenario is None:
        return {"label": session.status.value.title(), "color": _ACCENT}
    if session.severity >= scenario.severity.lose_at:
        return {"label": "Lost", "color": _NEGATIVE}
    if session.status == SessionStatus.completed and session.severity < scenario.severity.win_below:
        return {"label": "Resolved", "color": _POSITIVE}
    if session.status == SessionStatus.abandoned:
        return {"label": "Ended early", "color": "#A9A2C4"}
    return {"label": "Held the line", "color": _ACCENT}


def _duration(start: datetime | None, end: datetime | None) -> str:
    if start is None or end is None:
        return "—"
    secs = int((end - start).total_seconds())
    if secs < 0:
        return "—"
    m, s = divmod(secs, 60)
    return f"{m}m {s}s" if m else f"{s}s"


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "debrief"


@lru_cache(maxsize=1)
def _env() -> Environment:
    return Environment(
        loader=FileSystemLoader(str(_TEMPLATE_DIR)),
        autoescape=select_autoescape(["html"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )


def pdf_filename(session: DrillSession, scenario: Scenario | None, *, generated_at: datetime) -> str:
    title = scenario.title if scenario else session.scenario_id
    return f"redline-debrief-{_slugify(title)}-{generated_at:%Y%m%d}.pdf"


def _build_context(
    session: DrillSession,
    debrief: Debrief,
    scenario: Scenario | None,
    turns: list[Turn],
    *,
    generated_at: datetime,
) -> dict:
    content = DebriefContent.model_validate(debrief.content)
    difficulty = session.difficulty
    severity_drop = session.severity_start - session.severity
    objectives_total = len(scenario.objectives) if scenario else 0
    objectives_met = len(session.objectives_met or [])
    user_turns = sum(1 for t in turns if t.speaker == Speaker.user)
    persona_name = scenario.persona.name if scenario else "Persona"

    dims = content.dimension_scores
    dimensions = [
        {"label": label, "score": getattr(dims, key), "color": _dim_tone(getattr(dims, key))}
        for key, label in _DIMENSIONS
    ]

    stats = [
        {
            "label": "Severity",
            "value": f"{session.severity_start} → {session.severity}",
            "color": _POSITIVE if severity_drop > 0 else _NEGATIVE if severity_drop < 0 else _PRIMARY,
        },
        {
            "label": "Objectives",
            "value": f"{objectives_met} / {objectives_total}",
            "color": _POSITIVE if objectives_total and objectives_met == objectives_total else _PRIMARY,
        },
        {"label": "Your turns", "value": str(user_turns), "color": _PRIMARY},
        {"label": "Duration", "value": _duration(session.created_at, session.ended_at), "color": _PRIMARY},
    ]

    transcript = [
        {
            "who": "You" if t.speaker == Speaker.user else persona_name,
            "is_user": t.speaker == Speaker.user,
            "text": _clean(t.text),
        }
        for t in turns
    ]

    lost_control = []
    for m in content.lost_control:
        lost_control.append({"quote": _clean(m.quote), "issue": _clean(m.issue), "better": _clean(m.better)})

    return {
        "scenario_title": _clean(scenario.title if scenario else session.scenario_id),
        "archetype_label": _ARCHETYPE_LABELS.get(scenario.archetype.value, "Incident") if scenario else "Incident",
        "sev": _SEV.get(difficulty, _SEV["warmup"]),
        "role_label": _ROLE_LABELS.get(session.role, Role(session.role).value.replace("_", " ")),
        "difficulty_label": _DIFFICULTY_LABELS.get(difficulty, Difficulty(difficulty).value),
        "outcome": _outcome(session, scenario),
        "grade": debrief.overall_grade,
        "grade_color": _grade_color(debrief.overall_grade),
        "score": round(session.score) if session.score is not None else None,
        "summary": _clean(debrief.summary),
        "stats": stats,
        "dimensions": dimensions,
        "strengths": [_clean(s) for s in content.strengths],
        "lost_control": lost_control,
        "missed_information": [_clean(m) for m in content.missed_information],
        "escalation_assessment": _clean(content.escalation_assessment),
        "status_communication_assessment": _clean(content.status_communication_assessment),
        "transcript": transcript,
        "persona_name": _clean(persona_name),
        "generated_at": f"{generated_at:%d %b %Y}",
    }


def render_debrief_pdf(
    session: DrillSession,
    debrief: Debrief,
    scenario: Scenario | None,
    turns: list[Turn],
    *,
    generated_at: datetime,
) -> bytes:
    """Render the debrief to PDF bytes. CPU-bound — call via a threadpool from async code."""
    from weasyprint import HTML  # imported lazily so the heavy native stack loads on first use

    context = _build_context(session, debrief, scenario, turns, generated_at=generated_at)
    html = _env().get_template("debrief.html").render(**context)
    return HTML(string=html).write_pdf()
