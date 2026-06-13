"use client";

import Link from "next/link";
import { Reveal } from "./primitives";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink py-20">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-[32px] bg-sky-card px-6 py-16 text-center sm:py-24">
            <div
              aria-hidden
              className="absolute inset-0 opacity-60 [background:radial-gradient(100%_120%_at_50%_-20%,rgba(255,255,255,0.55),transparent_55%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-[6%] bottom-0 h-[28vh] w-[28vh] rounded-full bg-white/25 blur-[80px]"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-balance text-[clamp(2.25rem,6vw,4.5rem)] font-light leading-[0.98] tracking-[-0.03em] text-white">
                your next incident is a drill away
              </h2>
              <p className="mx-auto mt-5 max-w-md font-mono text-[13px] uppercase tracking-[0.06em] text-white/80">
                Run your first crisis in under five minutes. No setup — just a mic.
              </p>
              <div className="mt-9 flex items-center justify-center">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center rounded-full bg-[#0E0E10] px-7 text-button text-white shadow-[0_14px_40px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/10 transition-transform hover:-translate-y-0.5"
                >
                  Start a drill
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
