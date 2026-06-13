import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the hover lift used by interactive grid cards. */
  interactive?: boolean;
  /** Use the larger widget radius/padding (dashboard widgets, panels). */
  widget?: boolean;
}

export function Card({ interactive, widget, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "border border-line bg-surface shadow-card",
        widget ? "rounded-xl p-6" : "rounded-lg p-5",
        interactive && "transition hover:-translate-y-1 hover:border-line-strong hover:shadow-hover",
        className,
      )}
      {...props}
    />
  );
}
