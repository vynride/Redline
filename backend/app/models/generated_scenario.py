"""LLM-generated scenario — a custom drill authored from a user's prompt.

Owned by the user who generated it. The full validated ``Scenario`` payload is
stored as JSON; ``title``/``archetype`` are denormalised for cheap listing.
"""
from __future__ import annotations

from typing import Any

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base
from app.models.base import TimestampMixin, UUIDMixin


class GeneratedScenario(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "generated_scenarios"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    archetype: Mapped[str] = mapped_column(String(40), nullable=False)
    scenario_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
