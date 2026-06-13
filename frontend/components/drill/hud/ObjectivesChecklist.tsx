import { cn } from "@/lib/cn";

export function ObjectivesChecklist({ objectives, met }: { objectives: string[]; met: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {objectives.map((o) => {
        const done = met.includes(o);
        return (
          <li key={o} className="flex items-start gap-2 text-body">
            <span className={cn("leading-6", done ? "text-positive" : "text-muted")}>{done ? "✓" : "○"}</span>
            <span className={done ? "text-primary" : "text-secondary"}>{o}</span>
          </li>
        );
      })}
    </ul>
  );
}
