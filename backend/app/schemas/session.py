"""Drill session request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict

from app.models.session import SessionStatus
from app.schemas.common import Difficulty, Role
from app.schemas.turn import TurnOut


class SessionCreate(BaseModel):
    scenario_id: str
    role: Role
    difficulty: Difficulty


class SessionState(BaseModel):
    severity: int
    severity_start: int
    confidence: int
    objectives_met: list[str]
    escalation_timeline: list[dict[str, Any]]
    status: SessionStatus


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    scenario_id: str
    role: Role
    difficulty: Difficulty
    status: SessionStatus
    severity: int
    severity_start: int
    confidence: int
    score: Optional[float] = None
    objectives_met: list[str]
    escalation_timeline: list[dict[str, Any]]
    created_at: datetime
    ended_at: Optional[datetime] = None


class SessionDetail(SessionOut):
    turns: list[TurnOut] = []


class SessionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    scenario_id: str
    role: Role
    difficulty: Difficulty
    status: SessionStatus
    score: Optional[float] = None
    created_at: datetime
    ended_at: Optional[datetime] = None
