"""Scenario catalog — loads authored JSON definitions from data/scenarios.

Scenarios are static authored content, so they are parsed and validated once and
cached for the process lifetime. Each file must validate against the ``Scenario``
schema; a malformed file fails loudly at startup rather than at request time.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from app.core.logging import get_logger
from app.schemas.scenario import Scenario, ScenarioSummary

log = get_logger("redline.scenarios")

# backend/app/services/scenarios.py -> parents[2] == backend/
SCENARIO_DIR = Path(__file__).resolve().parents[2] / "data" / "scenarios"


@lru_cache(maxsize=1)
def _catalog() -> dict[str, Scenario]:
    catalog: dict[str, Scenario] = {}
    for path in sorted(SCENARIO_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        scenario = Scenario.model_validate(data)
        if scenario.id in catalog:
            raise ValueError(f"Duplicate scenario id '{scenario.id}' in {path.name}")
        catalog[scenario.id] = scenario
    log.info("loaded %d scenarios from %s", len(catalog), SCENARIO_DIR)
    return catalog


def list_scenarios() -> list[ScenarioSummary]:
    return [ScenarioSummary.from_scenario(s) for s in _catalog().values()]


def get_scenario(scenario_id: str) -> Scenario | None:
    return _catalog().get(scenario_id)
