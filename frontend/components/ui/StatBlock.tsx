import { cn } from "@/lib/cn";

interface StatBlockProps {
  label: string;
  value: string | number;
  /** Render the value in JetBrains Mono — for IDs, scores, and fixed-width values. */
  mono?: boolean;
  /** Directional tint for the value. */
  tone?: "default" | "positive" | "negative";
  className?: string;
}

/** The reusable "number is the hero" unit: small label above a large value. */
export function StatBlock({ label, value, mono, tone = "default", className }: StatBlockProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-label text-secondary">{label}</span>
      <span
        className={cn(
          mono ? "font-mono text-stat-mono tabular text-primary" : "text-stat text-primary",
          tone === "positive" && "text-emerald-400",
          tone === "negative" && "text-rose-400",
        )}
      >
        {value}
      </span>
    </div>
  );
}
