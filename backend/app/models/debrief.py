"""Debrief model — the post-session coaching report."""
from __future__ import annotations

from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.session import DrillSession


class Debrief(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "debriefs"

    session_id: Mapped[str] = mapped_column(ForeignKey("drill_sessions.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    overall_grade: Mapped[str] = mapped_column(String(4), nullable=False)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)

    session: Mapped["DrillSession"] = relationship(back_populates="debrief")
