"""OAuth provider integration — Google and GitHub Authorization Code flow.

Each provider exposes an *authorize* URL (where we send the browser), a *token*
URL (where we exchange the returned ``code`` for an access token), and a
*userinfo* endpoint. We normalize each provider's response into ``OAuthUser`` and
never persist provider tokens — once the identity is confirmed the caller mints
its own JWT.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlencode

import httpx

from app.core.config import settings


class OAuthError(Exception):
    """Raised when a provider exchange or userinfo lookup fails."""


@dataclass(frozen=True)
class OAuthUser:
    """Normalized identity returned by a provider."""

    provider: str
    account_id: str
    email: str
    display_name: str
    avatar_url: Optional[str]


@dataclass(frozen=True)
class ProviderConfig:
    name: str
    client_id: str
    client_secret: str
    authorize_url: str
    token_url: str
    scope: str


def _providers() -> dict[str, ProviderConfig]:
    return {
        "google": ProviderConfig(
            name="google",
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
            token_url="https://oauth2.googleapis.com/token",
            scope="openid email profile",
        ),
        "github": ProviderConfig(
            name="github",
            client_id=settings.github_client_id,
            client_secret=settings.github_client_secret,
            authorize_url="https://github.com/login/oauth/authorize",
            token_url="https://github.com/login/oauth/access_token",
            scope="read:user user:email",
        ),
    }


def get_provider(name: str) -> ProviderConfig:
    """Return the config for ``name`` or raise ``OAuthError`` if unknown/unconfigured."""
    provider = _providers().get(name)
    if provider is None:
        raise OAuthError(f"Unknown provider '{name}'.")
    if not provider.client_id or not provider.client_secret:
        raise OAuthError(f"Provider '{name}' is not configured.")
    return provider


def callback_url(provider_name: str) -> str:
    """The redirect URI registered with the provider, derived from the backend base."""
    return f"{settings.oauth_redirect_base}/api/auth/{provider_name}/callback"


def authorize_url(provider: ProviderConfig, state: str) -> str:
    """Build the provider consent URL the browser is redirected to."""
    params = {
        "client_id": provider.client_id,
        "redirect_uri": callback_url(provider.name),
        "response_type": "code",
        "scope": provider.scope,
        "state": state,
    }
    if provider.name == "google":
        params["access_type"] = "offline"
        params["prompt"] = "select_account"
    return f"{provider.authorize_url}?{urlencode(params)}"


async def exchange_and_fetch(provider: ProviderConfig, code: str) -> OAuthUser:
    """Exchange the auth ``code`` for a token and return the normalized identity."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        access_token = await _exchange_code(client, provider, code)
        if provider.name == "google":
            return await _google_user(client, access_token)
        return await _github_user(client, access_token)


async def _exchange_code(client: httpx.AsyncClient, provider: ProviderConfig, code: str) -> str:
    resp = await client.post(
        provider.token_url,
        data={
            "client_id": provider.client_id,
            "client_secret": provider.client_secret,
            "code": code,
            "redirect_uri": callback_url(provider.name),
            "grant_type": "authorization_code",
        },
        headers={"Accept": "application/json"},
    )
    if resp.status_code != 200:
        raise OAuthError(f"Token exchange failed ({resp.status_code}).")
    access_token = resp.json().get("access_token")
    if not access_token:
        raise OAuthError("Provider did not return an access token.")
    return access_token


async def _google_user(client: httpx.AsyncClient, access_token: str) -> OAuthUser:
    resp = await client.get(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if resp.status_code != 200:
        raise OAuthError("Failed to fetch Google profile.")
    data = resp.json()
    email = data.get("email")
    if not email or not data.get("email_verified", True):
        raise OAuthError("Google account has no verified email.")
    return OAuthUser(
        provider="google",
        account_id=str(data["sub"]),
        email=email.lower(),
        display_name=data.get("name") or email.split("@")[0],
        avatar_url=data.get("picture"),
    )


async def _github_user(client: httpx.AsyncClient, access_token: str) -> OAuthUser:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    resp = await client.get("https://api.github.com/user", headers=headers)
    if resp.status_code != 200:
        raise OAuthError("Failed to fetch GitHub profile.")
    data = resp.json()
    email = data.get("email") or await _github_primary_email(client, headers)
    if not email:
        raise OAuthError("GitHub account has no accessible verified email.")
    return OAuthUser(
        provider="github",
        account_id=str(data["id"]),
        email=email.lower(),
        display_name=data.get("name") or data.get("login") or email.split("@")[0],
        avatar_url=data.get("avatar_url"),
    )


async def _github_primary_email(client: httpx.AsyncClient, headers: dict[str, str]) -> Optional[str]:
    """GitHub omits a private primary email from /user — fetch it from /user/emails."""
    resp = await client.get("https://api.github.com/user/emails", headers=headers)
    if resp.status_code != 200:
        return None
    emails = resp.json()
    primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
    verified = primary or next((e for e in emails if e.get("verified")), None)
    return verified["email"] if verified else None
