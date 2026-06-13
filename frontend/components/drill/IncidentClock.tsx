"use client";

import { useEffect, useState } from "react";

/**
 * Seconds elapsed between `startedAt` and now, ticking once a second while the
 * drill is live. Once `endedAt` is set the value freezes at the final duration —
 * a closed incident shows the time it took, not a clock that keeps running.
 */
function useElapsed(startedAt: string, endedAt: string | null): number {
  const start = new Date(startedAt).getTime();
  const frozen = endedAt ? Math.max(0, (new Date(endedAt).getTime() - start) / 1000) : null;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (frozen !== null) return; // ended — nothing to tick
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [frozen]);

  if (frozen !== null) return Math.floor(frozen);
  return Math.max(0, Math.floor((now - start) / 1000));
}

/** mm:ss, rolling to h:mm:ss once the call passes an hour. */
function format(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * The live incident clock — a mono/tabular chip styled like the dashboard's
 * readiness tile. Ticks from session start and freezes when the call ends.
 */
export function IncidentClock({
  startedAt,
  endedAt,
}: {
  startedAt: string;
  endedAt: string | null;
}) {
  const elapsed = useElapsed(startedAt, endedAt);
  const live = !endedAt;
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-panel-line bg-panel px-3 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Elapsed</span>
      <span className="h-4 w-px bg-panel-line" />
      <span
        className="font-mono text-[13px] font-semibold tabular text-white"
        aria-live={live ? "off" : undefined}
      >
        {format(elapsed)}
      </span>
    </div>
  );
}
