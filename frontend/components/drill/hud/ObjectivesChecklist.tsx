import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function ObjectivesChecklist({ objectives, met }: { objectives: string[]; met: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {objectives.map((o) => {
        const done = met.includes(o);
        return (
          <li key={o} className="flex items-start gap-2.5 text-body">
            <span
              className={cn(
                "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors",
                done
                  ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-400"
                  : "border-panel-line bg-panel-2 text-transparent",
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
