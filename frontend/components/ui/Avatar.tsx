"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";


export function Avatar({
  src,
  name,
  className,
  size = 32,
}: {
  src?: string | null;
  name?: string;
  className?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  const fallback = (
    <span
      className={cn("inline-flex shrink-0 overflow-hidden rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #38bdf8, #6366f1)",
      }}
    />
  );

  if (!src || failed) return fallback;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name ?? ""}
      className={cn("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
