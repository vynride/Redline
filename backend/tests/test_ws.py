"""Drill WebSocket handshake — auth via the first frame."""
from __future__ import annotations

import pytest

from app.api import ws as ws_module


@pytest.fixture
def ws_client(client, db_session, monkeypatch):
    monkeypatch.setattr(ws_module, "SessionLocal", lambda: db_session)
    monkeypatch.setattr(ws_module, "_AUTH_TIMEOUT_S", 0.2)
    return client


def _token(auth_headers) -> str:
    return auth_headers["Authorization"].removeprefix("Bearer ")


def test_query_string_token_is_not_accepted(ws_client, auth_headers):
    with ws_client.websocket_connect(f"/ws/session/nope?token={_token(auth_headers)}") as ws:
        assert ws.receive_json()["code"] == "unauthorized"


def test_garbage_auth_frame_is_rejected(ws_client):
    with ws_client.websocket_connect("/ws/session/nope") as ws:
        ws.send_json({"type": "auth", "token": "not-a-jwt"})
        assert ws.receive_json()["code"] == "unauthorized"


def test_auth_frame_authenticates(ws_client, auth_headers):
    with ws_client.websocket_connect("/ws/session/nope") as ws:
        ws.send_json({"type": "auth", "token": _token(auth_headers)})
        # Authenticated, so it gets as far as the ownership lookup.
        assert ws.receive_json()["code"] == "not_found"
