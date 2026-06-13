"use client";

import Link from "next/link";
import { GithubIcon, XIcon, LinkedinIcon } from "./BrandIcons";

const COLUMNS = [
  { title: "Platform", links: ["Start a drill", "How it works", "Scenarios", "Compare"] },
  { title: "Reach out", links: ["X / Twitter", "Discord", "Email us", "Report a bug"] },
  { title: "Company", links: ["About", "Careers", "Security", "Privacy"] },
];

const SOCIALS = [
  { icon: GithubIcon, label: "GitHub" },
  { icon: XIcon, label: "X" },
  { icon: LinkedinIcon, label: "LinkedIn" },
];

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.8fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="h-7 w-7" />
              <span className="text-[16px] font-semibold tracking-[0.1em]">REDLINE</span>
            </Link>
            <p className="max-w-xs text-body text-secondary">
              Voice-first crisis drills that build the muscle memory for staying calm when it counts.
            </p>
            <div className="mt-1 flex items-center gap-2">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="grid h-9 w-9 place-items-center rounded-full border border-panel-line bg-panel text-secondary transition-colors hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">
                {col.title}
              </span>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-body text-secondary transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-panel-line pt-6 text-label text-muted sm:flex-row">
          <span>© 2026 Redline Labs — practice meets pressure.</span>
          <span className="font-mono">redline.training</span>
        </div>
      </div>
    </footer>
  );
}
