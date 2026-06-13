"""Scenario definition schemas (authored data loaded from data/scenarios)."""
from __future__ import annotations

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
