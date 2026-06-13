"use client";

import { useEffect, useMemo, useState } from "react";
import { Leaderboard } from "@/components/app/Leaderboard";
import { SessionHistory } from "@/components/app/SessionHistory";
import { NewDrill } from "@/components/drill/NewDrill";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ScenarioSummary, SessionListItem } from "@shared/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<ScenarioSummary[] | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.listScenarios(), api.listSessions()])
      .then(([sc, se]) => {
        setScenarios(sc);
        setSessions(se);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load your dashboard."));
  }, []);

  const titles = useMemo(
    () => Object.fromEntries((scenarios ?? []).map((s) => [s.id, s.title])),
    [scenarios],
  );

  if (error) return <p className="text-body text-negative">{error}</p>;
  if (!scenarios || !sessions) return <p className="text-body text-secondary">Loading…</p>;

  return (
    <div className="flex flex-col gap-section">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1">Start a drill</h1>
          <p className="text-body-lg text-secondary">
            {user ? `Ready when you are, ${user.display_name.split(" ")[0]}.` : "Pick a crisis and talk your way out."}
          </p>
        </div>
        <NewDrill scenarios={scenarios} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          <h2 className="text-h2">History</h2>
          <SessionHistory sessions={sessions} titles={titles} />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-h2">Leaderboard</h2>
          <Leaderboard sessions={sessions} titles={titles} />
        </div>
      </section>
    </div>
  );
}
