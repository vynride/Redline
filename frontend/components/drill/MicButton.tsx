"use client";

import { RedlineMark } from "@/components/ui";
import { cn } from "@/lib/cn";

export type MicState = "ready" | "recording" | "thinking" | "ended";

const LABELS: Record<MicState, string> = {
  ready: "Hold the line — tap to respond",
  recording: "Listening… tap to send",
  thinking: "The other side is responding…",
  ended: "Drill complete",
};

const HINTS: Record<MicState, string> = {
  ready: "Speak clearly, then tap to send your turn",
  recording: "Your mic is live",
  thinking: "Stand by",
  ended: "Open the debrief to see how you did",
};

export function MicButton({ state, onToggle }: { state: MicState; onToggle: () => void }) {
  const disabled = state === "thinking" || state === "ended";
  const recording = state === "recording";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative grid place-items-center">
        {/* Concentric "listening" rings radiating from the live mic. */}
        {recording && (
          <>
            <span className="absolute h-20 w-20 rounded-full bg-rose-500/20 animate-ping" />
            <span
              className="absolute h-20 w-20 rounded-full bg-rose-500/10 animate-ping"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}

        <button
          onClick={onToggle}
          disabled={disabled}
          aria-label={recording ? "Stop and send" : "Start speaking"}
          className={cn(
            "relative grid h-20 w-20 place-items-center rounded-full transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-panel",
            recording &&
              "bg-rose-500/15 text-rose-300 ring-2 ring-rose-500/40 shadow-[0_0_40px_-8px_rgba(244,63,94,0.6)]",
            state === "ready" &&
              "bg-violet-500 text-white shadow-[0_12px_44px_-12px_rgba(124,58,237,0.85)] hover:bg-violet-400",
            state === "thinking" && "bg-panel-2 text-violet-300 ring-1 ring-panel-line",
            state === "ended" && "bg-panel-2 text-muted ring-1 ring-panel-line",
          )}
        >
          {state === "recording" ? (
            // Stop affordance — tapping ends the turn.
            <span className="h-6 w-6 rounded-md bg-current" />
          ) : state === "thinking" ? (
            <span className="h-7 w-7 rounded-full border-2 border-violet-500/25 border-t-violet-300 animate-spin" />
          ) : (
            <RedlineMark className="h-9 w-9" />
          )}
        </button>
      </div>

      <div className="flex flex-col items-center gap-0.5 text-center">
        <span
          className={cn(
            "text-body-strong",
            recording ? "text-rose-300" : state === "ended" ? "text-muted" : "text-primary",
          )}
        >
          {LABELS[state]}
        </span>
        <span className="text-label text-muted">{HINTS[state]}</span>
      </div>
    </div>
  );
}
