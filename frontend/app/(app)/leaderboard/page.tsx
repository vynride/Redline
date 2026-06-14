"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { Avatar, Card } from "@/components/ui";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import type { LeaderboardEntry } from "@shared/types";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listLeaderboard()
      .then(setBoard)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the leaderboard."));
  }, []);

  if (error) return <p className="text-body text-rose-400">{error}</p>;
  if (!board) return <LoadingScreen />;

  return (
    <Card widget className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-h2">Global leaderboard</h1>
        <p className="text-body text-secondary">Every responder ranked by total drill score.</p>
      </div>

      {board.length === 0 ? (
        <p className="text-body text-secondary">No ranked drills yet, finish a drill to get on the board.</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {board.map((r) => {
            const isMe = r.user_id === user?.id;
            return (
              <li
                key={r.user_id}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-2.5",
                  isMe ? "border border-violet-500/40 bg-violet-500/10" : "bg-ink/40",
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "w-7 shrink-0 text-center font-mono text-[12px] tabular",
                      isMe ? "text-violet-300" : "text-muted",
                    )}
                  >
                    #{r.rank}
                  </span>
                  <Avatar src={r.avatar_url} name={r.display_name} size={28} />
                  <span className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-[13px]",
                          isMe ? "font-semibold text-white" : "text-secondary",
                        )}
                      >
                        {r.display_name}
                      </span>
                      {isMe && (
                        <span className="shrink-0 rounded-full bg-violet-500/20 px-2 py-0.5 text-label text-violet-200">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-label text-muted">{r.drills} drills</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-stat-mono tabular text-white">
                  {r.rank === 1 && <Crown className="h-4 w-4 text-amber-400" />}
                  {Math.round(r.points).toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
