"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { ClusterStatus } from "@/components/simulator/ClusterStatus";
import { OutcomeBanner } from "@/components/simulator/OutcomeBanner";
import { RunbookGuide } from "@/components/simulator/RunbookGuide";
import { SimTerminal } from "@/components/simulator/SimTerminal";
import { buttonStyles } from "@/components/ui";
import { getLab } from "@/lib/simulator/labs";
import type { ClusterState } from "@/lib/simulator/types";

export default function SimulatorPage() {
  const params = useParams<{ scenarioId: string }>();
  const scenarioId = Array.isArray(params.scenarioId) ? params.scenarioId[0] : params.scenarioId;
  const lab = getLab(scenarioId);

  const [state, setState] = useState<ClusterState | null>(() => lab?.initialState() ?? null);
  const [resetNonce, setResetNonce] = useState(0);

  if (!lab || !state) {
    return (
      <div className="mx-auto max-w-[1180px] px-6 py-20 text-center">
        <h1 className="text-h2 text-white">Hands-on lab unavailable</h1>
        <p className="mt-3 text-body text-secondary">
          There isn&apos;t an interactive lab for this scenario yet.
        </p>
        <Link href="/dashboard" className={buttonStyles("secondary", "mt-6")}>
          Back to drills
        </Link>
      </div>
    );
  }

  function reset() {
    setState(lab!.initialState());
    setResetNonce((n) => n + 1);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col px-5 py-5 sm:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="grid h-9 w-9 place-items-center rounded-lg border border-panel-line bg-panel text-muted transition hover:text-white"
            aria-label="Back to drills"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="leading-tight">
            <h1 className="text-[18px] font-semibold leading-tight">{lab.title}</h1>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Hands-on lab · {lab.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* "Provisioned by Floci" sandbox chrome */}
          <span className="hidden items-center gap-2 rounded-full border border-panel-line bg-panel px-3 py-1.5 sm:flex">
            <span className="font-mono text-[11px] text-secondary">
              floci sandbox · {lab.instanceId}
            </span>
          </span>
          <button onClick={reset} className={buttonStyles("secondary", "h-9 px-4")}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Workspace: guide + status on the left, terminal on the right */}
      <div className="mt-5 grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-5">
          <div className="min-h-0 flex-[3]">
            <RunbookGuide lab={lab} state={state} />
          </div>
          <div className="min-h-0 flex-[2]">
            <ClusterStatus state={state} />
          </div>
        </div>
        <div className="min-h-[420px]">
          <SimTerminal lab={lab} state={state} onState={setState} resetNonce={resetNonce} />
        </div>
      </div>

      <OutcomeBanner state={state} onReset={reset} />
    </div>
  );
}
