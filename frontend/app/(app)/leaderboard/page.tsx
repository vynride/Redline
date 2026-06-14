"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import type { LeaderboardEntry } from "@shared/types";

// Trophy tint per podium place: gold, silver, bronze.
const TROPHY_TONE: Record<number, string> = {
  1: "text-amber-400",
  2: "text-slate-300",
  3: "text-[#CD7F32]",
};
const ORDINAL: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };
// On wide screens the podium reads 2 · 1 · 3, with first place centered.
const PODIUM_ORDER: Record<number, string> = { 1: "sm:order-2", 2: "sm:order-1", 3: "sm:order-3" };

// Gradient palette for users without a real photo. A user always lands on the
// same one (hashed from their id), so avatars are varied but stable per person.
const GRADIENTS = [
  ["#EF4444", "#3B82F6"],
  ["#EC4899", "#EF4444"],
  ["#38BDF8", "#2563EB"],
  ["#34D399", "#0EA5E9"],
  ["#F59E0B", "#EF4444"],
  ["#F87171", "#DC2626"],
  ["#22D3EE", "#3B82F6"],
  ["#FB7185", "#F43F5E"],
];

function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const [a, b] = GRADIENTS[h % GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

/** Real photo when present, otherwise a stable random gradient disc. */
function Face({ entry, size }: { entry: LeaderboardEntry; size: number }) {
  const [failed, setFailed] = useState(false);
  const dim = { width: size, height: size };
  if (entry.avatar_url && !failed) {
    return (
      <img
        src={entry.avatar_url}
        alt={entry.display_name}
        style={dim}
        className="shrink-0 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span style={{ ...dim, background: gradientFor(entry.user_id) }} className="shrink-0 rounded-full" aria-hidden />
  );
}

function YouPill() {
  return (
    <span className="shrink-0 rounded-full bg-violet-500/20 px-2 py-0.5 text-label text-violet-200">You</span>
  );
}

function PodiumCard({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const first = entry.rank === 1;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-2xl border bg-panel px-4 text-center",
        PODIUM_ORDER[entry.rank],
        first ? "py-5 shadow-[0_0_44px_-12px_rgba(220,38,38,0.55)]" : "py-4",
        isMe ? "border-violet-500/50" : first ? "border-violet-500/40" : "border-panel-line",
      )}
    >
      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-panel-line bg-panel-2 px-2.5 py-0.5 text-label text-secondary">
        {ORDINAL[entry.rank]}
      </span>
      <Trophy className={cn(first ? "h-6 w-6" : "h-5 w-5", TROPHY_TONE[entry.rank])} />
      <Face entry={entry} size={first ? 56 : 46} />
      <div className="flex max-w-full flex-col items-center gap-0.5">
        <span className="flex max-w-full items-center gap-1.5">
          <span className="truncate text-[14px] font-semibold text-white">{entry.display_name}</span>
          {isMe && <YouPill />}
        </span>
        <span className="text-label text-muted">{entry.drills} drills</span>
      </div>
      <div className="flex items-baseline gap-1 font-mono tabular">
        <span className={cn("font-bold text-white", first ? "text-[22px]" : "text-[18px]")}>
          {Math.round(entry.points).toLocaleString()}
        </span>
        <span className="text-label text-muted">pts</span>
      </div>
    </div>
  );
}

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

  if (error) return <div className="px-6 py-6 sm:px-8"><p className="text-body text-rose-400">{error}</p></div>;
  if (!board) return <LoadingScreen />;

  const myRank = board.find((b) => b.user_id === user?.id)?.rank ?? null;
  const podium = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div className="flex flex-col gap-6 px-6 py-6 sm:px-8">
      {/* ── Heading ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
            <Trophy className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <h1 className="text-h2">Leaderboard</h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {board.length} responders
            </p>
          </div>
        </div>
        {myRank && (
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet-200/70">Your rank</span>
            <span className="font-mono text-stat-mono tabular text-white">#{myRank}</span>
          </div>
        )}
      </div>

      {board.length === 0 ? (
        <p className="text-body text-secondary">No ranked drills yet, finish a drill to get on the board.</p>
      ) : (
        <>
          {/* ── Podium (top 3) ────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
            {podium.map((entry) => (
              <PodiumCard key={entry.user_id} entry={entry} isMe={entry.user_id === user?.id} />
            ))}
          </div>

          {/* ── The rest, as a table ──────────────────── */}
          {rest.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-panel-line bg-panel">
              <div className="flex items-center gap-4 border-b border-panel-line px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                <span className="w-6 text-center">#</span>
                <span className="flex-1">Responder</span>
                <span className="hidden w-20 text-right sm:block">Drills</span>
                <span className="w-24 text-right">Score</span>
              </div>
              {rest.map((r) => {
                const isMe = r.user_id === user?.id;
                return (
                  <div
                    key={r.user_id}
                    className={cn(
                      "flex items-center gap-4 border-b border-panel-line px-5 py-3 last:border-0 transition-colors",
                      isMe ? "bg-violet-500/10" : "hover:bg-panel-2/60",
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 text-center font-mono text-[13px] tabular",
                        isMe ? "text-violet-300" : "text-muted",
                      )}
                    >
                      {r.rank}
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <Face entry={r} size={32} />
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-[13px]",
                            isMe ? "font-semibold text-white" : "text-secondary",
                          )}
                        >
                          {r.display_name}
                        </span>
                        {isMe && <YouPill />}
                      </span>
                    </span>
                    <span className="hidden w-20 text-right text-label text-muted sm:block">{r.drills}</span>
                    <span className="flex w-24 items-baseline justify-end gap-1 font-mono tabular">
                      <span className="text-[14px] font-semibold text-white">
                        {Math.round(r.points).toLocaleString()}
                      </span>
                      <span className="text-label text-muted">pts</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
