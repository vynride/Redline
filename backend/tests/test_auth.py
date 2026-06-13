"""Auth flow tests."""
from __future__ import annotations


def test_register_returns_token_and_user(client):
    r = client.post("/api/auth/register", json={
        "email": "a@b.com", "password": "password123", "display_name": "Ava"})
    assert r.status_code == 201
    body = r.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == "a@b.com"


def test_register_rejects_duplicate(client):
    payload = {"email": "a@b.com", "password": "password123", "display_name": "Ava"}
    assert client.post("/api/auth/register", json=payload).status_code == 201
    assert client.post("/api/auth/register", json=payload).status_code == 409


def test_register_validates_short_password(client):
    r = client.post("/api/auth/register", json={
        "email": "a@b.com", "password": "short", "display_name": "Ava"})
    assert r.status_code == 422


def test_login_succeeds_and_rejects_bad_password(client):
    client.post("/api/auth/register", json={
        "email": "a@b.com", "password": "password123", "display_name": "Ava"})
    assert client.post("/api/auth/login", json={"email": "a@b.com", "password": "password123"}).status_code == 200
    assert client.post("/api/auth/login", json={"email": "a@b.com", "password": "wrongpass"}).status_code == 401


def test_me_requires_authentication(client, auth_headers):
    assert client.get("/api/auth/me").status_code == 401
    me = client.get("/api/auth/me", headers=auth_headers)
    assert me.status_code == 200
    assert me.json()["email"] == "drill@example.com"
