import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the hover lift used by interactive grid cards. */
  interactive?: boolean;
  /** Slightly larger padding for primary panels / widgets. */
  widget?: boolean;
}

/** Flat dark panel card, DESIGN.md `card-panel`: bg-panel + hairline border. */
export function Card({ interactive, widget, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-panel-line bg-panel",
        widget ? "p-6" : "p-5",
        interactive && "transition hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-glow-violet",
        className,
      )}
      {...props}
    />
  );
}
