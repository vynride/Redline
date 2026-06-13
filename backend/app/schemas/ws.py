"""WebSocket message schemas for the realtime drill channel."""
from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel

from app.schemas.common import Emotion
from app.schemas.session import SessionState


class EndTurn(BaseModel):
    type: Literal["end_turn"] = "end_turn"


class EndSession(BaseModel):
    type: Literal["end_session"] = "end_session"


class TranscriptMsg(BaseModel):
    type: Literal["transcript"] = "transcript"
    role: Literal["user", "persona"]
    text: str
    emotion: Optional[Emotion] = None


class StateMsg(BaseModel):
    type: Literal["state"] = "state"
    state: SessionState


class TurnComplete(BaseModel):
    type: Literal["turn_complete"] = "turn_complete"
    index: int


class SessionComplete(BaseModel):
    type: Literal["session_complete"] = "session_complete"
    debrief_ready: bool = True


class ErrorMsg(BaseModel):
    type: Literal["error"] = "error"
    detail: str
    code: Optional[str] = None


def dump(msg: BaseModel) -> dict[str, Any]:
    return msg.model_dump(mode="json")
