import { ServerCrash, CreditCard, ShieldAlert, AlertTriangle, PackageX, Gauge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Archetype, Difficulty, Emotion } from "@shared/types";

/** Archetype → lucide glyph, mirrored from the dashboard's scenario cards. */
export const ARCHETYPE_ICONS: Record<Archetype, LucideIcon> = {
  production_outage: ServerCrash,
  payment_failure: CreditCard,
  security_alert: ShieldAlert,
  support_escalation: AlertTriangle,
  broken_release: PackageX,
  latency_spike: Gauge,
};

/** Difficulty → SEV badge (DESIGN.md badge-severity), matching the dashboard. */
export const SEV: Record<Difficulty, { label: string; cls: string; rank: number }> = {
  redline: { label: "SEV-1", cls: "text-rose-400 bg-rose-500/10", rank: 3 },
  production_like: { label: "SEV-2", cls: "text-amber-300 bg-amber-400/10", rank: 2 },
  warmup: { label: "SEV-3", cls: "text-violet-300 bg-violet-500/10", rank: 1 },
};

export function hardest(difficulties: Difficulty[]): Difficulty {
  return [...difficulties].sort((a, b) => SEV[b].rank - SEV[a].rank)[0];
}

/** Emotion → chip styling for transcript tags. Hotter emotions read warmer/redder. */
export const EMOTION_TONE: Record<Emotion, string> = {
  neutral: "text-secondary bg-panel-2",
  calm: "text-emerald-300 bg-emerald-500/10",
  confused: "text-violet-300 bg-violet-500/10",
  frustrated: "text-amber-300 bg-amber-400/10",
  angry: "text-rose-400 bg-rose-500/10",
  urgent: "text-rose-300 bg-rose-500/15",
};
