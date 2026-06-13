"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#product", label: "Product" },
  { href: "#faq", label: "FAQ" },
  { href: "#get-started", label: "Get started" },
];

export function LandingNav() {
  // Hidden over the lavender hero; slides in once you scroll into the dark canvas.
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {shown && (
        <motion.header
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -70, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-0 z-50 flex justify-center px-4"
        >
          <nav className="glass-strong mt-3 flex w-full max-w-[1040px] items-center justify-between gap-4 rounded-full px-3 py-2 pl-5 shadow-glass">
            <Link href="/" className="flex items-center gap-2 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="h-6 w-6" />
              <span className="text-[15px] font-semibold tracking-[0.1em]">REDLINE</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-[14px] text-secondary transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[14px] font-semibold text-ink transition-transform hover:scale-[1.03]"
              >
                Start a drill
              </Link>
              <button
                type="button"
                aria-label="Menu"
                onClick={() => setOpen((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-full text-white md:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass-strong absolute inset-x-4 top-[68px] rounded-2xl p-3 md:hidden"
              >
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-body-strong text-secondary hover:bg-panel-2 hover:text-white"
                  >
                    {l.label}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
