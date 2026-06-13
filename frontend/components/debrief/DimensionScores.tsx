import { Meter, type MeterTone } from "@/components/drill/hud/Meter";
import type { DimensionScores as Scores } from "@shared/types";

const LABELS: Array<[keyof Scores, string]> = [
  ["clarity", "Clarity"],
  ["deescalation", "De-escalation"],
  ["info_gathering", "Info gathering"],
  ["escalation", "Escalation"],
  ["status_communication", "Status comms"],
];

function tone(v: number): MeterTone {
  if (v >= 70) return "positive";
  if (v >= 40) return "accent";
  return "negative";
}

export function DimensionScores({ scores }: { scores: Scores }) {
  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {LABELS.map(([key, label]) => (
        <div key={key} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] text-secondary">{label}</span>
            <span className="font-mono text-body-strong tabular text-primary">{scores[key]}</span>
          </div>
          <Meter value={scores[key]} max={100} tone={tone(scores[key])} />
        </div>
      ))}
    </div>
  );
}
