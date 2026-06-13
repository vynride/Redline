"""Turn read schema."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict

from app.models.turn import Speaker


class TurnOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    index: int
    speaker: Speaker
    text: str
    emotion: Optional[str] = None
    severity_after: Optional[int] = None
    confidence_after: Optional[int] = None
    evaluation: Optional[dict[str, Any]] = None
    created_at: datetime
