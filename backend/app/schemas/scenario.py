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

    name: str = Field(max_length=60, description="The persona's full human name as it would be spoken, e.g. 'Alex Chen' — never snake_case.")
    role: str = Field(max_length=40, description="Short snake_case role, e.g. 'angry_customer', 'database_lead'.")
    gender: Literal["female", "male", "neutral"] = Field(
        description="The persona's voice gender, consistent with their name — drives voice selection."
    )
    base_emotion: Emotion = Field(description="The emotion the persona opens the call in.")
    description: str = Field(max_length=240, description="One or two sentences on how they behave under pressure.")


class ScenarioDraft(BaseModel):
    """The creative half of a scenario, authored by the LLM from a user prompt.

    Excludes the server-owned fields (``id`` and ``persona.voice_id``); those are
    assigned in ``scenario_gen`` before the full ``Scenario`` is assembled.
    """

    title: str = Field(max_length=80, description="A short, punchy incident title.")
    archetype: Archetype
    summary: str = Field(max_length=320, description="One or two sentences framing the incident.")
    roles: list[Role] = Field(min_length=1, max_length=3, description="Responder roles this drill supports (1-3).")
    difficulties: list[Difficulty] = Field(min_length=1, max_length=3, description="Difficulty tiers offered (1-3).")
    persona: PersonaDraft
    stakes: str = Field(max_length=320, description="What is at risk — money, trust, safety, deadlines.")
    hidden_facts: list[str] = Field(
        max_length=4, description="Up to 4 facts the responder must uncover by asking; one short sentence each (may be empty)."
    )
    objectives: list[str] = Field(
        min_length=3, max_length=5, description="3-5 concrete things a strong responder accomplishes; one short sentence each."
    )
    severity: SeverityModel
    opening_line: str = Field(
        max_length=400,
        description="The persona's first spoken line — the exact words they say aloud, first person, "
        "tense and in character. No stage directions, no narration (e.g. \"Alex's voice is strained\"), "
        "no surrounding quotation marks, and no name for the responder.",
    )


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
