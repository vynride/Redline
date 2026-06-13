"""Scenario definition schemas (authored data loaded from data/scenarios)."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import Archetype, Difficulty, Emotion, Role


class Persona(BaseModel):
    name: str
    role: str = Field(description="Persona role, e.g. 'angry_customer', 'manager'.")
    voice_id: str = Field(description="Bulbul speaker used for this persona.")
    base_emotion: Emotion = Emotion.neutral
    description: str = Field(default="", description="How the persona behaves.")


class SeverityModel(BaseModel):
    start: int = Field(ge=0, le=10)
    max: int = Field(default=10, ge=1, le=10)
    win_below: int = Field(ge=0, le=10)
    lose_at: int = Field(default=10, ge=1, le=10)


class Scenario(BaseModel):
    id: str
    title: str
    archetype: Archetype
    summary: str
    roles: list[Role]
    difficulties: list[Difficulty]
    persona: Persona
    stakes: str
    hidden_facts: list[str] = Field(default_factory=list)
    objectives: list[str]
    severity: SeverityModel
    opening_line: str = Field(description="The persona's first spoken line.")


class PersonaDraft(BaseModel):
    """Persona fields an LLM authors — excludes the server-assigned voice id."""

    name: str = Field(description="The persona's full name.")
    role: str = Field(description="Short snake_case role, e.g. 'angry_customer', 'database_lead'.")
    gender: Literal["female", "male", "neutral"] = Field(
        description="The persona's voice gender, consistent with their name — drives voice selection."
    )
    base_emotion: Emotion = Field(description="The emotion the persona opens the call in.")
    description: str = Field(description="One or two sentences on how they behave under pressure.")


class ScenarioDraft(BaseModel):
    """The creative half of a scenario, authored by the LLM from a user prompt.

    Excludes the server-owned fields (``id`` and ``persona.voice_id``); those are
    assigned in ``scenario_gen`` before the full ``Scenario`` is assembled.
    """

    title: str = Field(description="A short, punchy incident title.")
    archetype: Archetype
    summary: str = Field(description="One or two sentences framing the incident.")
    roles: list[Role] = Field(description="Responder roles this drill supports (1-3).")
    difficulties: list[Difficulty] = Field(description="Difficulty tiers offered (1-3).")
    persona: PersonaDraft
    stakes: str = Field(description="What is at risk — money, trust, safety, deadlines.")
    hidden_facts: list[str] = Field(description="Facts the responder must uncover by asking (may be empty).")
    objectives: list[str] = Field(description="3-5 concrete things a strong responder accomplishes.")
    severity: SeverityModel
    opening_line: str = Field(description="The persona's first spoken line — tense and in character.")


class ScenarioSummary(BaseModel):
    id: str
    title: str
    archetype: Archetype
    summary: str
    roles: list[Role]
    difficulties: list[Difficulty]
    persona_role: str

    @classmethod
    def from_scenario(cls, s: "Scenario") -> "ScenarioSummary":
        return cls(id=s.id, title=s.title, archetype=s.archetype, summary=s.summary,
                   roles=s.roles, difficulties=s.difficulties, persona_role=s.persona.role)
