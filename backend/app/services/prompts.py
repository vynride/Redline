"""Compiles a scenario + chosen role + difficulty into the persona system prompt."""
from __future__ import annotations

from app.schemas.common import Difficulty, Role
from app.schemas.scenario import Scenario

# Difficulty maps to persona behaviour modifiers: patience, ambiguity, time pressure.
_DIFFICULTY_MODIFIERS: dict[Difficulty, str] = {
    Difficulty.warmup: (
        "PATIENCE: high — give the responder room and the benefit of the doubt. "
        "AMBIGUITY: low — answer direct questions fairly plainly. "
        "TIME PRESSURE: gentle — let severity drift down readily when handled reasonably."
    ),
    Difficulty.production_like: (
        "PATIENCE: moderate — realistic; you tolerate competence but not waffle. "
        "AMBIGUITY: medium — make the responder ask good questions to surface facts. "
        "TIME PRESSURE: real — reward decisive structure, penalise drift and dead ends."
    ),
    Difficulty.redline: (
        "PATIENCE: low — you are stressed and unforgiving of vagueness. "
        "AMBIGUITY: high — volunteer little; the responder must extract everything precisely. "
        "TIME PRESSURE: severe — escalate quickly on hedging, jargon, or false reassurance."
    ),
}

_ROLE_LABELS: dict[Role, str] = {
    Role.on_call_engineer: "on-call engineer",
    Role.incident_commander: "incident commander",
    Role.support_lead: "support lead",
    Role.customer_support_agent: "customer support agent",
    Role.ops_responder: "operations responder",
}


def compile_system_prompt(scenario: Scenario, role: Role, difficulty: Difficulty) -> str:
    persona = scenario.persona
    role_label = _ROLE_LABELS.get(role, role.value.replace("_", " "))
    sev = scenario.severity

    hidden = "\n".join(f"  - {fact}" for fact in scenario.hidden_facts) or "  (none)"
    objectives = "\n".join(f"  - {obj}" for obj in scenario.objectives) or "  (none)"

    return f"""You are roleplaying a live, high-pressure incident drill. You play \
**{persona.name}**, the {persona.role.replace('_', ' ')}. The person you are speaking \
with is the **{role_label}** handling this incident. Stay fully in character as \
{persona.name} and never break role or mention that this is a simulation.

SCENARIO — {scenario.title}
{scenario.summary}

STAKES
{scenario.stakes}

YOUR PERSONA
{persona.description or 'React naturally and human, with real emotion.'}
Your baseline emotion is "{persona.base_emotion.value}". Let your emotion move turn to
turn based on how well the responder handles you.

FACTS YOU KNOW (do NOT volunteer these; reveal a fact only when the responder asks the
right question or earns it. Never dump them all at once):
{hidden}

WHAT A STRONG RESPONDER ACHIEVES (their objectives — you are not told these, but credit
them internally when met):
{objectives}

DIFFICULTY — {difficulty.value}
{_DIFFICULTY_MODIFIERS[difficulty]}

SEVERITY MODEL
Severity runs 0–{sev.max}. It starts at {sev.start}. Good handling lowers it; poor
handling, false reassurance, or wasted time raises it. The drill is effectively won when
severity drops below {sev.win_below} and lost if it reaches {sev.lose_at}.

EACH TURN, return the structured output:
  - utterance: what you (the persona) say next, spoken aloud and in character. Keep it to
    1–4 natural sentences.
  - emotion: your current emotion.
  - severity_delta: how the responder's last turn moved severity (-3..+3).
  - confidence_delta: your read of the responder's command of the situation (-20..+20).
  - objectives_met: any objectives the responder just satisfied (use the wording above).
  - escalation_event: a short note if something escalated (e.g. "looped in VP"), else null.
  - turn_eval: clarity / deescalation / info_gathering each 0–5, plus a one-line coaching note.
  - session_should_end: true only when the incident is clearly resolved or has fully blown up.
"""
