"""User account model.

Accounts are created through OAuth (Google or GitHub). ``provider`` /
``provider_account_id`` record the identity that first created the account;
``email`` is the stable link key, so a returning user who signs in with a
different provider but the same verified email lands on the same account.
"""
from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.session import DrillSession


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("provider", "provider_account_id", name="uq_users_provider_account"),
    )

    provider: Mapped[str] = mapped_column(String(20), nullable=False)
    provider_account_id: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    sessions: Mapped[list["DrillSession"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="DrillSession.created_at.desc()",
    )
