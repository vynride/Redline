import { cn } from "@/lib/cn";

// Bright, vivid gradients with clear contrast, distinct and lively, still tasteful.
// Picked deterministically from the name so a persona always wears the same one.
const GRADIENTS = [
  "linear-gradient(135deg, #F87171, #6366f1)", // violet → indigo
  "linear-gradient(135deg, #f472b6, #db2777)", // pink → rose
  "linear-gradient(135deg, #38bdf8, #4f46e5)", // sky → indigo
  "linear-gradient(135deg, #34d399, #0ea5e9)", // emerald → sky
  "linear-gradient(135deg, #fbbf24, #f97316)", // amber → orange
  "linear-gradient(135deg, #22d3ee, #3b82f6)", // cyan → blue
  "linear-gradient(135deg, #fb7185, #e11d48)", // rose → red
  "linear-gradient(135deg, #c084fc, #DC2626)", // fuchsia → violet
];

function pick(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

/** A calm gradient avatar for the AI persona you're on the line with. */
export function PersonaAvatar({
  name,
  size = 36,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("shrink-0 rounded-full ring-1 ring-white/15", className)}
      style={{ width: size, height: size, background: pick(name) }}
    />
  );
}
