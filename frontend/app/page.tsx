import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { Card, Pill, StatBlock, StatusPill, buttonStyles } from "@/components/ui";
import { ARCHETYPE_BLURBS, ARCHETYPE_LABELS } from "@/lib/labels";
import type { Archetype } from "@shared/types";

const VALUE_PROPS = [
  {
    title: "Pressure you can rehearse",
    body: "Most teams train the runbook, never the conversation. Redline makes you say the words out loud while the incident gets worse.",
  },
  {
    title: "An adversary that reacts",
    body: "The persona reads your tone and your substance — reassure well and severity drops; hedge and it climbs. No two drills run the same.",
  },
  {
    title: "Coaching on the tape",
    body: "Every drill ends in a debrief: where you lost control, what you missed, and the stronger words you could have used.",
  },
];

const STEPS = [
  { n: "01", title: "Pick the crisis", body: "Choose a scenario, the role you're playing, and how brutal it should be." },
  { n: "02", title: "Talk it down", body: "Speak into a live incident. The persona answers by voice, in character, in real time." },
  { n: "03", title: "Read the debrief", body: "Get scored on clarity, de-escalation, info-gathering, escalation, and status comms." },
];

const ARCHETYPES = Object.keys(ARCHETYPE_LABELS) as Archetype[];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[720px] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(167,139,250,0.22), transparent)" }}
          />
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 pb-section pt-24 text-center">
            <StatusPill tone="accent">Voice-first crisis drills</StatusPill>
            <h1 className="max-w-4xl text-display">Train for the call you hope never comes.</h1>
            <p className="max-w-2xl text-body-lg text-secondary">
              Redline drops you into a live incident and makes you talk your way out. The AI roleplays the
              angry customer, the commander, the security lead — then coaches you on the recording.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className={buttonStyles("primary")}>
                Start a drill
              </Link>
              <a href="#how" className={buttonStyles("secondary")}>
                See how it works
              </a>
            </div>
            <div className="mt-10 grid w-full max-w-2xl grid-cols-3 gap-6 border-t border-line pt-8">
              <StatBlock label="Scenario archetypes" value="6" />
              <StatBlock label="Coaching dimensions" value="5" />
              <StatBlock label="Latency to voice" value="~130ms" mono />
            </div>
          </div>
        </section>

        {/* Value props */}
        <section id="value" className="mx-auto max-w-[1200px] px-6 py-section">
          <div className="grid gap-6 md:grid-cols-3">
            {VALUE_PROPS.map((v) => (
              <Card key={v.title} className="flex flex-col gap-3">
                <h2 className="text-h2">{v.title}</h2>
                <p className="text-body text-secondary">{v.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-[1200px] px-6 py-section">
          <h2 className="mb-10 text-center text-h1">Three minutes, one hard conversation.</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <Card key={s.n} className="flex flex-col gap-3">
                <span className="font-mono text-stat-mono text-accent tabular">{s.n}</span>
                <h3 className="text-h2">{s.title}</h3>
                <p className="text-body text-secondary">{s.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Archetypes */}
        <section id="archetypes" className="mx-auto max-w-[1200px] px-6 py-section">
          <div className="mb-10 flex flex-col gap-2">
            <h2 className="text-h1">Every way an incident can go wrong.</h2>
            <p className="text-body-lg text-secondary">
              Each archetype carries its own persona, stakes, hidden facts, and severity model.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHETYPES.map((a) => (
              <Card key={a} interactive className="flex flex-col gap-3">
                <Pill>{ARCHETYPE_LABELS[a]}</Pill>
                <p className="text-body-strong text-primary">{ARCHETYPE_BLURBS[a]}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Promo banner */}
        <section className="mx-auto max-w-[1200px] px-6 pb-section">
          <div className="flex flex-col items-start gap-5 rounded-xl bg-cta-gradient p-12 text-on-accent md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-h2">Your next incident is a drill away.</h2>
              <p className="max-w-xl text-body opacity-80">Run your first crisis in under five minutes — no setup, just a mic.</p>
            </div>
            <Link href="/register" className="inline-flex h-11 items-center rounded-full bg-base px-6 text-button font-semibold text-primary">
              Create an account
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
