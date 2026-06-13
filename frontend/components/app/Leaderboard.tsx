import { Card } from "@/components/ui";
import { DIFFICULTY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { SessionListItem } from "@shared/types";

const MEDAL = ["text-violet-300", "text-secondary", "text-muted"];

/** Personal best, top completed drills ranked by score. */
export function Leaderboard({
  sessions,
  titles,
}: {
  sessions: SessionListItem[];
  titles: Record<string, string>;
}) {
  const ranked = sessions
    .filter((s) => s.status === "completed" && s.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5);

  return (
    <Card widget className="flex flex-col gap-4">
      <h2 className="text-h2">Your best drills</h2>
      {ranked.length === 0 ? (
        <p className="text-body text-secondary">Finish a drill to climb your own leaderboard.</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {ranked.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 rounded-md px-2 py-2">
              <span className={cn("w-5 text-center font-mono text-body-strong tabular", MEDAL[i] ?? "text-muted")}>
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body text-primary">{titles[s.scenario_id] ?? s.scenario_id}</span>
                <span className="text-label text-muted">{DIFFICULTY_LABELS[s.difficulty]}</span>
              </div>
              <span className="font-mono text-stat-mono tabular text-primary">{s.score}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
