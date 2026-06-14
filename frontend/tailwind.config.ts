import type { Config } from "tailwindcss";

// Tokens mirrored from DESIGN.md (repo root) — Redline's two-surface system: a
// near-black product canvas (ink/panel) paired with a red accent surface for
// marketing moments, plus the premium glass/glow/aurora utilities used across the
// landing page. Older dark app tokens are retained for the product shell.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0E0A1A",
        "base-deep": "#080611",
        surface: "#171226",
        "surface-2": "#211B36",
        "surface-3": "#2A2342",
        line: "#2C2020",
        "line-strong": "#4A2C2C",
        accent: "#F87171",
        "accent-strong": "#DC2626",
        "accent-soft": "rgba(248,113,113,0.15)",
        // Red accent scale kept under the `violet` token name so the existing
        // `violet-300` / `violet-500/15` / gradient classes recolor without churn.
        violet: {
          DEFAULT: "#EF4444",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
        "violet-deep": "#DC2626",
        cyan: "#22D3EE",
        "cyan-deep": "#06B6D4",
        // Near-neutral dark canvas + panels — the product/marketing dark surface.
        ink: "#0A0A0A",
        "ink-2": "#0E0E10",
        panel: "#141416",
        "panel-2": "#1A1A1D",
        "panel-line": "#242428",
        // Hero red wash gradient stops.
        "lav-1": "#C25555",
        "lav-2": "#CC5B5B",
        "lav-3": "#D66565",
        "on-accent": "#0E0A1A",
        positive: "#34D399",
        "positive-soft": "rgba(52,211,153,0.15)",
        negative: "#F87171",
        "negative-soft": "rgba(248,113,113,0.15)",
        primary: "#F5F3FF",
        secondary: "#A9A2C4",
        muted: "#6F6789",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Oversized hero type for the premium landing — clamps live in components.
        mega: ["clamp(2.75rem, 7vw, 6rem)", { lineHeight: "0.98", letterSpacing: "-0.03em", fontWeight: "700" }],
        display: ["64px", { lineHeight: "1.05", letterSpacing: "-0.5px", fontWeight: "700" }],
        h1: ["36px", { lineHeight: "1.1", letterSpacing: "-0.2px", fontWeight: "700" }],
        h2: ["28px", { lineHeight: "1.2", fontWeight: "600" }],
        stat: ["28px", { lineHeight: "1.1", fontWeight: "700" }],
        "stat-mono": ["24px", { lineHeight: "1.1", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6" }],
        "body-strong": ["16px", { lineHeight: "1.5", fontWeight: "500" }],
        label: ["13px", { lineHeight: "1.4", letterSpacing: "0.2px", fontWeight: "500" }],
        "mono-sm": ["13px", { lineHeight: "1.4" }],
        button: ["15px", { lineHeight: "1.2", letterSpacing: "0.1px", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "28px",
        full: "9999px",
      },
      spacing: {
        section: "64px",
      },
      boxShadow: {
        card: "0 1px 0 rgba(245,243,255,0.08), 0 8px 24px rgba(14,10,26,0.4)",
        hover: "0 8px 32px rgba(239,68,68,0.18)",
        "glow-violet": "0 0 0 1px rgba(220,38,38,0.25), 0 20px 60px -20px rgba(220,38,38,0.45)",
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.2), 0 20px 60px -20px rgba(34,211,238,0.35)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px -28px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, #F87171, #DC2626)",
        "neon-duo": "linear-gradient(135deg, #DC2626 0%, #EF4444 40%, #22D3EE 100%)",
        // Light lavender hero wash that melts into the dark canvas at the bottom.
        "hero-lav":
          "linear-gradient(180deg, #C25555 0%, #CC5B5B 36%, #D66565 60%, #7A3838 82%, #0A0A0A 100%)",
        "sky-card": "linear-gradient(170deg, #ECA3A3 0%, #D67272 55%, #B84545 100%)",
        "grid-fade":
          "linear-gradient(to right, rgba(239,68,68,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,68,68,0.07) 1px, transparent 1px)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "aurora-drift": {
          "0%, 100%": { transform: "translate3d(-4%, -2%, 0) scale(1)" },
          "50%": { transform: "translate3d(4%, 3%, 0) scale(1.15)" },
        },
        "pulse-node": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration,40s) linear infinite",
        "aurora-drift": "aurora-drift 18s ease-in-out infinite",
        "pulse-node": "pulse-node 3.5s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
