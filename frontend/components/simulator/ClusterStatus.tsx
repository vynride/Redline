"use client";

import { cn } from "@/lib/cn";
import type { ClusterState, Pod } from "@/lib/simulator/types";

function severityTone(sev: number): { bar: string; text: string } {
  if (sev >= 7) return { bar: "bg-rose-500", text: "text-rose-400" };
  if (sev >= 3) return { bar: "bg-amber-400", text: "text-amber-300" };
  return { bar: "bg-emerald-500", text: "text-emerald-400" };
}

function PodDot({ pod }: { pod: Pod }) {
  const ok = pod.status === "Running";
  return (
    <span className="flex items-center justify-between gap-2 font-mono text-[11px]">
      <span className="flex items-center gap-2 truncate">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", ok ? "bg-emerald-500" : "bg-rose-500")} />
        <span className="truncate text-muted">{pod.name.replace(/^api-7f9c8d-/, "…")}</span>
      </span>
      <span className={cn("shrink-0", ok ? "text-emerald-400" : "text-rose-400")}>{pod.status}</span>
    </span>
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
    <div className="rounded-2xl border border-panel-line bg-panel p-5">
      <h2 className="text-label uppercase tracking-[0.14em] text-muted">Cluster status</h2>

      {/* Severity meter */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-body text-secondary">Severity</span>
          <span className={cn("font-mono text-stat-mono tabular", tone.text)}>
            {state.severity.toFixed(1)}
            <span className="text-muted"> / 10</span>
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-panel-2">
          <div className={cn("h-full rounded-full transition-all duration-500", tone.bar)} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-muted">target &lt; 3 to recover · total outage at 10</p>
      </div>

      {/* Vitals */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-body">
        <div className="rounded-xl border border-panel-line bg-panel-2 px-3 py-2">
          <div className="text-label text-muted">Serving</div>
          <div className={cn("font-mono tabular", ready === state.pods.length ? "text-emerald-400" : "text-rose-400")}>
            {ready} / {state.pods.length}
          </div>
        </div>
        <div className="rounded-xl border border-panel-line bg-panel-2 px-3 py-2">
          <div className="text-label text-muted">Mem limit</div>
          <div className="font-mono tabular text-secondary">{state.memLimitMi}Mi</div>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge on={!state.leakPresent} onText="leak rolled back" offText="leak LIVE (v2.7.0)" />
        <Badge on={state.loadShed} onText="load shed" offText="load not shed" />
      </div>

      {/* Pod roster */}
      <div className="mt-4 flex flex-col gap-1.5 border-t border-panel-line pt-3">
        {state.pods.map((p) => (
          <PodDot key={p.name} pod={p} />
        ))}
      </div>
    </div>
  );
}
