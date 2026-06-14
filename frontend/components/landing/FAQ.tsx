"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Reveal } from "./primitives";

const FAQS = [
  {
    q: "Why is Redline different?",
    a: "Most training rehearses the runbook. Redline makes you say the words out loud to a persona that reacts to your tone, under live, rising pressure, then coaches you on the recording.",
  },
  {
    q: "Do I actually have to talk?",
    a: "Yes. Redline is voice-first. You speak into a live incident at conversational latency and the persona answers by voice in real time. Typing the right answer is easy; saying it under pressure is the skill.",
  },
  {
    q: "How does the persona react?",
    a: "A controller steers mood and stakes while the model stays in character. Reassure well and severity drops; hedge, deflect, or over-promise and it climbs. Every line you say reshapes what happens next.",
  },
  {
    q: "What do I get scored on?",
    a: "Five dimensions, clarity, de-escalation, info-gathering, escalation, and status comms, graded against the transcript, with the exact moments you slipped and stronger phrasing you could have used.",
  },
  {
    q: "Which scenarios are covered?",
    a: "Six archetypes, outages, payments, security, support, releases, and latency, playable across roles like on-call engineer, incident commander, and support lead, at three intensity tiers.",
  },
  {
    q: "Is my voice data private?",
    a: "Your drills stay in your workspace. Recordings and transcripts are yours and are never used to train models. Privacy is the default, not a setting.",
  },
];

export function FAQ() {
  const [active, setActive] = useState(0);
  const next = () => setActive((a) => (a + 1) % FAQS.length);
  const prev = () => setActive((a) => (a - 1 + FAQS.length) % FAQS.length);

  // The three cards currently in view (active + two peeks).
  const visible = [0, 1, 2].map((o) => (active + o) % FAQS.length);

  return (
    <section id="faq" className="relative overflow-hidden bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal variant="up">
            <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white">
              Frequently
              <br />
              Asked <span className="text-[#F87171]">Questions</span>
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.08}>
            <div className="flex flex-col gap-4 sm:items-end">
              <p className="max-w-xs text-body text-secondary sm:text-right">
                Answers about how Redline&apos;s voice drills, personas, and coaching actually work.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  aria-label="Previous"
                  className="grid h-11 w-11 place-items-center rounded-full bg-panel text-secondary transition-colors hover:bg-panel-2 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next"
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink transition-transform hover:scale-105"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {visible.map((idx, pos) => {
            const item = FAQS[idx];
            const isActive = pos === 0;
            return (
              <motion.div
                key={`${idx}-${pos}`}
                layout
                className={`relative min-h-[300px] overflow-hidden rounded-3xl p-7 ${
                  isActive ? "bg-sky-card" : "border border-panel-line bg-panel-2/40"
                } ${pos === 2 ? "hidden lg:block" : ""}`}
              >
                {isActive && (
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-60 [background:radial-gradient(120%_90%_at_70%_-10%,rgba(255,255,255,0.6),transparent_55%)]"
                  />
                )}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="relative flex h-full flex-col"
                  >
                    <span
                      className={`font-mono text-[12px] ${isActive ? "text-white/70" : "text-muted"}`}
                    >
                      0{idx + 1}
                    </span>
                    <h3
                      className={`mt-auto text-[1.4rem] font-semibold leading-tight ${
                        isActive ? "text-white" : "text-secondary"
                      }`}
                    >
                      {item.q}
                    </h3>
                    {isActive && (
                      <p className="mt-3 text-[13px] leading-relaxed text-white/85">{item.a}</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
