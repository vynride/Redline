"use client";

import { cn } from "@/lib/cn";

export type MicState = "ready" | "recording" | "thinking" | "ended";

const LABELS: Record<MicState, string> = {
  ready: "Hold the line — tap to respond",
  recording: "Listening… tap to send",
  thinking: "The other side is responding…",
  ended: "Drill complete",
};

export function MicButton({ state, onToggle }: { state: MicState; onToggle: () => void }) {
  const disabled = state === "thinking" || state === "ended";
  const recording = state === "recording";
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onToggle}
        disabled={disabled}
        aria-label={recording ? "Stop and send" : "Start speaking"}
        className={cn(
          "grid h-20 w-20 place-items-center rounded-full transition disabled:opacity-40",
          recording
            ? "bg-negative-soft text-negative ring-4 ring-negative/30 animate-pulse"
            : "bg-cta-gradient text-on-accent hover:brightness-110",
        )}
      >
        <MicIcon active={recording} />
      </button>
      <span className="text-label text-secondary">{LABELS[state]}</span>
    </div>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      {active ? (
        <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />
      ) : (
        <>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <line x1="12" y1="18" x2="12" y2="21" />
        </>
      )}
    </svg>
  );
}
