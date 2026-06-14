"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ClusterState, Pod } from "@/lib/simulator/types";

function severityTone(sev: number): { bar: string; text: string } {
  if (sev >= 7) return { bar: "bg-rose-500", text: "text-rose-400" };
  if (sev >= 3) return { bar: "bg-amber-400", text: "text-amber-300" };
  return { bar: "bg-emerald-500", text: "text-emerald-400" };
}

/** A pod as a bordered row, mirroring the drill page's objectives checklist. */
function PodRow({ pod }: { pod: Pod }) {
  const ok = pod.status === "Running";
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5",
        ok ? "border-emerald-500/25 bg-emerald-500/[0.07]" : "border-rose-500/25 bg-rose-500/[0.07]",
      )}
    >
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
          ok
            ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-400"
            : "border-rose-400/60 bg-rose-500/15 text-rose-400",
        )}
      >
        {ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-[13.5px] text-secondary">{pod.name}</span>
      <span className="shrink-0 font-mono text-[11px] text-muted">↺{pod.restarts}</span>
      <span className={cn("shrink-0 font-mono text-[12px]", ok ? "text-emerald-400" : "text-rose-400")}>
        {pod.status}
      </span>
    </li>
  );
}

function Badge({ on, onText, offText }: { on: boolean; onText: string; offText: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-label",
        on ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400",
      )}
    >
      {on ? onText : offText}
    </span>
  );
}

export function ClusterStatus({ state }: { state: ClusterState }) {
  const tone = severityTone(state.severity);
  const ready = state.pods.filter((p) => p.status === "Running").length;
  const pct = Math.min(100, (state.severity / 10) * 100);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-panel-line bg-panel">
      {/* Pinned header: severity + vitals stay visible while the roster scrolls */}
      <div className="shrink-0 border-b border-panel-line px-5 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
            Cluster status
          </span>
          <span className={cn("font-mono text-[13px] tabular", tone.text)}>
            SEV {state.severity.toFixed(1)}
            <span className="text-muted">/10</span>
          </span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-panel-2">
          <div className={cn("h-full rounded-full transition-all duration-500 ease-out", tone.bar)} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-muted">target &lt; 3 to recover · total outage at 10</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-panel-line bg-panel-2 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted">Serving</div>
            <div className={cn("font-mono text-[14px] tabular", ready === state.pods.length ? "text-emerald-400" : "text-rose-400")}>
              {ready}/{state.pods.length}
            </div>
          </div>
          <div className="rounded-lg border border-panel-line bg-panel-2 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted">Mem limit</div>
            <div className="font-mono text-[14px] tabular text-secondary">{state.memLimitMi}Mi</div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge on={!state.leakPresent} onText="leak rolled back" offText="leak LIVE" />
          <Badge on={state.loadShed} onText="load shed" offText="load not shed" />
        </div>
      </div>

      {/* Scrolling pod roster */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-label uppercase tracking-[0.14em] text-muted">Pods</span>
          <span className={cn("font-mono text-[12px] tabular", ready === state.pods.length ? "text-emerald-400" : "text-secondary")}>
            {ready}/{state.pods.length} serving
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {state.pods.map((p) => (
            <PodRow key={p.name} pod={p} />
          ))}
        </ul>
      </div>
    </div>
  );
}
