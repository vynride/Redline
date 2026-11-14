"""Auth flow tests — OAuth login and current-user resolution."""
from __future__ import annotations

import httpx
import pytest
from sqlalchemy import select

from app.core.config import Settings
from app.models.user import User
from app.services import oauth


def test_me_requires_authentication(client, auth_headers):
    assert client.get("/api/auth/me").status_code == 401
    me = client.get("/api/auth/me", headers=auth_headers)
    assert me.status_code == 200
    assert me.json()["email"] == "drill@example.com"


def test_login_redirects_to_provider(client, monkeypatch):
    monkeypatch.setattr(oauth.settings, "google_client_id", "gid", raising=False)
    monkeypatch.setattr(oauth.settings, "google_client_secret", "gsecret", raising=False)
    r = client.get("/api/auth/google/login", follow_redirects=False)
    assert r.status_code == 307
    assert r.headers["location"].startswith("https://accounts.google.com/o/oauth2/v2/auth")
    assert "redline_oauth_state" in r.headers.get("set-cookie", "")


def test_login_unknown_provider_404(client):
    assert client.get("/api/auth/myspace/login", follow_redirects=False).status_code == 404


def test_login_unconfigured_provider_404(client, monkeypatch):
    monkeypatch.setattr(oauth.settings, "github_client_id", "", raising=False)
    monkeypatch.setattr(oauth.settings, "github_client_secret", "", raising=False)
    assert client.get("/api/auth/github/login", follow_redirects=False).status_code == 404


def test_callback_rejects_bad_state(client):
    # No state cookie set → state mismatch → bounced back to the frontend with an error.
    r = client.get("/api/auth/google/callback?code=abc&state=xyz", follow_redirects=False)
    assert r.status_code == 307
    assert "error=invalid_state" in r.headers["location"]


def test_callback_creates_user_and_issues_token(client, db_session, monkeypatch):
    monkeypatch.setattr(oauth.settings, "google_client_id", "gid", raising=False)
    monkeypatch.setattr(oauth.settings, "google_client_secret", "gsecret", raising=False)

    profile = oauth.OAuthUser(provider="google", account_id="sub-123",
                              email="new@example.com", display_name="New User", avatar_url=None)

    async def fake_exchange(_cfg, code):
        assert code == "the-code"
        return profile

    monkeypatch.setattr(oauth, "exchange_and_fetch", fake_exchange)

    client.cookies.set("redline_oauth_state", "matching-state")
    r = client.get("/api/auth/google/callback?code=the-code&state=matching-state", follow_redirects=False)
    assert r.status_code == 307
    location = r.headers["location"]
    assert "#token=" in location and "?token=" not in location
    assert db_session.scalar(select(User).where(User.email == "new@example.com")) is not None


# --- OAuth email handling and production settings ---------------------------------


def _json_transport(routes):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=routes[request.url.path])
    return httpx.MockTransport(handler)


@pytest.mark.asyncio
async def test_google_rejects_missing_email_verified_flag():
    transport = _json_transport({"/v1/userinfo": {"sub": "1", "email": "victim@example.com"}})
    async with httpx.AsyncClient(transport=transport) as c:
        with pytest.raises(oauth.OAuthError):
            await oauth._google_user(c, "tok")


@pytest.mark.asyncio
async def test_github_ignores_unverified_public_email():
    transport = _json_transport({
        "/user": {"id": 7, "login": "eve", "email": "victim@example.com"},
        "/user/emails": [{"email": "eve@example.com", "primary": True, "verified": True}],
    })
    async with httpx.AsyncClient(transport=transport) as c:
        user = await oauth._github_user(c, "tok")
    assert user.email == "eve@example.com"


def test_production_refuses_default_jwt_secret():
    with pytest.raises(ValueError, match="JWT_SECRET"):
        Settings(_env_file=None, environment="production",
                 database_url="postgresql+psycopg2://u:p@h/db")


def test_production_accepts_strong_config():
    s = Settings(_env_file=None, environment="production", jwt_secret="x" * 64,
                 database_url="postgresql+psycopg2://u:p@h/db", cors_origins="https://example.com")
    assert s.is_production
