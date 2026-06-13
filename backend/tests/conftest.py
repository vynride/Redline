"""Shared pytest fixtures — isolated in-memory DB, client, auth, and a fake LLM."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401 — register models on Base.metadata
from app.db import Base, get_db
from app.main import app
from app.schemas.common import Emotion
from app.schemas.debrief import DebriefContent, DimensionScores, LostControlMoment
from app.schemas.engine import EngineTurnOutput, TurnEval
from app.services.debrief import _DebriefDraft


class FakeLLM:
    """Deterministic stand-in for the Sarvam client.

    Returns an engine turn for ``EngineTurnOutput`` and a debrief for ``_DebriefDraft``,
    so the same fake serves both the engine and the debrief service without a network.
    """

    def __init__(self, engine_output: EngineTurnOutput | None = None) -> None:
        self.engine_output = engine_output
        self.calls: list[list[dict]] = []

    async def generate(self, *, system, messages, response_schema):
        self.calls.append(messages)
        if response_schema is EngineTurnOutput:
            return self.engine_output or EngineTurnOutput(
                utterance="What's the error rate and which regions are affected?",
                emotion=Emotion.frustrated, severity_delta=-1, confidence_delta=10,
                objectives_met=["Gather and confirm the blast radius (regions, payment methods, error rate)"],
                turn_eval=TurnEval(clarity=4, deescalation=3, info_gathering=4, note="good probing"),
            )
        if response_schema is _DebriefDraft:
            return _DebriefDraft(
                summary="Acknowledged fast; lost ground hedging on the ETA.",
                content=DebriefContent(
                    strengths=["Immediate acknowledgement of impact"],
                    lost_control=[LostControlMoment(quote="I'm not sure yet", issue="Vague ETA",
                                                    better="Commit to a concrete next-update time")],
                    missed_information=["Did not confirm affected regions"],
                    escalation_assessment="Escalated appropriately.",
                    status_communication_assessment="Cadence unclear.",
                    dimension_scores=DimensionScores(clarity=80, deescalation=70, info_gathering=60,
                                                     escalation=90, status_communication=65),
                ),
            )
        raise AssertionError(f"Unexpected schema {response_schema!r}")


@pytest.fixture
def db_session():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        engine.dispose()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    resp = client.post("/api/auth/register", json={
        "email": "drill@example.com", "password": "password123", "display_name": "Ava"})
    assert resp.status_code == 201
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}
