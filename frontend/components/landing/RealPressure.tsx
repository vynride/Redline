"use client";

import { motion } from "framer-motion";
import { ServerCrash, CreditCard, ShieldAlert, AlertTriangle } from "lucide-react";
import { Reveal, TwoTone } from "./primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Reactive-persona chat mock. */
function PersonaMock() {
  const lines = [
    { who: "persona", text: "You said five minutes. It's been twenty.", tone: "left" },
    { who: "you", text: "You're right. Here's exactly where we are —", tone: "right" },
    { who: "persona", text: "Don't manage me. Is it fixed or not?", tone: "left" },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: l.tone === "right" ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.15, ease: EASE }}
          className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
            l.tone === "right"
              ? "ml-auto bg-violet-500 text-white"
              : "border border-panel-line bg-panel text-primary"
          }`}
        >
          <span className="mb-0.5 block text-[9px] uppercase tracking-[0.16em] opacity-60">
            {l.who === "you" ? "You" : "Persona"}
          </span>
          {l.text}
        </motion.div>
      ))}
      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
        mood: <span className="text-rose-400">agitated</span> · severity climbing
      </div>
    </div>
  );
}

/** Every-scenario category mock. */
function ScenarioListMock() {
  const items = [
    { icon: ServerCrash, t: "Production outage", v: "SEV-1", vol: "$—" },
    { icon: CreditCard, t: "Payment failure", v: "SEV-2", vol: "" },
    { icon: ShieldAlert, t: "Security alert", v: "SEV-1", vol: "" },
    { icon: AlertTriangle, t: "Support escalation", v: "SEV-3", vol: "" },
  ];
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.t}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
            className="flex items-center justify-between rounded-xl border border-panel-line bg-panel px-3 py-2.5"
          >
            <span className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-panel-2 text-violet-300">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-medium text-primary">{it.t}</span>
            </span>
            <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] text-rose-400">
              {it.v}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export function RealPressure() {
  return (
    <section id="product" className="relative border-t border-white/5 bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex flex-col items-center text-center">
          <TwoTone lead="Real Pressure," accent="Real Reps." />
          <Reveal variant="up">
            <p className="mt-5 max-w-xl text-body-lg text-secondary">
              Redline is where the outcome depends on what you actually say — not the runbook you
              skimmed once.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          <Reveal variant="up">
            <div className="flex h-full flex-col rounded-2xl border border-panel-line bg-panel-2/40 p-7">
              <h3 className="text-h2 text-white">Reactive personas</h3>
              <p className="mt-2 text-body text-secondary">
                The persona reads your tone and substance. Reassure well and severity drops; hedge or
                over-promise and it climbs. No two runs play out the same.
              </p>
              <div className="mt-6 rounded-2xl border border-panel-line bg-ink/60 p-4">
                <PersonaMock />
              </div>
            </div>
          </Reveal>

          <Reveal variant="up" delay={0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-panel-line bg-panel-2/40 p-7">
              <h3 className="text-h2 text-white">Every scenario</h3>
              <p className="mt-2 text-body text-secondary">
                Outages, payments, security, support, releases, latency — each archetype carries its own
                stakes, hidden facts, and a severity model that fights back.
              </p>
              <div className="mt-6 rounded-2xl border border-panel-line bg-ink/60 p-4">
                <ScenarioListMock />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
