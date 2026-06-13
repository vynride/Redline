#!/usr/bin/env python3
"""Seed / validate the scenario catalog.

Scenarios are authored JSON in ``backend/data/scenarios`` and are loaded into the
app at runtime (see ``app.services.scenarios``). This script eagerly loads and
validates every scenario file so the catalog is verified up front — it runs on
startup (wired into the Docker CMD) and can be run by hand:

    python -m scripts.seed_scenarios

It exits non-zero and prints the offending file if any scenario is malformed or
if two scenarios share an id, so a bad authored file fails the boot loudly
instead of at the first API request.
"""
from __future__ import annotations

import sys

from app.services.scenarios import SCENARIO_DIR, list_scenarios


def main() -> int:
    if not SCENARIO_DIR.exists():
        print(f"[seed] scenario directory not found: {SCENARIO_DIR}", file=sys.stderr)
        return 1

    files = sorted(SCENARIO_DIR.glob("*.json"))
    if not files:
        print(f"[seed] no scenario files in {SCENARIO_DIR}", file=sys.stderr)
        return 1

    try:
        # Loading the catalog validates every file and enforces unique ids;
        # a malformed file raises here with its path in the message.
        summaries = list_scenarios()
    except Exception as exc:  # noqa: BLE001 — surface any load/validation error
        print(f"[seed] failed to load scenarios: {exc}", file=sys.stderr)
        return 1

    print(f"[seed] validated {len(summaries)} scenarios from {len(files)} files:")
    for s in summaries:
        print(f"  - {s.id:<32} {s.archetype.value:<18} {s.title}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
