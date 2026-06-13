"""Author a custom drill scenario from a user's prompt via the LLM.

The model fills the creative half (``ScenarioDraft``); this module assigns the
server-owned fields (id, persona voice), sanity-checks the severity model, and
persists a per-user ``GeneratedScenario`` row. The returned ``Scenario`` is the
same shape as the static catalog, so the rest of the app treats it identically.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.models.base import new_uuid
from app.models.generated_scenario import GeneratedScenario
from app.models.user import User
from app.schemas.scenario import Persona, Scenario, ScenarioDraft, SeverityModel
from app.services.llm import ChatMessage, LLMClient

log = get_logger("redline.scenario_gen")

# Bulbul speakers reused from the authored catalog, split by gender so a persona always
# sounds the way their name reads. One is picked deterministically per persona name.
_VOICES_BY_GENDER = {
    "female": ["priya", "neha", "kavya", "shreya"],
    "male": ["aditya", "rahul", "rohan", "amit"],
}
# Neutral / unspecified personas draw from the whole pool.
_VOICE_POOL_NEUTRAL = _VOICES_BY_GENDER["female"] + _VOICES_BY_GENDER["male"]

_SYSTEM = """You are a scenario designer for Redline, a voice-based crisis-drill trainer. \
A user describes an incident they want to practise handling; you author ONE realistic, \
self-contained training scenario from it.

The user plays a responder (on-call engineer, incident commander, support lead, etc.). \
The persona you write is the OTHER side of the call — a stressed stakeholder, customer, \
or teammate the responder must calm, inform, and satisfy under pressure.

Make it concrete and tense, not generic:
- Pick the archetype that best fits the prompt.
- Write a persona with a real name, a snake_case role, an opening emotion, and a short \
behaviour note. Their opening_line should drop the responder straight into the moment. \
Set the persona's gender ("female", "male", or "neutral") so it reads consistently with \
their name — this picks the voice they're heard in.
- Give 3-5 sharp, checkable objectives (e.g. "Acknowledge impact within the first reply", \
"Commit to a concrete next update time").
- Add a few hidden_facts the responder can only learn by asking good questions.
- Set a severity model: start (0-10, how bad it begins), max (usually 10), win_below \
(responder wins if they drive severity under this), lose_at (auto-fail at or above this). \
Keep win_below < lose_at.
- Offer 1-3 responder roles and 1-3 difficulty tiers that make sense for the incident.

Stay grounded and professional. Do not invent the responder's lines — only the setup and \
the persona's opening line."""


def _pick_voice(name: str, gender: str) -> str:
    """Deterministically pick a Bulbul voice matching the persona's gender."""
    pool = _VOICES_BY_GENDER.get(gender, _VOICE_POOL_NEUTRAL)
    return pool[sum(map(ord, name or "x")) % len(pool)]


def _sane_severity(s: SeverityModel) -> SeverityModel:
    mx = min(max(s.max, 1), 10)
    start = min(max(s.start, 0), mx)
    lose_at = min(max(s.lose_at, 1), mx)
    win_below = min(max(s.win_below, 0), mx)
    if win_below >= lose_at:  # keep a winnable band below the fail line
        win_below = max(lose_at - 1, 0)
    return SeverityModel(start=start, max=mx, win_below=win_below, lose_at=lose_at)


def _assemble(draft: ScenarioDraft) -> Scenario:
    roles = list(dict.fromkeys(draft.roles)) or None
    difficulties = list(dict.fromkeys(draft.difficulties)) or None
    return Scenario(
        id=new_uuid(),
        title=draft.title.strip(),
        archetype=draft.archetype,
        summary=draft.summary.strip(),
        roles=roles or draft.roles,
        difficulties=difficulties or draft.difficulties,
        persona=Persona(
            name=draft.persona.name.strip(),
            role=draft.persona.role.strip(),
            voice_id=_pick_voice(draft.persona.name, draft.persona.gender),
            base_emotion=draft.persona.base_emotion,
            description=draft.persona.description.strip(),
        ),
        stakes=draft.stakes.strip(),
        hidden_facts=[f.strip() for f in draft.hidden_facts if f.strip()],
        objectives=[o.strip() for o in draft.objectives if o.strip()],
        severity=_sane_severity(draft.severity),
        opening_line=draft.opening_line.strip(),
    )


async def generate_scenario(*, db: Session, user: User, prompt: str, llm: LLMClient) -> Scenario:
    """Generate, validate, persist, and return a custom scenario for ``user``."""
    messages: list[ChatMessage] = [
        {"role": "user", "content": f"Design a crisis drill from this prompt:\n\n{prompt}"}
    ]
    draft = await llm.generate(system=_SYSTEM, messages=messages, response_schema=ScenarioDraft)
    scenario = _assemble(draft)

    row = GeneratedScenario(
        id=scenario.id,
        user_id=user.id,
        prompt=prompt,
        title=scenario.title,
        archetype=scenario.archetype.value,
        scenario_json=scenario.model_dump(mode="json"),
    )
    db.add(row)
    db.commit()
    log.info("generated scenario %s for user %s", scenario.id, user.id)
    return scenario
