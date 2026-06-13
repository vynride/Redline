import type { Config } from "tailwindcss";

// Tokens mirrored from DESIGN.md (repo root) — the single source of truth for the
// dark-only, violet-black, number-forward Redline design system.
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
        surface: "#171226",
        "surface-2": "#211B36",
        "surface-3": "#2A2342",
        line: "#2C2542",
        "line-strong": "#3A3158",
        accent: "#A78BFA",
        "accent-strong": "#7C5CFC",
        "accent-soft": "rgba(167,139,250,0.15)",
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
        full: "9999px",
      },
      spacing: {
        section: "64px",
      },
      boxShadow: {
        card: "0 1px 0 rgba(245,243,255,0.08), 0 8px 24px rgba(14,10,26,0.4)",
        hover: "0 8px 32px rgba(124,92,252,0.18)",
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, #A78BFA, #7C5CFC)",
      },
    },
  },
  plugins: [],
};

export default config;
