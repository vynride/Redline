import type { EscalationEvent } from "@shared/types";

export function EscalationTimeline({ events }: { events: EscalationEvent[] }) {
  if (!events.length) {
    return <p className="text-body text-muted">No escalations yet — keep it that way.</p>;
  }
  return (
    <ol className="flex flex-col gap-3">
      {events.map((e, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 grid h-6 w-8 shrink-0 place-items-center rounded-full bg-rose-500/10 font-mono text-label text-rose-400 tabular">
            {e.severity}
          </span>
          <span className="text-body text-secondary">{e.event}</span>
        </li>
      ))}
    </ol>
  );
}
