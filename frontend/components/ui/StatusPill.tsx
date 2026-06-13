import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type StatusTone = "positive" | "negative" | "accent" | "neutral";

const TONES: Record<StatusTone, string> = {
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
  accent: "bg-accent-soft text-accent",
  neutral: "bg-surface-2 text-secondary",
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
