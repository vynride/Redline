"""Scenario catalog — loads authored JSON definitions from data/scenarios.

Scenarios are static authored content, so they are parsed and validated once and
cached for the process lifetime. Each file must validate against the ``Scenario``
schema; a malformed file fails loudly at startup rather than at request time.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import TYPE_CHECKING

from app.core.logging import get_logger
from app.schemas.scenario import Scenario, ScenarioSummary

if TYPE_CHECKING:
    from app.models.session import DrillSession

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


def scenario_for_session(session: "DrillSession") -> Scenario | None:
    """Resolve the scenario a drill is running on.

    Generated scenarios are snapshotted onto the session at creation, so a live
    drill never depends on the catalog (or on the generated row still existing).
    Static scenarios carry no snapshot and resolve by id from the catalog.
    """
    snapshot = session.scenario_json
    if snapshot:
        return Scenario.model_validate(snapshot)
    return get_scenario(session.scenario_id)
