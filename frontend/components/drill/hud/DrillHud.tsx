import { Card, StatusPill, type StatusTone } from "@/components/ui";
import type { Scenario, SessionState } from "@shared/types";
import { Meter, type MeterTone } from "./Meter";
import { EscalationTimeline } from "./EscalationTimeline";
import { ObjectivesChecklist } from "./ObjectivesChecklist";

const STATUS_TONE: Record<SessionState["status"], StatusTone> = {
  active: "positive",
  completed: "accent",
  abandoned: "neutral",
};

function severityTone(state: SessionState, sc: Scenario): MeterTone {
  if (state.severity < sc.severity.win_below) return "positive";
  if (state.severity >= sc.severity.lose_at - 1) return "negative";
  return "accent";
}

/** The live drill side panel — severity, confidence, objectives, and escalations. */
export function DrillHud({ scenario, state }: { scenario: Scenario; state: SessionState }) {
  return (
    <Card widget className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-label text-secondary">Status</span>
        <StatusPill tone={STATUS_TONE[state.status]}>{state.status}</StatusPill>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-label text-secondary">Severity</span>
          <span className="font-mono text-stat-mono tabular text-primary">
            {state.severity}
            <span className="text-body text-muted">/{scenario.severity.max}</span>
          </span>
        </div>
        <Meter value={state.severity} max={scenario.severity.max} tone={severityTone(state, scenario)} />
        <span className="text-label text-muted">Win below {scenario.severity.win_below} · lose at {scenario.severity.lose_at}</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-label text-secondary">Confidence</span>
          <span className="font-mono text-stat-mono tabular text-primary">{state.confidence}%</span>
        </div>
        <Meter value={state.confidence} max={100} tone={state.confidence >= 60 ? "positive" : "accent"} />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-label text-secondary">Objectives</span>
        <ObjectivesChecklist objectives={scenario.objectives} met={state.objectives_met} />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-label text-secondary">Escalations</span>
        <EscalationTimeline events={state.escalation_timeline} />
      </div>
    </Card>
  );
}
