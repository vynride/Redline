"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardWindow } from "@/components/app/DashboardWindow";
import { DrillConfig } from "@/components/drill/NewDrill";
import { api } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import type { ScenarioSummary, SessionListItem } from "@shared/types";

function readinessOf(sessions: SessionListItem[]) {
  const scored = sessions
    .filter((s) => s.status === "completed" && s.score != null)
    .map((s) => s.score as number);
  const points = scored.reduce((a, b) => a + b, 0);
  const tier = points >= 1500 ? "Gold" : points >= 500 ? "Silver" : "Bronze";
  return { points, tier };
}

export default function DashboardPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioSummary[] | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ScenarioSummary | null>(null);

  useEffect(() => {
    Promise.all([api.listScenarios(), api.listSessions()])
      .then(([sc, se]) => {
        setScenarios(sc);
        setSessions(se);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load your dashboard."));
  }, []);

  if (error)
    return (
      <div className="mx-auto max-w-[1180px] px-6 py-12">
        <p className="text-body text-rose-400">{error}</p>
      </div>
    );
  if (!scenarios || !sessions) return <LoadingScreen />;

  const readiness = readinessOf(sessions);

  return (
    <>
      <DashboardWindow
        scenarios={scenarios}
        sessions={sessions}
        readiness={readiness}
        onSelect={setSelected}
      />

      {selected && <DrillConfig scenario={selected} onClose={() => setSelected(null)} router={router} />}
    </>
  );
}
