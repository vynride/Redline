import { StatusPill, type StatusTone } from "@/components/ui";
import type { Scenario, SessionState } from "@shared/types";
import { Meter, type MeterTone } from "./Meter";
import { EscalationTimeline } from "./EscalationTimeline";
import { ObjectivesChecklist } from "./ObjectivesChecklist";

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

function severityTone(state: SessionState, sc: Scenario): MeterTone {
  if (state.severity < sc.severity.win_below) return "positive";
  if (state.severity >= sc.severity.lose_at - 1) return "negative";
  return "accent";
}

/** Section label — mono eyebrow matching the dashboard's chrome. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{children}</span>
  );
}

/** A compact metric cell — eyebrow, big readout, mini meter, and a caption. */
function MetricCell({
  label,
  value,
  meter,
  caption,
}: {
  label: string;
  value: React.ReactNode;
  meter: React.ReactNode;
  caption: string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-panel px-5 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <Eyebrow>{label}</Eyebrow>
        <span className="font-mono text-stat-mono tabular text-primary">{value}</span>
      </div>
      {meter}
      <span className="truncate text-[11px] text-muted">{caption}</span>
    </div>
  );
}

/**
 * The live drill side panel. Status, severity, confidence, and objectives stay
 * pinned and always visible; only the escalation log — which grows over a long
 * call — scrolls, so you never lose sight of your objectives.
 */
export function DrillHud({ scenario, state }: { scenario: Scenario; state: SessionState }) {
  const metCount = state.objectives_met.length;
  const total = scenario.objectives.length;
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

      {/* Severity + confidence, side by side — hairline divider between them. */}
      <div className="grid shrink-0 grid-cols-2 gap-px border-b border-panel-line bg-panel-line">
        <MetricCell
          label="Severity"
          value={
            <>
              {state.severity}
              <span className="text-body text-muted">/{scenario.severity.max}</span>
            </>
          }
          meter={
            <Meter value={state.severity} max={scenario.severity.max} tone={severityTone(state, scenario)} />
          }
          caption={`Win below ${scenario.severity.win_below} · lose at ${scenario.severity.lose_at}`}
        />
        <MetricCell
          label="Confidence"
          value={`${state.confidence}%`}
          meter={<Meter value={state.confidence} max={100} tone={state.confidence >= 60 ? "positive" : "accent"} />}
          caption="Target 60% or higher"
        />
      </div>

      {/* Objectives — pinned, always visible (every scenario has a short list). */}
      <div className="flex shrink-0 flex-col gap-3 border-b border-panel-line px-5 py-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Objectives</Eyebrow>
          <span className="font-mono text-label tabular text-secondary">
            {metCount}/{total}
          </span>
        </div>
        <ObjectivesChecklist objectives={scenario.objectives} met={state.objectives_met} />
      </div>

      {/* Escalation log — the only region that scrolls as the call runs long. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-4">
        <Eyebrow>Escalations</Eyebrow>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <EscalationTimeline events={state.escalation_timeline} />
        </div>
      </div>
    </aside>
  );
}
