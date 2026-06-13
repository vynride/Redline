import { cn } from "@/lib/cn";

export type MeterTone = "accent" | "positive" | "negative";

const FILLS: Record<MeterTone, string> = {
  accent: "bg-violet-500",
  positive: "bg-emerald-400",
  negative: "bg-rose-500",
};

/** A thin progress track used by the severity and confidence readouts. */
export function Meter({ value, max, tone = "accent" }: { value: number; max: number; tone?: MeterTone }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2">
      <div className={cn("h-full rounded-full transition-all", FILLS[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
