import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { StatusPill, type StatusTone } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Scenario, SessionState } from "@shared/types";
import { Meter } from "./Meter";
import { SeverityReadout } from "./SeverityReadout";
import { EscalationTimeline } from "./EscalationTimeline";
import { ObjectivesChecklist } from "./ObjectivesChecklist";

export type Trend = "up" | "down" | "flat";

const STATUS_TONE: Record<SessionState["status"], StatusTone> = {
  active: "positive",
  completed: "accent",
  abandoned: "neutral",
};

const STATUS_LABEL: Record<SessionState["status"], string> = {
  active: "Live",
  completed: "Completed",
  abandoned: "Ended",
};

/** Section label — mono eyebrow matching the dashboard's chrome. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{children}</span>
  );
}

/** Severity rising is bad (rose ▲); falling is good (emerald ▼). */
function Momentum({ turns, trend }: { turns: number; trend: Trend }) {
  const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const tone =
    trend === "up" ? "text-rose-400" : trend === "down" ? "text-emerald-400" : "text-muted";
  const label = trend === "up" ? "Heating up" : trend === "down" ? "Cooling down" : "Holding";
  return (
    <div className="flex flex-col gap-2 bg-panel px-5 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <Eyebrow>Turn</Eyebrow>
        <span className="font-mono text-stat-mono tabular text-primary">{turns}</span>
      </div>
      <span className={cn("inline-flex items-center gap-1.5 text-[11px]", tone)}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
        {label}
      </span>
    </div>
  );
}

/**
 * The live drill side panel. Status, the pressure dial, confidence/momentum, and
 * objectives stay pinned and always visible; only the escalation log — which grows
 * over a long call — scrolls, so you never lose sight of your objectives.
 */
export function DrillHud({
  scenario,
  state,
  turns,
  trend,
}: {
  scenario: Scenario;
  state: SessionState;
  turns: number;
  trend: Trend;
}) {
  const metCount = state.objectives_met.length;
  const total = scenario.objectives.length;
  const objPct = total ? (metCount / total) * 100 : 0;
  const allMet = metCount === total && total > 0;

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-panel-line bg-panel">
      {/* Status header */}
      <div className="flex shrink-0 items-center justify-between border-b border-panel-line px-5 py-4">
        <Eyebrow>Incident status</Eyebrow>
        <StatusPill tone={STATUS_TONE[state.status]} className="gap-1.5">
          {state.status === "active" && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          {STATUS_LABEL[state.status]}
        </StatusPill>
      </div>

      {/* Severity — the hero readout. */}
      <div className="shrink-0 border-b border-panel-line">
        <SeverityReadout state={state} scenario={scenario} />
      </div>

      {/* Confidence + momentum, side by side — hairline divider between them. */}
      <div className="grid shrink-0 grid-cols-2 gap-px border-b border-panel-line bg-panel-line">
        <div className="flex flex-col gap-2 bg-panel px-5 py-4">
          <div className="flex items-baseline justify-between gap-2">
            <Eyebrow>Confidence</Eyebrow>
            <span className="font-mono text-stat-mono tabular text-primary">{state.confidence}%</span>
          </div>
          <Meter value={state.confidence} max={100} tone={state.confidence >= 60 ? "positive" : "warning"} />
          <span className="truncate text-[11px] text-muted">Target 60% or higher</span>
        </div>
        <Momentum turns={turns} trend={trend} />
      </div>

      {/* Detail region — objectives and escalations split the remaining height and
          scroll independently, so neither is ever clipped however long they grow. */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Objectives — header + progress pinned; the list scrolls within a capped
            area so escalations always keep a share of the column. */}
        <div className="flex max-h-[52%] shrink-0 flex-col border-b border-panel-line">
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-4">
            <Eyebrow>Objectives</Eyebrow>
            <span className={cn("font-mono text-label tabular", allMet ? "text-emerald-400" : "text-secondary")}>
              {metCount}/{total}
            </span>
          </div>
          <div className="shrink-0 px-5 pb-1 pt-2.5">
            <div className="h-1 w-full overflow-hidden rounded-full bg-panel-2">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${objPct}%` }}
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-2">
            <ObjectivesChecklist objectives={scenario.objectives} met={state.objectives_met} />
          </div>
        </div>

        {/* Escalation log — fills the rest and scrolls as the call runs long. */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-4">
          <div className="flex shrink-0 items-center justify-between gap-3">
            <Eyebrow>Escalations</Eyebrow>
            {state.escalation_timeline.length > 0 && (
              <span className="font-mono text-label tabular text-rose-400">
                {state.escalation_timeline.length}
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <EscalationTimeline events={state.escalation_timeline} />
          </div>
        </div>
      </div>
    </aside>
  );
}
