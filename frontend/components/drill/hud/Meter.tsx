import { cn } from "@/lib/cn";

export type MeterTone = "accent" | "positive" | "negative";

const FILLS: Record<MeterTone, string> = {
  accent: "bg-violet-500 shadow-[0_0_12px_-2px_rgba(139,92,246,0.7)]",
  positive: "bg-emerald-400 shadow-[0_0_12px_-2px_rgba(52,211,153,0.7)]",
  negative: "bg-rose-500 shadow-[0_0_12px_-2px_rgba(244,63,94,0.7)]",
};

/** A thin progress track used by the severity and confidence readouts. */
export function Meter({ value, max, tone = "accent" }: { value: number; max: number; tone?: MeterTone }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2">
      <div
        className={cn("h-full rounded-full transition-all duration-500 ease-out", FILLS[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
