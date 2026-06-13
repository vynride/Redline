import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "gradient";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-button transition " +
  "disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";

// DESIGN.md button system on the dark canvas.
const VARIANTS: Record<ButtonVariant, string> = {
  // Primary on dark, the default CTA: a white pill.
  primary: "bg-white text-ink px-6 h-11 hover:scale-[1.03]",
  // Neutral surface pill.
  secondary: "bg-panel text-primary border border-panel-line px-6 h-11 hover:border-violet-500/40",
  // Lowest-emphasis text button.
  ghost: "bg-transparent text-secondary px-4 h-10 hover:text-white",
  // High-emphasis accent, the single loudest action.
  gradient: "bg-neon-duo text-white px-6 h-11 shadow-[0_10px_40px_-12px_rgba(124,58,237,0.8)] hover:brightness-110",
};

/** Class string for the Redline button, reuse on <Link> elements that look like buttons. */
export function buttonStyles(variant: ButtonVariant = "primary", className?: string): string {
  return cn(BASE, VARIANTS[variant], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={buttonStyles(variant, className)} {...props} />;
}
