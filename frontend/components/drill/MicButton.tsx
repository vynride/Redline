"use client";

import { RedlineMark } from "@/components/ui";
import { cn } from "@/lib/cn";

export type MicState = "ready" | "recording" | "thinking" | "ended";

/** One clear, action-oriented line per state, tells you exactly what to do now. */
function label(state: MicState, persona: string): string {
  switch (state) {
    case "ready":
      return `Tap, then tell ${persona} what to do next`;
    case "recording":
      return "Listening, tap again when you're done";
    case "thinking":
      return `${persona} is responding…`;
    case "ended":
      return "Drill complete, open your debrief";
  }
}

export function MicButton({
  state,
  onToggle,
  personaName = "them",
}: {
  state: MicState;
  onToggle: () => void;
  personaName?: string;
}) {
  const disabled = state === "thinking" || state === "ended";
  const recording = state === "recording";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative grid place-items-center">
        {/* Concentric "listening" rings radiating from the live mic. */}
        {recording && (
          <>
            <span className="absolute h-16 w-16 rounded-full bg-rose-500/20 animate-ping" />
            <span
              className="absolute h-16 w-16 rounded-full bg-rose-500/10 animate-ping"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}

        <button
          onClick={onToggle}
          disabled={disabled}
          aria-label={recording ? "Stop and send" : "Start speaking"}
          className={cn(
            "relative grid h-16 w-16 place-items-center rounded-full transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-panel",
            recording &&
              "bg-rose-500/15 text-rose-300 ring-2 ring-rose-500/40 shadow-[0_0_40px_-8px_rgba(244,63,94,0.6)]",
            state === "ready" &&
              "bg-violet-500 text-white shadow-[0_12px_44px_-12px_rgba(220,38,38,0.85)] hover:bg-violet-400",
            state === "thinking" && "bg-panel-2 text-violet-300 ring-1 ring-panel-line",
            state === "ended" && "bg-panel-2 text-muted ring-1 ring-panel-line",
          )}
        >
          {state === "recording" ? (
            // Stop affordance, tapping ends the turn.
            <span className="h-5 w-5 rounded-md bg-current" />
          ) : state === "thinking" ? (
            <span className="h-6 w-6 rounded-full border-2 border-violet-500/25 border-t-violet-300 animate-spin" />
          ) : (
            <RedlineMark className="h-7 w-7" />
          )}
        </button>
      </div>

      <span
        className={cn(
          "text-body-strong",
          recording ? "text-rose-300" : state === "ended" ? "text-muted" : "text-primary",
        )}
      >
        {label(state, personaName)}
      </span>
    </div>
  );
}
