"use client";

import { motion } from "framer-motion";
import { Crown, Flame, Trophy, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "./primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

function Block({
  flip,
  tag,
  TagIcon,
  title,
  accent,
  body,
  mock,
}: {
  flip?: boolean;
  tag: string;
  TagIcon: typeof Flame;
  title: string;
  accent: string;
  body: string;
  mock: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal variant="up" className={flip ? "lg:order-2" : ""}>
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-panel-line bg-panel px-3 py-1.5 text-label text-violet-300">
            <TagIcon className="h-4 w-4" /> {tag}
          </span>
          <h3 className="text-balance text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-white">
            {title} <span className="text-[#F87171]">{accent}</span>
          </h3>
          <p className="max-w-md text-body-lg text-secondary">{body}</p>
        </div>
      </Reveal>
      <Reveal variant="scale" delay={0.08} className={flip ? "lg:order-1" : ""}>
        <div className="rounded-2xl border border-panel-line bg-panel-2/40 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          {mock}
        </div>
      </Reveal>
    </div>
  );
}

/* ----- mocks ----------------------------------------------------------- */

function BuildMock() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl border border-panel-line bg-ink/60 px-4 py-3">
        <div>
          <div className="text-[11px] text-muted">Built from</div>
          <div className="font-mono text-[13px] text-primary">postmortem-2024-11-payments.md</div>
        </div>
        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
          Active
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { k: "Sessions", v: "1,284" },
          { k: "Avg sev drop", v: "−34" },
          { k: "Best streak", v: "9" },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-panel-line bg-ink/60 p-3 text-center">
            <div className="font-mono text-stat-mono text-white tabular">{s.v}</div>
            <div className="text-[10px] text-muted">{s.k}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-panel-line bg-ink/60 px-4 py-3">
        <span className="font-mono text-[11px] text-muted">role:</span>
        <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[11px] text-violet-200">Incident Commander</span>
        <span className="rounded-md bg-panel-2 px-2 py-0.5 text-[11px] text-secondary">Support Lead</span>
      </div>
    </div>
  );
}

function StreakMock() {
  const bars = [40, 55, 50, 70, 65, 85, 100];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-secondary">Readiness multiplier</span>
        <span className="font-mono text-stat-mono text-[#F87171]">3.0×</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
        className="grid h-32 grid-cols-7 items-end gap-2"
      >
        {bars.map((b, i) => (
          <div
            key={i}
            style={{ height: `${b}%` }}
            className={`w-full rounded-t ${
              i === bars.length - 1 ? "bg-[#F87171]" : "bg-violet-500/60"
            }`}
          />
        ))}
      </motion.div>
      <div className="flex items-center justify-between border-t border-panel-line pt-3 text-[11px]">
        <span className="text-muted">7-drill win streak</span>
        <span className="text-emerald-400">+ bonus tier unlocked</span>
      </div>
    </div>
  );
}

function LeaderboardMock() {
  const rows = [
    { rank: 1, who: "ops_kira", pts: "24.5k", you: false },
    { rank: 2, who: "sev1_sam", pts: "22.1k", you: false },
    { rank: 3, who: "YOU", pts: "21.5k", you: true },
    { rank: 4, who: "nightshift_lee", pts: "19.8k", you: false },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((r) => (
        <div
          key={r.rank}
          className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${
            r.you ? "border border-violet-500/40 bg-violet-500/10" : "bg-ink/40"
          }`}
        >
          <span className="flex items-center gap-3">
            <span className={`font-mono text-[12px] ${r.you ? "text-[#F87171]" : "text-muted"}`}>
              #{r.rank}
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-violet-700 text-[10px] font-bold text-white">
              {r.who.slice(0, 2).toUpperCase()}
            </span>
            <span className={`text-[13px] ${r.you ? "font-semibold text-white" : "text-secondary"}`}>
              {r.who}
            </span>
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[12px] text-white tabular">
            {r.rank === 1 && <Crown className="h-3.5 w-3.5 text-amber-400" />}
            {r.pts}
          </span>
        </div>
      ))}
    </div>
  );
}

function IntensityMock() {
  const levels = [
    { x: "Warm-up", ret: "+1×", on: false },
    { x: "Production", ret: "+2×", on: false },
    { x: "Redline", ret: "+3×", on: true },
    { x: "Blackout", ret: "+5×", on: false },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-secondary">Intensity</span>
        <span className="font-mono text-stat-mono text-white">5× MAX</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {levels.map((l) => (
          <div
            key={l.x}
            className={`rounded-xl border p-3 text-center ${
              l.on ? "border-violet-500 bg-violet-500/15" : "border-panel-line bg-ink/50"
            }`}
          >
            <div className={`font-mono text-[15px] font-bold ${l.on ? "text-[#F87171]" : "text-white"}`}>
              {l.ret}
            </div>
            <div className="mt-1 text-[10px] text-muted">{l.x}</div>
          </div>
        ))}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-panel-2">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-violet-500 to-[#F87171]" />
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section className="relative bg-ink py-24 sm:py-28">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-24 px-6 lg:gap-32">
        <Block
          tag="Custom scenarios"
          TagIcon={Wand2}
          title="Build your own"
          accent="drills."
          body="Turn last quarter's real outage into a repeatable drill. Set the role, the stakes, and the hidden facts, then make the whole team rehearse it."
          mock={<BuildMock />}
        />
        <Block
          flip
          tag="Streak rewards"
          TagIcon={Flame}
          title="Keep the"
          accent="streak."
          body="String together clean drills to unlock multipliers and harder tiers. Readiness compounds, and so does the muscle memory."
          mock={<StreakMock />}
        />
        <Block
          tag="Global leaderboard"
          TagIcon={Trophy}
          title="Climb the"
          accent="ranks."
          body="Compete with responders worldwide. Showcase that you stay calm when it counts, and watch yourself move up the board, drill by drill."
          mock={<LeaderboardMock />}
        />
        <Block
          flip
          tag="Intensity engine"
          TagIcon={Flame}
          title="Crank the"
          accent="difficulty."
          body="From warm-up to total blackout. Higher intensity means a nastier persona, faster-rising severity, and bigger readiness gains."
          mock={<IntensityMock />}
        />
      </div>
    </section>
  );
}
