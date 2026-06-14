// Registry of hands-on labs, keyed by scenario id. Adding a lab for another
// scenario is a one-line change here.

import type { Lab } from "./types";
import { oomCascadeLab } from "./oomCascade";

const LABS: Record<string, Lab> = {
  [oomCascadeLab.id]: oomCascadeLab,
};

export function getLab(scenarioId: string): Lab | undefined {
  return LABS[scenarioId];
}
