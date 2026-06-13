import { UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { EMOTION_TONE } from "@/lib/scenarioMeta";
import type { Emotion } from "@shared/types";

export interface TranscriptLine {
  role: "user" | "persona";
  text: string;
  emotion?: Emotion | null;
}

export function Transcript({
  lines,
  personaName,
  personaIcon: Icon = UserRound,
  thinking = false,
}: {
  lines: TranscriptLine[];
  personaName: string;
  personaIcon?: LucideIcon;
  thinking?: boolean;
}) {
  if (lines.length === 0 && !thinking) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-panel-2 text-violet-300">
          {/* Soft "ringing" pulse around the persona while you connect. */}
          <span className="absolute inset-0 rounded-2xl ring-1 ring-violet-500/30 animate-ping" />
          <Icon className="h-6 w-6" />
        </span>
        <p className="text-body-strong text-primary">You&apos;re connected to {personaName}</p>
        <p className="max-w-xs text-body text-secondary">
          Tap the button below and start talking — they&apos;re waiting on the other side of the line.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      {lines.map((line, i) => {
        const isUser = line.role === "user";
        // Group consecutive turns from the same speaker — only the first in a run
        // shows the avatar + name header, so a back-and-forth reads like a real chat.
        const startsRun = i === 0 || lines[i - 1].role !== line.role;
        return (
          <div
            key={i}
            className={cn(
              "flex items-end gap-2.5",
              isUser ? "flex-row-reverse" : "flex-row",
              startsRun ? "mt-1" : "-mt-3",
            )}
            style={{ animation: "redline-fade-up 0.3s ease-out both" }}
          >
            {/* Persona avatar; the user side stays avatar-less for a clean right rail. */}
            {!isUser &&
              (startsRun ? (
                <span className="mb-5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel-2 text-violet-300">
                  <Icon className="h-4 w-4" />
                </span>
              ) : (
                // Spacer keeps follow-on bubbles aligned under the first one.
                <span className="w-8 shrink-0" />
              ))}
            <div className={cn("flex max-w-[78%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
              {(startsRun || line.emotion) && (
                <span className="flex items-center gap-1.5 px-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  {startsRun && (isUser ? "You" : personaName)}
                  {line.emotion && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal",
                        EMOTION_TONE[line.emotion],
                      )}
                    >
                      {line.emotion}
                    </span>
                  )}
                </span>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-body leading-relaxed",
                  isUser
                    ? "rounded-br-md bg-violet-600 text-white"
                    : "rounded-bl-md border border-panel-line bg-panel-2 text-primary",
                )}
              >
                {line.text}
              </div>
            </div>
          </div>
        );
      })}

      {/* Live "the other side is typing" indicator. */}
      {thinking && (
        <div className="flex items-end gap-2.5">
          <span className="mb-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel-2 text-violet-300">
            <Icon className="h-4 w-4" />
          </span>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-panel-line bg-panel-2 px-4 py-3.5">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="h-1.5 w-1.5 rounded-full bg-violet-300/70 animate-bounce"
                style={{ animationDelay: `${d * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
