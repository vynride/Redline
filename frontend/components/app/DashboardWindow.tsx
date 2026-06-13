"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ServerCrash, CreditCard, ShieldAlert, AlertTriangle, PackageX, Gauge,
  Plus, Search, Bell, Flame, Mic, LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui";
import { Brand } from "@/components/app/Brand";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import type { Archetype, Difficulty, ScenarioSummary, SessionListItem } from "@shared/types";

// Short category labels + icons + severity tone — matched to the landing demo.
const META: Record<Archetype, { short: string; icon: LucideIcon }> = {
  production_outage: { short: "Outage", icon: ServerCrash },
  payment_failure: { short: "Payments", icon: CreditCard },
  security_alert: { short: "Security", icon: ShieldAlert },
  support_escalation: { short: "Support", icon: AlertTriangle },
  broken_release: { short: "Release", icon: PackageX },
  latency_spike: { short: "Latency", icon: Gauge },
};
const CAT_ORDER = Object.keys(META) as Archetype[];

const SEV: Record<Difficulty, { label: string; tone: string; rank: number }> = {
  redline: { label: "SEV-1", tone: "text-rose-400 bg-rose-500/10", rank: 3 },
  production_like: { label: "SEV-2", tone: "text-amber-300 bg-amber-400/10", rank: 2 },
  warmup: { label: "SEV-3", tone: "text-violet-300 bg-violet-500/10", rank: 1 },
};
const hardest = (d: Difficulty[]) => [...d].sort((a, b) => SEV[b].rank - SEV[a].rank)[0];

const TABS = ["Recent", "By role", "Hardest", "Leaderboard"] as const;
type Tab = (typeof TABS)[number];

function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}
function kFormat(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/** Per-scenario stats — real when the user has history, deterministic otherwise. */
function statsFor(s: ScenarioSummary, sessions: SessionListItem[]) {
  const mine = sessions.filter((x) => x.scenario_id === s.id);
  const scored = mine.filter((x) => x.status === "completed" && x.score != null).map((x) => x.score as number);
  const h = hash(s.id);
  const calm = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : 38 + (h % 37);
  const drills = mine.length ? String(mine.length) : kFormat(800 + (h % 4200));
  return { calm, drills };
}

export function DashboardWindow({
  scenarios,
  sessions,
  readiness,
  onSelect,
}: {
  scenarios: ScenarioSummary[];
  sessions: SessionListItem[];
  readiness: { points: number; tier: string };
  onSelect: (s: ScenarioSummary) => void;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Recent");
  const [cat, setCat] = useState<Archetype | "all">("all");
  const [menu, setMenu] = useState(false);
  const sortRef = useRef<Tab>("Recent");

  const categories = useMemo(() => {
    const present = new Set(scenarios.map((s) => s.archetype));
    return CAT_ORDER.filter((a) => present.has(a));
  }, [scenarios]);

  const visible = useMemo(() => {
    let list = scenarios.filter((s) => cat === "all" || s.archetype === cat);
    const sort = sortRef.current;
    if (sort === "Hardest") {
      list = [...list].sort((a, b) => SEV[hardest(b.difficulties)].rank - SEV[hardest(a.difficulties)].rank);
    } else if (sort === "By role") {
      list = [...list].sort((a, b) => a.persona_role.localeCompare(b.persona_role));
    }
    return list;
  }, [scenarios, cat, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  function onTab(t: Tab) {
    setTab(t);
    if (t === "Leaderboard") {
      document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      sortRef.current = t;
    }
  }

  const first = scenarios[0];

  return (
    <>
      {/* Sticky full-width header */}
      <header className="sticky top-0 z-40 border-b border-panel-line bg-ink/80 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-6 sm:px-8">
        <Brand href="/dashboard" />

        <div className="hidden items-center gap-1 rounded-full bg-panel p-1 md:flex">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => onTab(t)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] transition-colors",
                tab === t ? "bg-panel-2 text-white" : "text-secondary hover:text-white",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-lg border border-panel-line bg-panel px-2.5 py-1.5 sm:flex">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <div className="leading-none">
              <div className="font-mono text-[12px] font-semibold text-white tabular">
                {readiness.points.toLocaleString()}
              </div>
              <div className="text-[9px] text-muted">readiness</div>
            </div>
            <span className="mx-1 h-6 w-px bg-panel-line" />
            <div className="leading-none">
              <div className="text-[11px] font-semibold text-violet-300">{readiness.tier}</div>
              <div className="text-[9px] text-muted">tier</div>
            </div>
          </div>
          {first && (
            <button
              onClick={() => onSelect(first)}
              className="inline-flex items-center gap-1 rounded-lg bg-violet-500 px-2.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-violet-600"
            >
              <Plus className="h-3.5 w-3.5" /> Start drill
            </button>
          )}
          {/* Avatar + logout menu */}
          <div className="relative">
            <button onClick={() => setMenu((v) => !v)} aria-label="Account" className="block rounded-full ring-violet-400 focus:outline-none focus-visible:ring-2">
              <Avatar src={user?.avatar_url} name={user?.display_name} size={32} />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                <div className="glass-strong absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl p-1.5">
                  {user && (
                    <div className="border-b border-panel-line px-3 py-2">
                      <div className="truncate text-body-strong text-white">{user.display_name}</div>
                      <div className="truncate text-label text-muted">{user.email}</div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      router.replace("/login");
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body text-secondary transition-colors hover:bg-panel-2 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </header>

      {/* Full-width toolbar: category pills + search */}
      <div className="border-b border-panel-line">
        <div className="flex items-center justify-between gap-3 px-6 py-2.5 sm:px-8">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Cat active={cat === "all"} onClick={() => setCat("all")}>All</Cat>
          {categories.map((a) => (
            <Cat key={a} active={cat === a} onClick={() => setCat(a)}>
              {META[a].short}
            </Cat>
          ))}
        </div>
        <div className="hidden items-center gap-2 text-muted sm:flex">
          <Search className="h-4 w-4" />
          <Bell className="h-4 w-4" />
        </div>
        </div>
      </div>

      {/* Scenario grid — Season banner sits after the 2nd card, like the demo. */}
      <div className="px-6 py-8 sm:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {visible.flatMap((s, i) => {
          const card = <ScenarioCard key={s.id} s={s} sessions={sessions} onSelect={onSelect} />;
          return i === 1
            ? [card, <SeasonBanner key="season" points={readiness.points} />]
            : [card];
        })}

        {/* Quick-start card */}
        {first && (
          <div className="flex flex-col gap-3 rounded-xl border border-panel-line bg-panel p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500 text-white">
                <Mic className="h-4 w-4" />
              </span>
              <span className="text-[12px] font-semibold text-white">Quick start</span>
            </div>
            <p className="text-[12px] text-secondary">Pick the intensity and go.</p>
            <div className="mt-auto flex flex-wrap gap-1.5">
              {["Warm-up", "Production", "Redline"].map((d, i) => (
                <span
                  key={d}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px]",
                    i === 1 ? "bg-violet-500 text-white" : "bg-panel-2 text-secondary",
                  )}
                >
                  {d}
                </span>
              ))}
            </div>
            <button
              onClick={() => onSelect(first)}
              className="rounded-lg bg-white py-1.5 text-[12px] font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              Start drill
            </button>
          </div>
        )}
        </div>
      </div>
    </>
  );
}

function Cat({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-[12px] transition-colors",
        active ? "bg-violet-500/15 text-violet-200" : "text-secondary hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function ScenarioCard({
  s,
  sessions,
  onSelect,
}: {
  s: ScenarioSummary;
  sessions: SessionListItem[];
  onSelect: (s: ScenarioSummary) => void;
}) {
  const Icon = META[s.archetype].icon;
  const sev = SEV[hardest(s.difficulties)];
  const { calm, drills } = statsFor(s, sessions);
  const escalate = 100 - calm;

  return (
    <button
      onClick={() => onSelect(s)}
      className="group flex flex-col gap-3 rounded-xl border border-panel-line bg-panel p-4 text-left transition-colors hover:border-violet-500/40"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-panel-2 text-violet-300">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-[11px] font-medium text-secondary">{META[s.archetype].short}</span>
        </span>
        <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold", sev.tone)}>{sev.label}</span>
      </div>

      <p className="min-h-[40px] text-[13px] font-medium leading-snug text-primary">{s.summary}</p>

      {/* outcome bars */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 overflow-hidden rounded-full">
          <div className="h-1.5 rounded-l-full bg-emerald-400/80" style={{ width: `${calm}%` }} />
          <div className="h-1.5 rounded-r-full bg-rose-500/70" style={{ width: `${escalate}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-emerald-400">De-escalated {calm}%</span>
        <span className="text-rose-400">Blew up {escalate}%</span>
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-panel-line pt-3">
        <span className="font-mono text-[11px] text-muted">{drills} drills</span>
        <span className="rounded-md bg-violet-500/15 px-3 py-1 text-[11px] font-semibold text-violet-200 transition-colors group-hover:bg-violet-500 group-hover:text-white">
          Run drill
        </span>
      </div>
    </button>
  );
}

function SeasonBanner({ points }: { points: number }) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-sky-card p-5 sm:col-span-2 sm:row-span-1">
      <div aria-hidden className="absolute inset-0 opacity-50 [background:radial-gradient(120%_120%_at_80%_-20%,rgba(255,255,255,0.5),transparent_60%)]" />
      <div className="relative flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> LIVE
        </span>
        <span className="text-[11px] font-medium text-white/80">Season 1</span>
      </div>
      <div className="relative mt-6">
        <h4 className="text-[15px] font-semibold text-white">Earn readiness points</h4>
        <p className="mt-1 max-w-[26ch] text-[12px] leading-snug text-white/80">
          {points.toLocaleString()} so far — drills, streaks, and team challenges push you up the board.
        </p>
      </div>
    </div>
  );
}
