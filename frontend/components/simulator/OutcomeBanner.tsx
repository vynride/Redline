"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ClusterState } from "@/lib/simulator/types";

export function OutcomeBanner({ state, onReset }: { state: ClusterState; onReset: () => void }) {
  if (state.status === "active") return null;
  const won = state.status === "won";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-6 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-md rounded-2xl border bg-panel p-8 text-center",
          won ? "border-emerald-500/40" : "border-rose-500/40",
        )}
      >
        <div className="flex justify-center">
          {won ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          ) : (
            <XCircle className="h-12 w-12 text-rose-400" />
          )}
        </div>
        <h2 className="mt-4 text-h2 text-white">{won ? "Cascade broken" : "Total outage"}</h2>
        <p className="mt-2 text-body text-secondary">
          {won
            ? "You shed the load to stop the bleed, then rolled back the leaky deploy. Pods are serving again — that's the two-step save the VP wanted."
            : "The last pods OOM-killed and the API tier went dark. The cascade outran the fix — next time shed load early, then roll back."}
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant={won ? "secondary" : "gradient"} onClick={onReset}>
            Reset sandbox
          </Button>
        </div>
      </div>
    </div>
  );
}
