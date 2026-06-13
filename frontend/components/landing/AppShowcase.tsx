"use client";

import {
  ServerCrash, CreditCard, ShieldAlert, AlertTriangle, PackageX, Gauge,
  Search, Bell, Flame, Sparkles, ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS = ["Recent", "By role", "Hardest", "Leaderboard"];
const CATS = ["All", "Outage", "Payments", "Security", "Support", "Release", "Latency"];

type Scenario = {
  icon: LucideIcon;
  cat: string;
  sev: string;
  sevTone: string;
  summary: string;
  calm: number;
  drills: string;
};

const SCENARIOS: Scenario[] = [
  { icon: ServerCrash, cat: "Outage", sev: "SEV-1", sevTone: "text-rose-400 bg-rose-500/10", summary: "Checkout is returning 500s across all regions and an enterprise customer just joined the bridge.", calm: 62, drills: "4.2k" },
  { icon: CreditCard, cat: "Payments", sev: "SEV-2", sevTone: "text-amber-300 bg-amber-400/10", summary: "Customers are being double-charged on renewal. Stop the bleeding and reassure the partner.", calm: 48, drills: "2.1k" },
  { icon: ShieldAlert, cat: "Security", sev: "SEV-1", sevTone: "text-rose-400 bg-rose-500/10", summary: "Leaked API credentials are live in a public repo. Contain first, brief the privacy officer.", calm: 35, drills: "3.5k" },
  { icon: AlertTriangle, cat: "Support", sev: "SEV-3", sevTone: "text-violet-300 bg-violet-500/10", summary: "A furious enterprise customer threatens to churn live on the call after a data-loss scare.", calm: 71, drills: "1.4k" },
  { icon: PackageX, cat: "Release", sev: "SEV-2", sevTone: "text-amber-300 bg-amber-400/10", summary: "A bad migration shipped and leadership is watching the incident channel in real time.", calm: 54, drills: "2.8k" },
  { icon: Gauge, cat: "Latency", sev: "SEV-3", sevTone: "text-violet-300 bg-violet-500/10", summary: "Checkout p99 climbed from 300ms to 9s. Everything is slow, nothing is down, the cause is hiding.", calm: 58, drills: "1.9k" },
  { icon: ServerCrash, cat: "Outage", sev: "SEV-2", sevTone: "text-amber-300 bg-amber-400/10", summary: "The primary database is down and the replica's lag is unknown. Decide on a failover.", calm: 44, drills: "3.1k" },
  { icon: CreditCard, cat: "Payments", sev: "SEV-1", sevTone: "text-rose-400 bg-rose-500/10", summary: "Payouts to sellers have stalled for six hours. A partner manager wants a concrete ETA.", calm: 51, drills: "1.7k" },
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

      <p className="line-clamp-3 min-h-[40px] text-[13px] font-medium leading-snug text-primary">{s.summary}</p>

      <div className="mt-auto flex items-center gap-2">
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
        <span className="rounded-md bg-violet-500/15 px-3 py-1 text-[11px] font-semibold text-violet-200 transition-colors group-hover:bg-violet-500 group-hover:text-white">
          Run drill
        </span>
      </div>
    </div>
  );
}

/** Static replica of the real dashboard's Quick Start command bar. */
function QuickStart() {
  const chips = [
    { icon: ServerCrash, title: "Primary Database Down" },
    { icon: CreditCard, title: "Payment API Outage" },
    { icon: ShieldAlert, title: "Leaked API Credentials" },
    { icon: Gauge, title: "Cache Stampede" },
    { icon: AlertTriangle, title: "Enterprise Escalation" },
  ];
  const roles = ["On-call engineer", "Incident commander", "Ops responder"];
  const diffs = [
    { label: "Warm-up", sev: "SEV-3", tone: "text-violet-300" },
    { label: "Production-like", sev: "SEV-2", tone: "text-amber-300" },
    { label: "Redline", sev: "SEV-1", tone: "text-rose-400" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-panel">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
      <div
        className="pointer-events-none absolute -top-16 left-1/2 h-48 w-[560px] -translate-x-1/2"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 68%)", filter: "blur(28px)" }}
      />

      {/* Top section */}
      <div className="relative px-6 pb-5 pt-6">
        <div className="mb-5 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Redline" className="h-9 w-9 shrink-0" />
          <div className="leading-tight">
            <p className="text-[14px] font-semibold text-white">Quick Start</p>
            <p className="text-[11px] text-muted">Pick a scenario below, or describe your own and hit Generate</p>
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-full border border-panel-line bg-panel-2 px-3 py-1.5 text-[11px] sm:flex">
            <ServerCrash className="h-3.5 w-3.5 text-violet-300" />
            <span className="text-secondary">Outage</span>
            <span className="h-3 w-px bg-panel-line" />
            <span className="max-w-[180px] truncate font-medium text-white">Primary Database Down</span>
          </div>
        </div>

        {/* Large command input */}
        <div className="relative rounded-xl border border-panel-line bg-ink-2">
          <div className="flex items-center py-4 pl-5 pr-14 text-[18px] text-muted/40">
            e.g. &quot;database is down&quot; or &quot;payment failures&quot;…
          </div>
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 rounded border border-panel-line px-1.5 py-0.5 font-mono text-[10px] text-muted/50">↵</kbd>
        </div>

        {/* Scenario chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c.title}
              className="flex items-center gap-1.5 rounded-full border border-panel-line bg-panel-2 px-3 py-1.5 text-[12px] font-medium text-secondary"
            >
              <c.icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
              {c.title}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom bar: role · difficulty · launch */}
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-panel-line bg-ink-2/50 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Role</span>
          {roles.map((r, i) => (
            <span
              key={r}
              className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                i === 0 ? "bg-violet-500/22 text-violet-200 ring-1 ring-inset ring-violet-500/45" : "bg-panel-2 text-secondary"
              }`}
            >
              {r}
            </span>
          ))}
        </div>

        <div className="hidden h-4 w-px shrink-0 bg-panel-line sm:block" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Difficulty</span>
          {diffs.map((d, i) => (
            <span
              key={d.label}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${
                i === 1 ? "border-violet-500/50 bg-violet-500/15 text-violet-200" : "border-panel-line bg-panel-2 text-secondary"
              }`}
            >
              <span className={`font-mono text-[9px] font-bold ${d.tone}`}>{d.sev}</span>
              {d.label}
            </span>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-xl border border-violet-500/45 bg-violet-500/15 px-4 py-2.5 text-[13px] font-semibold text-violet-200">
            <Sparkles className="h-4 w-4" /> Generate
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-[13px] font-semibold text-ink shadow-[0_2px_20px_-4px_rgba(255,255,255,0.2)]">
            Launch Drill <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function AppShowcase() {
  return (
    <div className="overflow-hidden rounded-t-2xl border border-panel-line bg-ink-2 shadow-[0_-20px_80px_-30px_rgba(124,58,237,0.5),0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:rounded-t-3xl">
      {/* Sticky-style header: brand · tabs · readiness · avatar */}
      <div className="flex items-center justify-between gap-3 border-b border-panel-line px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-6 w-6" />
          <span className="text-[15px] font-semibold tracking-[0.1em] text-white">REDLINE</span>
        </div>

        <div className="hidden items-center gap-1 rounded-full bg-panel p-1 md:flex">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={`rounded-full px-3 py-1 text-[12px] ${i === 0 ? "bg-panel-2 text-white" : "text-secondary"}`}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-lg border border-panel-line bg-panel px-2.5 py-1.5 sm:flex">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <div className="leading-none">
              <div className="font-mono text-[12px] font-semibold tabular text-white">2,037</div>
              <div className="text-[9px] text-muted">readiness</div>
            </div>
            <span className="mx-1 h-6 w-px bg-panel-line" />
            <div className="leading-none">
              <div className="text-[11px] font-semibold text-violet-300">Silver</div>
              <div className="text-[9px] text-muted">tier</div>
            </div>
          </div>
          <span className="h-8 w-8 rounded-full" style={{ background: "linear-gradient(135deg,#38bdf8,#6366f1)" }} />
        </div>
      </div>

      {/* Category toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-panel-line px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATS.map((c, i) => (
            <span
              key={c}
              className={`shrink-0 rounded-full px-3 py-1 text-[12px] ${i === 0 ? "bg-violet-500/15 text-violet-200" : "text-secondary"}`}
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

      {/* Content: Quick Start command bar + scenario grid */}
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <QuickStart />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SCENARIOS.map((s, i) => (
            <ScenarioCard key={i} s={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
