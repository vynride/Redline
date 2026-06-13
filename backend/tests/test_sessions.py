"""Session lifecycle tests."""
from __future__ import annotations

VALID = {"scenario_id": "prod-outage-payments", "role": "on_call_engineer", "difficulty": "production_like"}


def test_create_session_seeds_opening_turn(client, auth_headers):
    r = client.post("/api/sessions", json=VALID, headers=auth_headers)
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "active"
    assert body["severity"] == body["severity_start"] == 8
    assert body["confidence"] == 50

    detail = client.get(f"/api/sessions/{body['id']}", headers=auth_headers).json()
    assert len(detail["turns"]) == 1
    assert detail["turns"][0]["speaker"] == "persona"


def test_create_rejects_bad_role_and_scenario(client, auth_headers):
    bad_role = {**VALID, "role": "support_lead"}
    assert client.post("/api/sessions", json=bad_role, headers=auth_headers).status_code == 422
    bad_scenario = {**VALID, "scenario_id": "nope"}
    assert client.post("/api/sessions", json=bad_scenario, headers=auth_headers).status_code == 404


def test_session_requires_auth(client):
    assert client.get("/api/sessions").status_code == 401
    assert client.post("/api/sessions", json=VALID).status_code == 401


def test_session_list_and_ownership(client, auth_headers):
    sid = client.post("/api/sessions", json=VALID, headers=auth_headers).json()["id"]
    listed = client.get("/api/sessions", headers=auth_headers)
    assert listed.status_code == 200
    assert any(s["id"] == sid for s in listed.json())

    other = client.post("/api/auth/register", json={
        "email": "other@b.com", "password": "password123", "display_name": "Bo"}).json()
    other_headers = {"Authorization": f"Bearer {other['access_token']}"}
    assert client.get(f"/api/sessions/{sid}", headers=other_headers).status_code == 404


def test_debrief_conflicts_while_active(client, auth_headers):
    sid = client.post("/api/sessions", json=VALID, headers=auth_headers).json()["id"]
    assert client.get(f"/api/sessions/{sid}/debrief", headers=auth_headers).status_code == 409
