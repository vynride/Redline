"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Pill, StatusPill } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { ARCHETYPE_LABELS, DIFFICULTY_LABELS, ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { Difficulty, Role, ScenarioSummary } from "@shared/types";

export function NewDrill({ scenarios }: { scenarios: ScenarioSummary[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ScenarioSummary | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s) => (
          <Card key={s.id} interactive className="flex cursor-pointer flex-col gap-3" onClick={() => setSelected(s)}>
            <div className="flex items-center justify-between">
              <Pill>{ARCHETYPE_LABELS[s.archetype]}</Pill>
              <StatusPill tone="accent">{s.difficulties.length} levels</StatusPill>
            </div>
            <h3 className="text-h2">{s.title}</h3>
            <p className="text-body text-secondary">{s.summary}</p>
            <span className="mt-auto text-label text-muted">vs. {s.persona_role.replace(/_/g, " ")}</span>
          </Card>
        ))}
      </div>
      {selected && <DrillConfig scenario={selected} onClose={() => setSelected(null)} router={router} />}
    </>
  );
}

function DrillConfig({
  scenario,
  onClose,
  router,
}: {
  scenario: ScenarioSummary;
  onClose: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [role, setRole] = useState<Role>(scenario.roles[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>(scenario.difficulties[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const session = await api.createSession({ scenario_id: scenario.id, role, difficulty });
      router.push(`/drill/${session.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start the drill.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-base/70 p-6 backdrop-blur-sm" onClick={onClose}>
      <Card widget className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <Pill>{ARCHETYPE_LABELS[scenario.archetype]}</Pill>
        <h2 className="mt-3 text-h2">{scenario.title}</h2>
        <p className="mt-1 text-body text-secondary">{scenario.summary}</p>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-label text-secondary">Your role</span>
          <div className="flex flex-wrap gap-2">
            {scenario.roles.map((r) => (
              <Choice key={r} active={r === role} onClick={() => setRole(r)} label={ROLE_LABELS[r]} />
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <span className="text-label text-secondary">Difficulty</span>
          <div className="flex flex-wrap gap-2">
            {scenario.difficulties.map((d) => (
              <Choice key={d} active={d === difficulty} onClick={() => setDifficulty(d)} label={DIFFICULTY_LABELS[d]} />
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-label text-negative">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={start} disabled={busy}>
            {busy ? "Starting…" : "Start drill"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-label transition",
        active ? "border-accent bg-accent-soft text-accent" : "border-line text-secondary hover:border-line-strong",
      )}
    >
      {label}
    </button>
  );
}
