"""Scenario catalog routes — list and detail."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.schemas.scenario import Scenario, ScenarioSummary
from app.services import scenarios as catalog

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


@router.get("", response_model=list[ScenarioSummary])
def list_scenarios() -> list[ScenarioSummary]:
    return catalog.list_scenarios()


@router.get("/{scenario_id}", response_model=Scenario)
def get_scenario(scenario_id: str) -> Scenario:
    scenario = catalog.get_scenario(scenario_id)
    if scenario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")
    return scenario
