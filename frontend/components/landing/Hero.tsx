"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AppShowcase } from "./AppShowcase";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Tiny twinkling specks scattered over the lavender wash. */
function Sparkles() {
  const dots = [
    [12, 22], [22, 48], [34, 15], [48, 60], [58, 28], [70, 44], [82, 18], [90, 52],
    [16, 70], [28, 82], [44, 78], [62, 70], [76, 84], [88, 72], [8, 40], [52, 38],
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {dots.map(([l, t], i) => (
        <motion.span
          key={i}
          className="absolute h-[3px] w-[3px] rounded-full bg-white/80"
          style={{ left: `${l}%`, top: `${t}%` }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: (i % 7) * 0.4 }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-lav">
      {/* soft cloud blooms in the lower corners, like the reference */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[6%] bottom-[22%] h-[40vh] w-[40vh] rounded-full bg-white/25 blur-[90px]" />
        <div className="absolute -right-[6%] bottom-[26%] h-[36vh] w-[36vh] rounded-full bg-white/20 blur-[90px]" />
        <Sparkles />
      </div>

      {/* Centered hero copy */}
      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center px-6 pt-28 text-center sm:pt-32">
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center gap-2.5 text-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Redline" width={32} height={32} className="h-8 w-8" />
          <span className="text-[1.6rem] font-semibold tracking-[0.14em]">REDLINE</span>
        </motion.div>

        {/* Joined tech pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
          className="mt-7 inline-flex items-stretch overflow-hidden rounded-full border border-white/30 bg-white/10 backdrop-blur"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 text-[12px] font-medium tracking-wide text-white">
            Powered by Sarvam AI
          </span>
        </motion.div>

        {/* Massive thin lowercase headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="mt-8 text-balance text-[clamp(2.75rem,8vw,6.5rem)] font-light leading-[0.98] tracking-[-0.03em] text-white"
        >
          practice meets pressure
        </motion.h1>

        {/* Mono subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.28 }}
          className="mt-6 max-w-xl font-mono text-[13px] uppercase leading-relaxed tracking-[0.08em] text-white/80 sm:text-[14px]"
        >
          Voice-first crisis drills on a live incident — talk it down out loud, and get
          coached on every word once it&apos;s over.
        </motion.p>

        {/* Divider + dark pill CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex w-full max-w-xl items-center gap-4"
        >
          <span className="h-px flex-1 bg-white/25" />
          <span className="text-white/50">✕</span>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-full bg-[#0E0E10] px-6 text-button text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-transform hover:-translate-y-0.5"
          >
            Start a drill
          </Link>
          <span className="text-white/50">✕</span>
          <span className="h-px flex-1 bg-white/25" />
        </motion.div>
      </div>

      {/* App window mock bleeding up into the hero and down into the dark canvas */}
      <div className="relative z-10 mx-auto mt-16 max-w-[1240px] px-4 sm:px-6">
        <AppShowcase />
      </div>
    </section>
  );
}
