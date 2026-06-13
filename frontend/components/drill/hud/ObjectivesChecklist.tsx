"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function ObjectivesChecklist({ objectives, met }: { objectives: string[]; met: string[] }) {
  // Track which objectives were already met last render so only the *just*-cleared
  // row plays the pop — re-renders from other state never re-trigger it.
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
    <ul className="flex flex-col gap-1.5">
      {objectives.map((o) => {
        const done = met.includes(o);
        const popping = justMet.has(o);
        return (
          <li
            key={o}
            className={cn(
              "flex items-start gap-2.5 rounded-md px-2 py-1.5 text-body transition-colors",
              done ? "bg-emerald-500/5" : "bg-transparent",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-all duration-200",
                done
                  ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-400"
                  : "border-panel-line bg-panel-2 text-transparent",
                popping && "scale-125",
              )}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            <span className={cn("leading-snug", done ? "text-primary" : "text-secondary")}>{o}</span>
          </li>
        );
      })}
    </ul>
  );
}
