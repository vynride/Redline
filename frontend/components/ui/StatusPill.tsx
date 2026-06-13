import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type StatusTone = "positive" | "negative" | "accent" | "neutral";

// DESIGN.md semantic tones, emerald / rose direction, violet accent.
const TONES: Record<StatusTone, string> = {
  positive: "bg-emerald-500/10 text-emerald-400",
  negative: "bg-rose-500/10 text-rose-400",
  accent: "bg-violet-500/15 text-violet-300",
  neutral: "bg-panel-2 text-secondary",
};

interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
}

export function StatusPill({ tone = "neutral", className, ...props }: StatusPillProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-label", TONES[tone], className)}
      {...props}
    />
  );
}
