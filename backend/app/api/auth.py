"""Authentication routes — OAuth login (Google, GitHub) and current user.

The login flow is the standard server-side Authorization Code dance:

1. ``GET /api/auth/{provider}/login`` redirects the browser to the provider and
   stores a random ``state`` in an httpOnly cookie (CSRF protection).
2. The provider redirects back to ``GET /api/auth/{provider}/callback`` with a
   ``code``; we verify ``state``, exchange the code, upsert the user, mint a JWT,
   and redirect to the frontend ``/auth/callback`` with the token in the query.
"""
from __future__ import annotations

import secrets
from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token
from app.db import get_db
from app.models.user import User
from app.schemas.auth import UserOut
from app.services import oauth

router = APIRouter(prefix="/api/auth", tags=["auth"])

_STATE_COOKIE = "redline_oauth_state"


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)) -> User:
    return current


@router.get("/{provider}/login")
def oauth_login(provider: str) -> RedirectResponse:
    try:
        cfg = oauth.get_provider(provider)
    except oauth.OAuthError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    state = secrets.token_urlsafe(32)
    redirect = RedirectResponse(oauth.authorize_url(cfg, state))
    redirect.set_cookie(
        _STATE_COOKIE,
        state,
        max_age=600,
        httponly=True,
        samesite="lax",
        secure=settings.environment != "development",
    )
    return redirect


@router.get("/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    error: Optional[str] = Query(default=None),
    oauth_state: Optional[str] = Cookie(default=None, alias=_STATE_COOKIE),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    if error or not code:
        return _frontend_redirect(error=error or "access_denied")
    if not state or not oauth_state or not secrets.compare_digest(state, oauth_state):
        return _frontend_redirect(error="invalid_state")
    try:
        cfg = oauth.get_provider(provider)
        profile = await oauth.exchange_and_fetch(cfg, code)
    except oauth.OAuthError:
        return _frontend_redirect(error="oauth_failed")

    user = _upsert_user(db, profile)
    redirect = _frontend_redirect(token=create_access_token(subject=user.id))
    redirect.delete_cookie(_STATE_COOKIE)
    return redirect


def _upsert_user(db: Session, profile: oauth.OAuthUser) -> User:
    """Find the account by stable provider identity, then by email (linking), else create."""
    user = db.scalar(
        select(User).where(
            User.provider == profile.provider,
            User.provider_account_id == profile.account_id,
        )
    )
    if user is None:
        user = db.scalar(select(User).where(User.email == profile.email))
    if user is None:
        user = User(
            provider=profile.provider,
            provider_account_id=profile.account_id,
            email=profile.email,
            display_name=profile.display_name,
            avatar_url=profile.avatar_url,
        )
        db.add(user)
    else:
        # Refresh the mutable profile fields; identity and email stay stable.
        user.display_name = profile.display_name or user.display_name
        user.avatar_url = profile.avatar_url or user.avatar_url
    db.commit()
    db.refresh(user)
    return user


def _frontend_redirect(*, token: Optional[str] = None, error: Optional[str] = None) -> RedirectResponse:
    query = f"?token={token}" if token else f"?error={error}"
    return RedirectResponse(f"{settings.frontend_url}/auth/callback{query}")
