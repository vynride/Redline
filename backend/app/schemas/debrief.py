"""Debrief (coaching report) schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DimensionScores(BaseModel):
    clarity: int = Field(ge=0, le=100)
    deescalation: int = Field(ge=0, le=100)
    info_gathering: int = Field(ge=0, le=100)
    escalation: int = Field(ge=0, le=100)
    status_communication: int = Field(ge=0, le=100)


class LostControlMoment(BaseModel):
    quote: str
    issue: str
    better: str


class DebriefContent(BaseModel):
    strengths: list[str]
    lost_control: list[LostControlMoment]
    missed_information: list[str]
    escalation_assessment: str
    status_communication_assessment: str
    dimension_scores: DimensionScores


class DebriefOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    session_id: str
    summary: str
    overall_grade: str
    content: DebriefContent
    created_at: datetime
