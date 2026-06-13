"use client";

import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

/** Segmented pill control — active tab lifts one surface notch. */
export function Tabs({ tabs, value, onValueChange, className }: TabsProps) {
  return (
    <div className={cn("inline-flex flex-wrap gap-1", className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "rounded-full px-4 py-2 text-body-strong transition",
              active ? "bg-surface-2 text-primary" : "text-secondary hover:text-primary",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
