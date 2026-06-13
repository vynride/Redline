import Link from "next/link";
import { Card, StatusPill, type StatusTone } from "@/components/ui";
import { DIFFICULTY_LABELS, ROLE_LABELS } from "@/lib/labels";
import type { SessionListItem } from "@shared/types";

const STATUS_TONE: Record<SessionListItem["status"], StatusTone> = {
  active: "positive",
  completed: "accent",
  abandoned: "neutral",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SessionHistory({
  sessions,
  titles,
}: {
  sessions: SessionListItem[];
  titles: Record<string, string>;
}) {
  if (!sessions.length) {
    return (
      <Card className="text-body text-secondary">No drills yet, start one above to see your history here.</Card>
    );
  }
  return (
    <Card className="flex flex-col gap-1 p-2">
      {sessions.map((s) => {
        const href = s.status === "active" ? `/drill/${s.id}` : `/debrief/${s.id}`;
        return (
          <Link
            key={s.id}
            href={href}
            className="flex items-center gap-4 rounded-xl px-4 py-3 transition hover:bg-panel-2"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body-strong text-primary">{titles[s.scenario_id] ?? s.scenario_id}</span>
              <span className="text-label text-muted">
                {ROLE_LABELS[s.role]} · {DIFFICULTY_LABELS[s.difficulty]} · {fmtDate(s.created_at)}
              </span>
            </div>
            <StatusPill tone={STATUS_TONE[s.status]}>{s.status}</StatusPill>
            <span className="w-16 text-right font-mono text-body-strong tabular text-primary">
              {s.score != null ? s.score : ", "}
            </span>
          </Link>
        );
      })}
    </Card>
  );
}
