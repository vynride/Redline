"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Minus } from "lucide-react";
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

/** Section label, mono eyebrow matching the dashboard's chrome. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-secondary">{children}</span>
  );
}

/** Severity rising is bad (rose ▲); falling is good (emerald ▼). */
function Momentum({ turns, trend }: { turns: number; trend: Trend }) {
  const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const tone =
    trend === "up" ? "text-rose-400" : trend === "down" ? "text-emerald-400" : "text-muted";
  const label = trend === "up" ? "Heating up" : trend === "down" ? "Cooling down" : "Holding";
  return (
    <div className="flex flex-col gap-1.5 bg-panel px-5 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <Eyebrow>Turn</Eyebrow>
        <span className="font-mono text-stat-mono tabular text-primary">{turns}</span>
      </div>
      <span className={cn("inline-flex items-center gap-1.5 text-[12.5px]", tone)}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
        {label}
      </span>
    </div>
  );
}

/**
 * The live drill side panel, organised as two zones. Up top: a compact strip of
 * live telemetry (status, the pressure dial, confidence, momentum) that ticks every
 * turn. Below: your objectives, the mission, given the dominant, always-readable
 * space, scrolling on their own if long. Escalations sit in a collapsible footer so
 * they never crowd out what you're trying to achieve.
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

  const escCount = state.escalation_timeline.length;
  const [escOpen, setEscOpen] = useState(false);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-panel-line bg-panel">
      {/* ── Telemetry, compact live gauges, pinned to the top ── */}
      <div className="shrink-0 border-b border-panel-line">
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <Eyebrow>Incident status</Eyebrow>
          <StatusPill tone={STATUS_TONE[state.status]}>
            {STATUS_LABEL[state.status]}
          </StatusPill>
        </div>

        <SeverityReadout state={state} scenario={scenario} compact />

        <div className="grid grid-cols-2 gap-px border-t border-panel-line bg-panel-line">
          <div className="flex flex-col gap-1.5 bg-panel px-5 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <Eyebrow>Confidence</Eyebrow>
              <span className="font-mono text-stat-mono tabular text-primary">{state.confidence}%</span>
            </div>
            <Meter value={state.confidence} max={100} tone={state.confidence >= 60 ? "positive" : "warning"} />
            <span className="truncate text-[12px] text-muted">Target 60% or higher</span>
          </div>
          <Momentum turns={turns} trend={trend} />
        </div>
      </div>

      {/* ── Objectives, the centerpiece. Header explains them; the list dominates
          the rail and scrolls on its own only if it ever outgrows the space. ── */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-5 pb-3 pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
              Your objectives
            </span>
            <span className={cn("font-mono text-[13px] tabular", allMet ? "text-emerald-400" : "text-secondary")}>
              {metCount}/{total}
            </span>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-panel-2">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${objPct}%` }}
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <ObjectivesChecklist objectives={scenario.objectives} met={state.objectives_met} />
        </div>
      </div>

      {/* ── Escalations, collapsible footer; secondary to the mission above. ── */}
      <div className="shrink-0 border-t border-panel-line">
        <button
          type="button"
          onClick={() => setEscOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-panel-2/40"
        >
          <span className="flex items-center gap-2">
            <ChevronRight
              className={cn("h-3.5 w-3.5 text-muted transition-transform", escOpen && "rotate-90")}
            />
            <Eyebrow>Escalations</Eyebrow>
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[12px] tabular",
              escCount > 0 ? "bg-rose-500/10 text-rose-400" : "text-muted",
            )}
          >
            {escCount > 0 ? escCount : "None"}
          </span>
        </button>
        {escOpen && (
          <div className="max-h-44 overflow-y-auto px-5 pb-4">
            <EscalationTimeline events={state.escalation_timeline} />
          </div>
        )}
      </div>
    </aside>
  );
}
