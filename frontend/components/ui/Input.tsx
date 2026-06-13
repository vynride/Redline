"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      {label && <span className="text-label text-secondary">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "h-11 rounded-md border bg-panel px-3.5 text-primary placeholder:text-muted",
          "transition focus:outline-none",
          error ? "border-rose-500" : "border-panel-line focus:border-violet-400",
          className,
        )}
        {...props}
      />
      {error && <span className="text-label text-rose-400">{error}</span>}
    </label>
  );
});
