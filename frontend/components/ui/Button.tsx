import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex items-center justify-center rounded-full font-semibold text-button transition " +
  "disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-cta-gradient text-on-accent px-6 h-11 shadow-card hover:brightness-110",
  secondary: "bg-surface-2 text-primary border border-line px-6 h-11 hover:border-line-strong",
  ghost: "bg-transparent text-secondary px-4 h-10 hover:text-primary",
};

/** Class string for the Redline button — reuse on <Link> elements that look like buttons. */
export function buttonStyles(variant: ButtonVariant = "primary", className?: string): string {
  return cn(BASE, VARIANTS[variant], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={buttonStyles(variant, className)} {...props} />;
}
