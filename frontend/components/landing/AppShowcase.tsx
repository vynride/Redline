"use client";

import {
  ServerCrash, CreditCard, ShieldAlert, AlertTriangle, PackageX, Gauge,
  Plus, Search, Bell, Flame, Mic,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS = ["Recent", "By role", "Hardest", "Leaderboard"];
const CATS = ["Outage", "Payments", "Security", "Support", "Release", "Latency"];

type Scenario = {
  icon: LucideIcon;
  cat: string;
  sev: string;
  sevTone: string;
  q: string;
  calm: number;
  drills: string;
  featured?: boolean;
};

const SCENARIOS: Scenario[] = [
  { icon: ServerCrash, cat: "Outage", sev: "SEV-1", sevTone: "text-rose-400 bg-rose-500/10", q: "Checkout is down and the VP wants answers now. Hold the bridge.", calm: 62, drills: "4.2k" },
  { icon: CreditCard, cat: "Payments", sev: "SEV-2", sevTone: "text-amber-300 bg-amber-400/10", q: "Customers are getting double-charged. Stop the bleeding on the call.", calm: 48, drills: "2.1k" },
  { icon: ShieldAlert, cat: "Security", sev: "SEV-1", sevTone: "text-rose-400 bg-rose-500/10", q: "Possible data exposure. Contain first, brief legal without panic.", calm: 35, drills: "3.5k" },
  { icon: AlertTriangle, cat: "Support", sev: "SEV-3", sevTone: "text-violet-300 bg-violet-500/10", q: "A furious enterprise customer threatens to churn live on the call.", calm: 71, drills: "1.4k" },
  { icon: PackageX, cat: "Release", sev: "SEV-2", sevTone: "text-amber-300 bg-amber-400/10", q: "A bad deploy is in the wild and leadership is watching the channel.", calm: 54, drills: "2.8k" },
  { icon: Gauge, cat: "Latency", sev: "SEV-3", sevTone: "text-violet-300 bg-violet-500/10", q: "Everything is slow, nothing is down, and the cause is hiding.", calm: 58, drills: "1.9k" },
];

function ScenarioCard({ s }: { s: Scenario }) {
  const Icon = s.icon;
  const escalate = 100 - s.calm;
  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-panel-line bg-panel p-4 transition-colors hover:border-violet-500/40">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-panel-2 text-violet-300">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-[11px] font-medium text-secondary">{s.cat}</span>
        </span>
        <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold ${s.sevTone}`}>{s.sev}</span>
      </div>

      <p className="min-h-[40px] text-[13px] font-medium leading-snug text-primary">{s.q}</p>

      {/* outcome bars (how others did) */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 overflow-hidden rounded-full">
          <div className="h-1.5 rounded-l-full bg-emerald-400/80" style={{ width: `${s.calm}%` }} />
          <div className="h-1.5 rounded-r-full bg-rose-500/70" style={{ width: `${escalate}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-emerald-400">De-escalated {s.calm}%</span>
        <span className="text-rose-400">Blew up {escalate}%</span>
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-panel-line pt-3">
        <span className="font-mono text-[11px] text-muted">{s.drills} drills</span>
        <button className="rounded-md bg-violet-500/15 px-3 py-1 text-[11px] font-semibold text-violet-200 transition-colors group-hover:bg-violet-500 group-hover:text-white">
          Run drill
        </button>
      </div>
    </div>
  );
}

function SeasonBanner() {
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
          Drills, streaks, and team challenges all push you up the board.
        </p>
      </div>
    </div>
  );
}

export function AppShowcase() {
  return (
    <div className="overflow-hidden rounded-t-2xl border border-panel-line bg-ink-2 shadow-[0_-20px_80px_-30px_rgba(124,58,237,0.5),0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:rounded-t-3xl">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-panel-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-6 w-6" />
          <span className="text-[15px] font-semibold tracking-[0.1em] text-white">REDLINE</span>
        </div>

        <div className="hidden items-center gap-1 rounded-full bg-panel p-1 md:flex">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={`rounded-full px-3 py-1 text-[12px] ${
                i === 0 ? "bg-panel-2 text-white" : "text-secondary"
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-lg border border-panel-line bg-panel px-2.5 py-1.5 sm:flex">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <div className="leading-none">
              <div className="font-mono text-[12px] font-semibold text-white tabular">2,037</div>
              <div className="text-[9px] text-muted">readiness</div>
            </div>
            <span className="mx-1 h-6 w-px bg-panel-line" />
            <div className="leading-none">
              <div className="text-[11px] font-semibold text-violet-300">Silver</div>
              <div className="text-[9px] text-muted">tier</div>
            </div>
          </div>
          <button className="inline-flex items-center gap-1 rounded-lg bg-violet-500 px-2.5 py-1.5 text-[12px] font-semibold text-white">
            <Plus className="h-3.5 w-3.5" /> Start drill
          </button>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-violet-700 text-[11px] font-bold text-white">
            VW
          </span>
        </div>
      </div>

      {/* Sub bar: category pills + search */}
      <div className="flex items-center justify-between gap-3 border-b border-panel-line px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATS.map((c, i) => (
            <span
              key={c}
              className={`shrink-0 rounded-full px-3 py-1 text-[12px] ${
                i === 0 ? "bg-violet-500/15 text-violet-200" : "text-secondary"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="hidden items-center gap-2 text-muted sm:flex">
          <Search className="h-4 w-4" />
          <Bell className="h-4 w-4" />
        </div>
      </div>

      {/* Scenario grid */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-4">
        <ScenarioCard s={SCENARIOS[0]} />
        <ScenarioCard s={SCENARIOS[1]} />
        <SeasonBanner />
        <ScenarioCard s={SCENARIOS[2]} />
        <ScenarioCard s={SCENARIOS[3]} />
        <ScenarioCard s={SCENARIOS[4]} />
        <ScenarioCard s={SCENARIOS[5]} />
        {/* Quick-start (difficulty picker) card */}
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
                className={`rounded-md px-2 py-1 text-[11px] ${
                  i === 1 ? "bg-violet-500 text-white" : "bg-panel-2 text-secondary"
                }`}
              >
                {d}
              </span>
            ))}
          </div>
          <button className="rounded-lg bg-white py-1.5 text-[12px] font-semibold text-ink">Start drill</button>
        </div>
      </div>
    </div>
  );
}
