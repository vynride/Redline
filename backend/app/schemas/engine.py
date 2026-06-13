"""Structured output contract for the scenario engine's LLM call."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import Emotion


class TurnEval(BaseModel):
    clarity: int = Field(ge=0, le=5)
    deescalation: int = Field(ge=0, le=5)
    info_gathering: int = Field(ge=0, le=5)
    note: str = Field(default="", description="One-line coaching note for this turn.")


class EngineTurnOutput(BaseModel):
    utterance: str = Field(description="What the persona says next, spoken aloud.")
    emotion: Emotion = Emotion.neutral
    severity_delta: int = Field(default=0, ge=-3, le=3)
    confidence_delta: int = Field(default=0, ge=-20, le=20)
    objectives_met: list[str] = Field(default_factory=list)
    escalation_event: Optional[str] = Field(default=None)
    turn_eval: TurnEval
    session_should_end: bool = Field(default=False)
