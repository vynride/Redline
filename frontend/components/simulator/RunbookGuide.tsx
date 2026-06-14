"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ClusterState, Lab } from "@/lib/simulator/types";

export function RunbookGuide({ lab, state }: { lab: Lab; state: ClusterState }) {
  // The first not-yet-done step is the one to nudge the user toward.
  const activeIdx = lab.runbook.findIndex((s) => !s.done(state));

  return (
    <div className="rounded-2xl border border-panel-line bg-panel p-5">
      <h2 className="text-label uppercase tracking-[0.14em] text-muted">Runbook</h2>
      <p className="mt-1 text-body text-secondary">
        Stop the cascade first, then stop the leak. Type the commands into the terminal.
      </p>

      <ol className="mt-4 flex flex-col gap-3">
        {lab.runbook.map((step, i) => {
          const done = step.done(state);
          const active = !done && i === activeIdx;
          return (
            <li key={step.id} className="flex gap-3">
              <span className="mt-0.5 shrink-0">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Circle className={cn("h-4 w-4", active ? "text-violet-300" : "text-muted/50")} />
                )}
              </span>
              <div className="min-w-0">
                <div
                  className={cn(
                    "text-body font-medium",
                    done ? "text-secondary line-through" : active ? "text-white" : "text-secondary",
                  )}
                >
                  {step.title}
                </div>
                <p className="mt-0.5 text-label text-muted">{step.detail}</p>
                <div className="mt-1.5 flex flex-col gap-1">
                  {step.commands.map((c) => (
                    <code
                      key={c}
                      className={cn(
                        "block break-all rounded-md border border-panel-line bg-panel-2 px-2 py-1 font-mono text-[11px]",
                        active ? "text-violet-200" : "text-muted",
                      )}
                    >
                      {c}
                    </code>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
