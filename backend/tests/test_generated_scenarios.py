"""Custom scenario generation — author from a prompt, then drill on it."""
from __future__ import annotations

import pytest

from app.main import app
from app.models.generated_scenario import GeneratedScenario
from app.schemas.common import Archetype, Difficulty, Emotion, Role
from app.schemas.scenario import PersonaDraft, ScenarioDraft, SeverityModel
from app.services.llm import get_llm_client


class FakeScenarioLLM:
    """Returns a fixed ScenarioDraft, standing in for the Sarvam structured call."""

    def __init__(self, draft: ScenarioDraft) -> None:
        self.draft = draft

    async def generate(self, *, system, messages, response_schema):
        assert response_schema is ScenarioDraft
        return self.draft


def _draft(**over) -> ScenarioDraft:
    base = ScenarioDraft(
        title="Checkout queue meltdown",
        archetype=Archetype.production_outage,
        summary="The checkout queue is backing up and orders are failing.",
        roles=[Role.on_call_engineer, Role.incident_commander],
        difficulties=[Difficulty.production_like, Difficulty.redline],
        persona=PersonaDraft(
            name="Dana Reyes", role="head_of_payments", gender="female",
            base_emotion=Emotion.urgent, description="Anxious, wants concrete ETAs.",
        ),
        stakes="Revenue is dropping every minute the queue is stuck.",
        hidden_facts=["A deploy 20 minutes ago changed the queue worker count"],
        objectives=["Acknowledge impact", "Commit to a next-update time", "Find the trigger"],
        severity=SeverityModel(start=7, max=10, win_below=4, lose_at=9),
        opening_line="We are bleeding orders — what is going on?",
    )
    return base.model_copy(update=over) if over else base


@pytest.fixture
def fake_llm():
    def _set(draft: ScenarioDraft) -> None:
        app.dependency_overrides[get_llm_client] = lambda: FakeScenarioLLM(draft)
    yield _set
    app.dependency_overrides.pop(get_llm_client, None)


def test_generate_returns_complete_scenario(client, auth_headers, fake_llm, db_session):
    fake_llm(_draft())
    r = client.post("/api/generated-scenarios", json={"prompt": "checkout is failing"}, headers=auth_headers)
    assert r.status_code == 201, r.text
    sc = r.json()
    assert sc["id"] and sc["title"] == "Checkout queue meltdown"
    assert sc["objectives"] and sc["opening_line"]
    assert sc["persona"]["voice_id"]  # server-assigned
    assert sc["severity"]["win_below"] < sc["severity"]["lose_at"]

    # Persisted per-user.
    row = db_session.get(GeneratedScenario, sc["id"])
    assert row is not None and row.user_id


def test_generate_requires_auth(client, fake_llm):
    fake_llm(_draft())
    assert client.post("/api/generated-scenarios", json={"prompt": "anything"}).status_code == 401


def test_generate_rejects_empty_prompt(client, auth_headers, fake_llm):
    fake_llm(_draft())
    assert client.post("/api/generated-scenarios", json={"prompt": "  "}, headers=auth_headers).status_code == 422


def test_can_drill_on_generated_scenario(client, auth_headers, fake_llm):
    fake_llm(_draft())
    sc = client.post("/api/generated-scenarios", json={"prompt": "checkout is failing"}, headers=auth_headers).json()

    create = client.post(
        "/api/sessions",
        json={"scenario_id": sc["id"], "role": "on_call_engineer", "difficulty": "production_like"},
        headers=auth_headers,
    )
    assert create.status_code == 201, create.text
    sid = create.json()["id"]

    detail = client.get(f"/api/sessions/{sid}", headers=auth_headers).json()
    assert detail["turns"][0]["text"] == sc["opening_line"]  # snapshot drove the opening turn

    # The drill page resolves the scenario via the session, not the static catalog —
    # a generated id isn't in /api/scenarios, but the per-session snapshot resolves it.
    assert client.get(f"/api/scenarios/{sc['id']}", headers=auth_headers).status_code == 404
    resolved = client.get(f"/api/sessions/{sid}/scenario", headers=auth_headers)
    assert resolved.status_code == 200, resolved.text
    assert resolved.json()["id"] == sc["id"]
    assert resolved.json()["opening_line"] == sc["opening_line"]


def test_generate_is_rate_limited(client, auth_headers, fake_llm):
    fake_llm(_draft())
    # The endpoint is capped at 10/minute per user (LLM cost). The keyed user gets a
    # fresh bucket (unique UUID subject), so the 11th call in the window is throttled.
    codes = [
        client.post(
            "/api/generated-scenarios", json={"prompt": "checkout is failing"}, headers=auth_headers
        ).status_code
        for _ in range(11)
    ]
    assert codes[:10] == [201] * 10, codes
    assert codes[10] == 429, codes


def test_cannot_drill_on_someone_elses_generated_scenario(client, auth_headers, make_auth, fake_llm):
    fake_llm(_draft())
    sc = client.post("/api/generated-scenarios", json={"prompt": "checkout is failing"}, headers=auth_headers).json()

    other = make_auth(email="other@b.com", display_name="Bo")
    create = client.post(
        "/api/sessions",
        json={"scenario_id": sc["id"], "role": "on_call_engineer", "difficulty": "production_like"},
        headers=other,
    )
    assert create.status_code == 404
