import { cn } from "@/lib/cn";
import type { Scenario, SessionState } from "@shared/types";

export type PressureTone = "positive" | "accent" | "warning" | "negative";

/** Solid track fills, the step in hue is the signal, not a gradient. */
const FILL: Record<PressureTone, string> = {
  positive: "bg-emerald-400",
  accent: "bg-violet-500",
  warning: "bg-amber-400",
  negative: "bg-rose-500",
};

const TEXT: Record<PressureTone, string> = {
  positive: "text-emerald-400",
  accent: "text-violet-300",
  warning: "text-amber-300",
  negative: "text-rose-400",
};

const WORD: Record<PressureTone, string> = {
  positive: "Safe",
  accent: "Holding",
  warning: "Warming",
  negative: "Danger",
};

/**
 * Four-band pressure reading: safe (below the win line), holding, warming, and
 * danger (within one of the lose line). Violet → amber → rose as it climbs.
 */
export function pressureTone(severity: number, sc: Scenario): PressureTone {
  if (severity < sc.severity.win_below) return "positive";
  if (severity >= sc.severity.lose_at - 1) return "negative";
  if (severity >= (sc.severity.win_below + sc.severity.lose_at) / 2) return "warning";
  return "accent";
}

const pct = (n: number, max: number) => `${Math.max(0, Math.min(100, (n / max) * 100))}%`;

/**
 * The HUD's pressure hero, in the system's own language: a big mono number over a
 * threshold track. The fill steps color as the call heats up; the track shades the
 * lose zone and ticks the win/lose lines so the stakes are legible at a glance.
 */
export function SeverityReadout({
  state,
  scenario,
  compact = false,
}: {
  state: SessionState;
  scenario: Scenario;
  compact?: boolean;
}) {
  const { max, win_below, lose_at } = scenario.severity;
  const tone = pressureTone(state.severity, scenario);
  const danger = tone === "negative";

  return (
    <div className={cn("flex flex-col px-5", compact ? "gap-1.5 py-3" : "gap-2.5 py-4")}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-secondary">Severity</span>
        <span className={cn("font-mono text-[11px] font-semibold uppercase tracking-[0.14em]", TEXT[tone])}>
          {WORD[tone]}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono font-semibold leading-none tabular",
            compact ? "text-[28px]" : "text-[38px]",
            TEXT[tone],
            danger && "animate-pulse",
          )}
        >
          {state.severity}
        </span>
        <span className={cn("font-mono text-muted", compact ? "text-body-strong" : "text-h2")}>/{max}</span>
      </div>

      {/* Threshold track, shaded lose zone, solid fill, win/lose ticks. */}
      <div className={cn("relative w-full", compact ? "mt-0.5 h-2" : "mt-1 h-2.5")}>
        <div className="absolute inset-0 overflow-hidden rounded-full bg-panel-2">
          <div className="absolute inset-y-0 right-0 bg-rose-500/15" style={{ left: pct(lose_at, max) }} />
          <div
            className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out", FILL[tone])}
            style={{ width: pct(state.severity, max) }}
          />
        </div>
        <span
          className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-emerald-400/50"
          style={{ left: pct(win_below, max) }}
        />
        <span
          className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-rose-400/70"
          style={{ left: pct(lose_at, max) }}
        />
      </div>

      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
        <span>Win below {win_below}</span>
        <span>Lose at {lose_at}</span>
      </div>
    </div>
  );
}
