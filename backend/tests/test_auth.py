"""Auth flow tests — OAuth login and current-user resolution."""
from __future__ import annotations

from sqlalchemy import select

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
    assert "token=" in r.headers["location"]
    assert db_session.scalar(select(User).where(User.email == "new@example.com")) is not None
