import { cn } from "@/lib/cn";
import type { Emotion } from "@shared/types";

export interface TranscriptLine {
  role: "user" | "persona";
  text: string;
  emotion?: Emotion | null;
}

export function Transcript({ lines, personaName }: { lines: TranscriptLine[]; personaName: string }) {
  return (
    <div className="flex flex-col gap-4">
      {lines.map((line, i) => {
        const isUser = line.role === "user";
        return (
          <div key={i} className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
            <span className="px-1 text-label text-muted">
              {isUser ? "You" : personaName}
              {line.emotion ? ` · ${line.emotion}` : ""}
            </span>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-body",
                isUser ? "bg-violet-500 text-white" : "border border-panel-line bg-panel text-primary",
              )}
            >
              {line.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
