"""Drill session model — one run of a scenario by a user."""
from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import JSON, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.debrief import Debrief
    from app.models.turn import Turn
    from app.models.user import User


class SessionStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    abandoned = "abandoned"


class DrillSession(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "drill_sessions"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    scenario_id: Mapped[str] = mapped_column(String(80), nullable=False)
    # Snapshot of a generated scenario's full definition, frozen at session start
    # so the live drill is reproducible and independent of the catalog. Null for
    # static (catalog) scenarios, which resolve by ``scenario_id``.
    scenario_json: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    role: Mapped[str] = mapped_column(String(60), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(40), nullable=False)

    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus, native_enum=False, length=20), default=SessionStatus.active, nullable=False
    )

    severity: Mapped[int] = mapped_column(Integer, nullable=False)
    severity_start: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    objectives_met: Mapped[list[str]] = mapped_column(JSON, default=list)
    escalation_timeline: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="sessions")
    turns: Mapped[list["Turn"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="Turn.index"
    )
    debrief: Mapped[Optional["Debrief"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", uselist=False
    )
