import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Quiet rounded chip — category tags, preset chips, metadata. */
export function Pill({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-label text-secondary",
        className,
      )}
      {...props}
    />
  );
}
