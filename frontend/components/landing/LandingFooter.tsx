"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { GithubIcon, XIcon } from "./BrandIcons";

type FooterLink = { label: string; href: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Start a drill", href: "/login" },
      { label: "How it works", href: "#product" },
      { label: "FAQ", href: "#faq" },
      { label: "Get started", href: "#get-started" },
    ],
  },
  {
    title: "Reach out",
    links: [
      { label: "X / Twitter", href: "https://x.com/vynride" },
      { label: "Email us", href: "mailto:vynride@gmail.com" },
      { label: "GitHub", href: "https://github.com/vynride" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Security", href: "/security" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

const SOCIALS = [
  { icon: GithubIcon, label: "GitHub", href: "https://github.com/vynride" },
  { icon: XIcon, label: "X", href: "https://x.com/vynride" },
  { icon: Mail, label: "Email", href: "mailto:vynride@gmail.com" },
];

/** Render an internal route as a <Link>, anchors/external/mailto as a plain <a>. */
function FooterLinkEl({ link, className }: { link: FooterLink; className?: string }) {
  const isInternal = link.href.startsWith("/");
  const isExternal = link.href.startsWith("http");
  if (isInternal) {
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    );
  }
  return (
    <a
      href={link.href}
      className={className}
      {...(isExternal ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {link.label}
    </a>
  );
}

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
                    href={s.href}
                    aria-label={s.label}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.href.startsWith("http") ? "noreferrer noopener" : undefined}
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
                  <li key={link.label}>
                    <FooterLinkEl
                      link={link}
                      className="text-body text-secondary transition-colors hover:text-white"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-panel-line pt-6 text-label text-muted sm:flex-row">
          <span>
            © 2026 Vivian Demello -{" "}
            <a
              href="https://vynride.dev"
              target="_blank"
              rel="noreferrer noopener"
              className="text-secondary transition-colors hover:text-white"
            >
              vynride
            </a>
          </span>
          <a
            href="https://redline.vynride.dev"
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono transition-colors hover:text-white"
          >
            redline.vynride.dev
          </a>
        </div>
      </div>
    </footer>
  );
}
