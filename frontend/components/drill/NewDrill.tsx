"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ServerCrash, CreditCard, ShieldAlert, AlertTriangle, PackageX, Gauge, ArrowRight, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { ARCHETYPE_LABELS, DIFFICULTY_LABELS, ROLE_LABELS, humanizeRole } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { Archetype, Difficulty, Role, ScenarioSummary } from "@shared/types";

const ICONS: Record<Archetype, LucideIcon> = {
  production_outage: ServerCrash,
  payment_failure: CreditCard,
  security_alert: ShieldAlert,
  support_escalation: AlertTriangle,
  broken_release: PackageX,
  latency_spike: Gauge,
};

// Hardest available difficulty drives the severity badge (DESIGN.md badge-severity).
const SEV: Record<Difficulty, { label: string; cls: string; rank: number }> = {
  redline: { label: "SEV-1", cls: "text-rose-400 bg-rose-500/10", rank: 3 },
  production_like: { label: "SEV-2", cls: "text-amber-300 bg-amber-400/10", rank: 2 },
  warmup: { label: "SEV-3", cls: "text-violet-300 bg-violet-500/10", rank: 1 },
};

function hardest(difficulties: Difficulty[]): Difficulty {
  return [...difficulties].sort((a, b) => SEV[b].rank - SEV[a].rank)[0];
}

export function NewDrill({ scenarios }: { scenarios: ScenarioSummary[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ScenarioSummary | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s) => {
          const Icon = ICONS[s.archetype];
          const sev = SEV[hardest(s.difficulties)];
          return (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="group flex flex-col gap-3 rounded-xl border border-panel-line bg-panel p-5 text-left transition-colors hover:border-violet-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-panel-2 text-violet-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-label text-secondary">{ARCHETYPE_LABELS[s.archetype]}</span>
                </span>
                <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold", sev.cls)}>
                  {sev.label}
                </span>
              </div>

              <h3 className="text-body-strong text-primary">{s.title}</h3>
              <p className="min-h-[40px] text-body text-secondary">{s.summary}</p>

              <div className="mt-1 flex items-center justify-between border-t border-panel-line pt-3">
                <span className="text-label text-muted">vs. {humanizeRole(s.persona_role)}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-2.5 py-1 text-[12px] font-semibold text-violet-200 transition-colors group-hover:bg-violet-500 group-hover:text-white">
                  Run drill <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {selected && <DrillConfig scenario={selected} onClose={() => setSelected(null)} router={router} />}
    </>
  );
}

export function DrillConfig({
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
  const [mounted, setMounted] = useState(false);
  const Icon = ICONS[scenario.archetype];

  // Render into <body> so the overlay's `fixed inset-0` anchors to the viewport.
  // The app is wrapped in an element that holds a lingering `transform` (the
  // AuthGuard fade-up animation), which would otherwise become the containing
  // block for fixed descendants and throw the modal off-screen.
  useEffect(() => setMounted(true), []);

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

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* min-h-full + items-center keeps the modal centered when it fits and lets
          the overlay scroll (instead of clipping the top) when it doesn't. */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-panel-line bg-ink-2 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)]"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`Configure drill: ${scenario.title}`}
        >
        {/* Header, app-window chrome: icon tile + mono eyebrow + severity */}
        <div className="flex items-start gap-3 border-b border-panel-line px-7 pb-5 pt-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-panel-2 text-violet-300">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {ARCHETYPE_LABELS[scenario.archetype]}
            </span>
            <h2 className="mt-1 truncate text-h2 text-primary">{scenario.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-panel-2 hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-7 py-6">
          <p className="text-body text-secondary">{scenario.summary}</p>

          {/* Role, selector tiles */}
          <div className="mt-6 flex flex-col gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Your role</span>
            <div className="grid grid-cols-2 gap-2">
              {scenario.roles.map((r) => (
                <SelectorTile key={r} active={r === role} onClick={() => setRole(r)} label={ROLE_LABELS[r]} />
              ))}
            </div>
          </div>

          {/* Difficulty, selector rows with severity badge */}
          <div className="mt-5 flex flex-col gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Difficulty</span>
            <div className="flex flex-col gap-2">
              {scenario.difficulties.map((d) => (
                <SelectorTile
                  key={d}
                  active={d === difficulty}
                  onClick={() => setDifficulty(d)}
                  label={DIFFICULTY_LABELS[d]}
                  badge={SEV[d]}
                />
              ))}
            </div>
          </div>

          {error && <p className="mt-4 text-label text-rose-400">{error}</p>}

          <div className="mt-7 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button variant="accent" onClick={start} disabled={busy}>
              {busy ? (
                "Starting…"
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  Start drill <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
      </div>
    </div>,
    document.body,
  );
}

function SelectorTile({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: { label: string; cls: string };
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
        active
          ? "border-violet-500 bg-violet-500/15"
          : "border-panel-line bg-panel hover:border-violet-500/40",
      )}
    >
      <span className={cn("text-body-strong", active ? "text-[#F87171]" : "text-secondary")}>{label}</span>
      {badge && (
        <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold", badge.cls)}>
          {badge.label}
        </span>
      )}
    </button>
  );
}
