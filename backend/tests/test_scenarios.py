"""Scenario catalog tests."""
from __future__ import annotations


def test_list_scenarios(client):
    r = client.get("/api/scenarios")
    assert r.status_code == 200
    ids = {s["id"] for s in r.json()}
    assert "prod-outage-payments" in ids
    assert len(r.json()) >= 4


def test_scenario_detail(client):
    r = client.get("/api/scenarios/prod-outage-payments")
    assert r.status_code == 200
    body = r.json()
    assert body["archetype"] == "production_outage"
    assert body["objectives"]
    assert body["persona"]["voice_id"]
    assert body["severity"]["start"] >= body["severity"]["win_below"]


def test_scenario_missing(client):
    assert client.get("/api/scenarios/does-not-exist").status_code == 404
