"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ easing */

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------- Reveal block */

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Animation flavour. */
  variant?: "up" | "fade" | "scale" | "blur";
  delay?: number;
  /** Render as a different element where layout needs it. */
  as?: "div" | "section" | "li" | "span";
};

const REVEAL_VARIANTS: Record<NonNullable<RevealProps["variant"]>, Variants> = {
  up: {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    show: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(14px)", y: 18 },
    show: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
};

/** Scroll-triggered reveal. Fires once when ~15% of the element is visible. */
export function Reveal({ children, className, variant = "up", delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={REVEAL_VARIANTS[variant]}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Staggered container, children using `RevealChild` cascade in. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealChild({
  children,
  className,
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealProps["variant"];
}) {
  return (
    <motion.div
      className={className}
      variants={REVEAL_VARIANTS[variant ?? "up"]}
      transition={{ duration: 0.65, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------------------------------------- Gradient text */

export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-gradient", className)}>{children}</span>;
}

/* ------------------------------------------------------ Two-tone bold heading */

/** The signature section headline: white lead + violet emphasis, very tight. */
export function TwoTone({
  lead,
  accent,
  trail,
  className,
  align = "center",
}: {
  lead: string;
  accent: string;
  trail?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal variant="up">
      <h2
        className={cn(
          "text-balance text-[clamp(2.25rem,5.2vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white",
          align === "center" && "text-center",
          className,
        )}
      >
        {lead} <span className="text-[#A78BFA]">{accent}</span>
        {trail ? ` ${trail}` : ""}
      </h2>
    </Reveal>
  );
}

/* ---------------------------------------------------------------- Eyebrow tag */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line-strong/60 bg-surface-2/50 px-3 py-1 text-label uppercase tracking-[0.18em] text-secondary backdrop-blur",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]" />
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- Glass card */

export function GlassCard({
  children,
  className,
  glow,
  interactive,
}: {
  children: ReactNode;
  className?: string;
  glow?: "violet" | "cyan" | "none";
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass gradient-border relative overflow-hidden rounded-2xl",
        interactive && "transition-transform duration-300 will-change-transform hover:-translate-y-1",
        glow === "violet" && "hover:shadow-glow-violet",
        glow === "cyan" && "hover:shadow-glow-cyan",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- Magnetic button */

type MagneticButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
};

/** Button that leans toward the cursor, the signature premium micro-interaction. */
export function MagneticButton({ children, href, variant = "primary", className }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    "group relative inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-button transition-colors";
  const styles =
    variant === "primary"
      ? "bg-neon-duo text-on-accent shadow-[0_10px_40px_-12px_rgba(124,58,237,0.8)]"
      : "glass-strong text-primary hover:text-white";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn(base, styles, className)}
    >
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(60%_120%_at_50%_-10%,rgba(255,255,255,0.5),transparent)]" />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.a>
  );
}

// next/link wrapped in motion so the spring transform lands on the real anchor
// (avoids the deprecated legacyBehavior + ref pattern under React 19).
const MotionLink = motion.create(Link);

/** Internal-link variant of the magnetic button (Next.js routing). */
export function MagneticLink({ children, href, variant = "primary", className }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  const styles =
    variant === "primary"
      ? "bg-neon-duo text-on-accent shadow-[0_10px_40px_-12px_rgba(124,58,237,0.8)]"
      : "glass-strong text-primary hover:text-white";
  return (
    <MotionLink
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: sx, y: sy }}
      className={cn(
        "group relative inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-button transition-colors",
        styles,
        className,
      )}
    >
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(60%_120%_at_50%_-10%,rgba(255,255,255,0.5),transparent)]" />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </MotionLink>
  );
}

/* ------------------------------------------------------------- Scroll progress */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-neon-duo"
    />
  );
}

/* --------------------------------------------------------------------- Aurora */

/** Drifting mesh-gradient blobs behind a section. Decorative, pointer-none. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -left-[10%] top-[-20%] h-[55vh] w-[55vh] animate-aurora-drift rounded-full bg-violet-deep/30 blur-[120px]" />
      <div
        className="absolute right-[-10%] top-[10%] h-[50vh] w-[50vh] animate-aurora-drift rounded-full bg-cyan-deep/20 blur-[130px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-[-25%] left-1/3 h-[45vh] w-[45vh] animate-aurora-drift rounded-full bg-accent-strong/25 blur-[120px]"
        style={{ animationDelay: "-11s" }}
      />
    </div>
  );
}

/* --------------------------------------------------------------- Section head */

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      <Reveal variant="fade">
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal variant="up" delay={0.05}>
        <h2 className="text-balance text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em]">
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal variant="up" delay={0.1}>
          <p className="text-body-lg text-secondary">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Count up */

/** Counts from 0 → `value` once in view. Returns the formatted string. */
export function useCountUp(value: number, { decimals = 0, duration = 1.6 } = {}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return { ref, text: display.toFixed(decimals) };
}

/* ------------------------------------------------------- Parallax wrapper */

/** Translates its children on scroll for layered depth. */
export function Parallax({
  children,
  className,
  distance = 60,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
