"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function ObjectivesChecklist({ objectives, met }: { objectives: string[]; met: string[] }) {
  // Track which objectives were already met last render so only the *just*-cleared
  // row plays the pop, re-renders from other state never re-trigger it.
  const prevMet = useRef<Set<string>>(new Set(met));
  const [justMet, setJustMet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fresh = met.filter((o) => !prevMet.current.has(o));
    prevMet.current = new Set(met);
    if (fresh.length === 0) return;
    setJustMet(new Set(fresh));
    const id = setTimeout(() => setJustMet(new Set()), 600);
    return () => clearTimeout(id);
  }, [met]);

  return (
    <ul className="flex flex-col gap-2">
      {objectives.map((o, i) => {
        const done = met.includes(o);
        const popping = justMet.has(o);
        return (
          <li
            key={o}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
              done
                ? "border-emerald-500/25 bg-emerald-500/[0.07]"
                : "border-panel-line bg-panel-2/40",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[12px] font-semibold tabular transition-all duration-200",
                done
                  ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-400"
                  : "border-panel-line bg-panel text-secondary",
                popping && "scale-125",
              )}
            >
              {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "text-[14.5px] leading-snug",
                done ? "font-medium text-primary" : "text-secondary",
              )}
            >
              {o}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
