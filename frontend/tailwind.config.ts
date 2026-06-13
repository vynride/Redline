import type { Config } from "tailwindcss";

// Tokens mirrored from DESIGN.md (repo root) — Redline's two-surface system: a
// near-black product canvas (ink/panel) paired with a lavender accent surface for
// marketing moments, plus the premium glass/glow/aurora utilities used across the
// landing page. Older violet-black app tokens are retained for the product shell.
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
        line: "#2C2542",
        "line-strong": "#3A3158",
        accent: "#A78BFA",
        "accent-strong": "#7C5CFC",
        "accent-soft": "rgba(167,139,250,0.15)",
        // Full violet scale (Tailwind defaults) + DEFAULT so `bg-violet` and the
        // numbered shades (`violet-300`, `violet-500/15`, gradients) all resolve.
        violet: {
          DEFAULT: "#8B5CF6",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
        },
        "violet-deep": "#7C3AED",
        cyan: "#22D3EE",
        "cyan-deep": "#06B6D4",
        // Near-neutral dark canvas + panels — the product/marketing dark surface.
        ink: "#0A0A0A",
        "ink-2": "#0E0E10",
        panel: "#141416",
        "panel-2": "#1A1A1D",
        "panel-line": "#242428",
        // Hero lavender gradient stops.
        "lav-1": "#8A7AE5",
        "lav-2": "#9180E8",
        "lav-3": "#9C8BEC",
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
        hover: "0 8px 32px rgba(124,92,252,0.18)",
        "glow-violet": "0 0 0 1px rgba(124,58,237,0.25), 0 20px 60px -20px rgba(124,58,237,0.45)",
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.2), 0 20px 60px -20px rgba(34,211,238,0.35)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px -28px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, #A78BFA, #7C5CFC)",
        "neon-duo": "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 40%, #22D3EE 100%)",
        // Light lavender hero wash that melts into the dark canvas at the bottom.
        "hero-lav":
          "linear-gradient(180deg, #8A7AE5 0%, #9180E8 36%, #9C8BEC 60%, #6E62B4 82%, #0A0A0A 100%)",
        "sky-card": "linear-gradient(170deg, #b9a9f0 0%, #9d8be8 55%, #7d6ccf 100%)",
        "grid-fade":
          "linear-gradient(to right, rgba(124,92,252,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,92,252,0.07) 1px, transparent 1px)",
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
