"""Leaderboard response schema — one ranked row per user."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    rank: int
    user_id: str
    display_name: str
    avatar_url: Optional[str] = None
    points: float
    drills: int
