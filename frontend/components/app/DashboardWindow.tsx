"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ServerCrash, CreditCard, ShieldAlert, AlertTriangle, PackageX, Gauge,
  Search, Bell, Flame, Mic, LogOut, ArrowRight, X, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui";
import { Brand } from "@/components/app/Brand";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { ARCHETYPE_LABELS, DIFFICULTY_LABELS, ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { Archetype, Difficulty, Role, ScenarioSummary, SessionListItem } from "@shared/types";

const META: Record<Archetype, { short: string; icon: LucideIcon }> = {
  production_outage:  { short: "Outage",   icon: ServerCrash   },
  payment_failure:    { short: "Payments", icon: CreditCard    },
  security_alert:     { short: "Security", icon: ShieldAlert   },
  support_escalation: { short: "Support",  icon: AlertTriangle },
  broken_release:     { short: "Release",  icon: PackageX      },
  latency_spike:      { short: "Latency",  icon: Gauge         },
};
const CAT_ORDER = Object.keys(META) as Archetype[];

const SEV: Record<Difficulty, { label: string; tone: string; rank: number }> = {
  redline:          { label: "SEV-1", tone: "text-rose-400 bg-rose-500/10",    rank: 3 },
  production_like: { label: "SEV-2", tone: "text-amber-300 bg-amber-400/10", rank: 2 },
  warmup:          { label: "SEV-3", tone: "text-violet-300 bg-violet-500/10", rank: 1 },
};
const hardest = (d: Difficulty[]) => [...d].sort((a, b) => SEV[b].rank - SEV[a].rank)[0];

const ALL_ROLES: Role[]            = ["on_call_engineer", "incident_commander", "support_lead", "customer_support_agent", "ops_responder"];
const ALL_DIFFICULTIES: Difficulty[] = ["warmup", "production_like", "redline"];

const TABS = ["Recent", "By role", "Hardest", "Leaderboard"] as const;
type Tab = (typeof TABS)[number];

// Number of example-prompt chips shown in the Quick Start section (a random sample per load).
const QUICKSTART_CHIPS = 5;

function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}
function kFormat(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function statsFor(s: ScenarioSummary, sessions: SessionListItem[]) {
  const mine   = sessions.filter((x) => x.scenario_id === s.id);
  const scored = mine.filter((x) => x.status === "completed" && x.score != null).map((x) => x.score as number);
  const h      = hash(s.id);
  const calm   = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : 38 + (h % 37);
  const drills = mine.length ? String(mine.length) : kFormat(800 + (h % 4200));
  return { calm, drills };
}

// ─── Quick Start ─────────────────────────────────────────────────────────────

function QuickStart({ scenarios }: { scenarios: ScenarioSummary[] }) {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query,      setQuery]      = useState("");
  const [role,       setRole]       = useState<Role>(scenarios[0]?.roles[0] ?? "on_call_engineer");
  const [difficulty, setDifficulty] = useState<Difficulty>(scenarios[0]?.difficulties[0] ?? "warmup");
  const [busy,  setBusy]  = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A small random sample of example prompts, reshuffled once per page load.
  const [chips] = useState<ScenarioSummary[]>(() =>
    [...scenarios].sort(() => Math.random() - 0.5).slice(0, QUICKSTART_CHIPS),
  );

  // Best match: starts-with title → summary includes → archetype label includes
  const matched = useMemo<ScenarioSummary | null>(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return (
      scenarios.find((s) => s.title.toLowerCase().startsWith(q)) ??
      scenarios.find((s) => s.summary.toLowerCase().includes(q)) ??
      scenarios.find((s) => ARCHETYPE_LABELS[s.archetype].toLowerCase().includes(q)) ??
      null
    );
  }, [query, scenarios]);

  const scenario = matched ?? scenarios[0] ?? null;

  // Ghost suffix — only when query is a starts-with prefix of the matched title
  const ghost =
    matched && query && matched.title.toLowerCase().startsWith(query.toLowerCase())
      ? matched.title.slice(query.length)
      : "";

  // Keep role/difficulty valid when the active scenario changes
  useEffect(() => {
    if (!scenario) return;
    if (!scenario.roles.includes(role))              setRole(scenario.roles[0]);
    if (!scenario.difficulties.includes(difficulty)) setDifficulty(scenario.difficulties[0]);
  }, [scenario?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function accept(title: string) {
    setQuery(title);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Tab" || e.key === "ArrowRight") && ghost) {
      e.preventDefault();
      accept(matched!.title);
    }
    if (e.key === "Enter") void handleLaunch();
    if (e.key === "Escape") setQuery("");
  }

  async function handleLaunch() {
    if (!scenario || busy) return;
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

  // Author a brand-new scenario from the typed prompt via the LLM, then drop
  // straight into a drill on it. Role/difficulty fall back to the generated
  // scenario's own options when the current selection isn't offered.
  async function handleGenerate() {
    const prompt = query.trim();
    if (!prompt || busy || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const sc = await api.generateScenario(prompt);
      const r = sc.roles.includes(role) ? role : sc.roles[0];
      const d = sc.difficulties.includes(difficulty) ? difficulty : sc.difficulties[0];
      const session = await api.createSession({ scenario_id: sc.id, role: r, difficulty: d });
      router.push(`/drill/${session.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not generate a scenario.");
      setGenerating(false);
    }
  }

  const ScenIcon   = scenario ? META[scenario.archetype].icon : Mic;
  const availRoles = scenario?.roles ?? ALL_ROLES;
  const availDiffs = scenario?.difficulties ?? ALL_DIFFICULTIES;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-panel">
      {/* Top gradient accent stripe */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      {/* Ambient violet glow centred behind the input */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 h-48 w-[560px] -translate-x-1/2"
        style={{
          background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 68%)",
          filter: "blur(28px)",
        }}
      />

      {/* ── Top section ─────────────────────────────────────── */}
      <div className="relative px-6 pb-5 pt-6">

        {/* Header */}
        <div className="mb-5 flex items-center gap-2.5">
          <img src="/logo.svg" alt="Redline" className="h-9 w-9 shrink-0" />
          <div className="leading-tight">
            <p className="text-[14px] font-semibold text-white">Quick Start</p>
            <p className="text-[11px] text-muted">Pick a scenario below, or describe your own and hit Generate</p>
          </div>
          {scenario && (
            <div className="ml-auto hidden items-center gap-2 rounded-full border border-panel-line bg-panel-2 px-3 py-1.5 text-[11px] sm:flex">
              <ScenIcon className="h-3.5 w-3.5 text-violet-300" />
              <span className="text-secondary">{META[scenario.archetype].short}</span>
              <span className="h-3 w-px bg-panel-line" />
              <span className="max-w-[180px] truncate font-medium text-white">{scenario.title}</span>
            </div>
          )}
        </div>

        {/* ── Large search / command input ── */}
        <div className="relative rounded-xl border border-panel-line bg-ink-2 transition-all duration-200 focus-within:border-violet-500/55 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]">
          {/* Ghost completion — invisible spacer ensures alignment with typed text */}
          {ghost && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden rounded-xl px-5 font-sans text-[18px] font-normal leading-none"
              aria-hidden
            >
              <span className="invisible whitespace-pre">{query}</span>
              <span className="whitespace-pre" style={{ color: "rgba(111,103,137,0.45)" }}>{ghost}</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            aria-label="Search or describe a scenario"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "database is down" or "payment failures"…'
            className="relative z-10 w-full bg-transparent py-4 pl-5 pr-14 text-[18px] font-normal text-white placeholder:text-muted/35 focus:outline-none"
          />
          {query ? (
            <button
              aria-label="Clear"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:bg-panel-2 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="rounded border border-panel-line px-1.5 py-0.5 font-mono text-[10px] text-muted/50">↵</kbd>
            </div>
          )}
        </div>

        {/* ── Scenario chips ── */}
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((s) => {
            const CIcon    = META[s.archetype].icon;
            const isActive = scenario?.id === s.id && query.trim() !== "";
            return (
              <button
                key={s.id}
                onClick={() => accept(s.title)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-150",
                  isActive
                    ? "border-violet-500/60 bg-violet-500/18 text-violet-200 shadow-[0_0_12px_-2px_rgba(124,58,237,0.35)]"
                    : "border-panel-line bg-panel-2 text-secondary hover:border-violet-500/35 hover:bg-violet-500/10 hover:text-white",
                )}
              >
                <CIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom bar: role · difficulty · launch ──────────── */}
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-panel-line bg-ink-2/50 px-6 py-4">

        {/* Role pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Role</span>
          {availRoles.map((r) => (
            <button
              key={r}
              aria-pressed={r === role}
              onClick={() => setRole(r)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-150",
                r === role
                  ? "bg-violet-500/22 text-violet-200 ring-1 ring-inset ring-violet-500/45"
                  : "bg-panel-2 text-secondary hover:bg-panel-2 hover:text-white",
              )}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        <div className="hidden h-4 w-px shrink-0 bg-panel-line sm:block" />

        {/* Difficulty pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Difficulty</span>
          {availDiffs.map((d) => {
            const sev   = SEV[d];
            const [txt] = sev.tone.split(" ");
            return (
              <button
                key={d}
                aria-pressed={d === difficulty}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-150",
                  d === difficulty
                    ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                    : "border-panel-line bg-panel-2 text-secondary hover:border-violet-500/30 hover:text-white",
                )}
              >
                <span className={cn("font-mono text-[9px] font-bold", txt)}>{sev.label}</span>
                {DIFFICULTY_LABELS[d]}
              </button>
            );
          })}
        </div>

        {/* Push launch to the far right */}
        <div className="flex-1" />

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            {/* Generate a NEW scenario from the typed prompt (LLM), then launch it. */}
            <button
              onClick={() => void handleGenerate()}
              disabled={generating || busy || !query.trim()}
              title="Generate a brand-new scenario from your prompt"
              className="flex items-center gap-2 rounded-xl border border-violet-500/45 bg-violet-500/15 px-4 py-2.5 text-[13px] font-semibold text-violet-200 transition-all duration-150 hover:bg-violet-500/25 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
            <button
              onClick={() => void handleLaunch()}
              disabled={busy || generating || !scenario}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-[13px] font-semibold text-ink shadow-[0_2px_20px_-4px_rgba(255,255,255,0.2)] transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_4px_28px_-4px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {busy ? "Starting…" : <><span>Launch Drill</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
          {error && <p className="text-[11px] text-rose-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

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
  const router  = useRouter();
  const [tab,  setTab]  = useState<Tab>("Recent");
  const [cat,  setCat]  = useState<Archetype | "all">("all");
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

  return (
    <>
      {/* ── Sticky header ─────────────────────────────── */}
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
                      onClick={() => { logout(); router.replace("/login"); }}
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

      {/* ── Category toolbar ──────────────────────────── */}
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

      {/* ── Content ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 px-6 py-6 sm:px-8">
        {/* Quick Start — full-width banner above the grid */}
        <QuickStart scenarios={scenarios} />

        {/* Scenario grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visible.map((s) => (
            <ScenarioCard key={s.id} s={s} sessions={sessions} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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
  const Icon     = META[s.archetype].icon;
  const sev      = SEV[hardest(s.difficulties)];
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
        <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold", sev.tone)}>
          {sev.label}
        </span>
      </div>

      <p className="line-clamp-3 min-h-[40px] text-[13px] font-medium leading-snug text-primary">{s.summary}</p>

      {/* mt-auto pushes the bars + labels + footer to the card's bottom so every
          "Run drill" button aligns on the same baseline regardless of summary length. */}
      <div className="mt-auto flex items-center gap-2">
        <div className="flex flex-1 overflow-hidden rounded-full">
          <div className="h-1.5 rounded-l-full bg-emerald-400/80" style={{ width: `${calm}%` }} />
          <div className="h-1.5 rounded-r-full bg-rose-500/70"    style={{ width: `${escalate}%` }} />
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
