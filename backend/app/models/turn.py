"""Conversation turn model — one user or persona utterance in a session."""
from __future__ import annotations

import enum
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import JSON, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.session import DrillSession


class Speaker(str, enum.Enum):
    user = "user"
    persona = "persona"


class Turn(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "turns"

    session_id: Mapped[str] = mapped_column(ForeignKey("drill_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    index: Mapped[int] = mapped_column(Integer, nullable=False)
    speaker: Mapped[Speaker] = mapped_column(Enum(Speaker, native_enum=False, length=10), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    emotion: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    severity_after: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    confidence_after: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    evaluation: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)

    session: Mapped["DrillSession"] = relationship(back_populates="turns")
