"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ClusterState, Lab, LineTone, TermLine } from "@/lib/simulator/types";

const TONE_CLASS: Record<LineTone, string> = {
  out: "text-secondary",
  err: "text-rose-400",
  warn: "text-amber-300",
  ok: "text-emerald-400",
  sys: "text-violet-300",
  cmd: "text-white",
};

function bootLines(lab: Lab): TermLine[] {
  return [
    { text: "floci ❄  ephemeral cluster sandbox", tone: "sys" },
    { text: "Provisioning sandbox…", tone: "out" },
    { text: "✔ namespace/api ready", tone: "ok" },
    { text: `✔ cluster ${lab.instanceId} ready — kubectl context set`, tone: "ok" },
    { text: "", tone: "out" },
    { text: "The api tier is melting down. Type `help`, or `hint` if you get stuck.", tone: "sys" },
    { text: "", tone: "out" },
  ];
}

export function SimTerminal({
  lab,
  state,
  onState,
  resetNonce,
}: {
  lab: Lab;
  state: ClusterState;
  onState: (next: ClusterState) => void;
  resetNonce: number;
}) {
  const [lines, setLines] = useState<TermLine[]>(() => bootLines(lab));
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reboot the scrollback whenever the sandbox is reset.
  useEffect(() => {
    setLines(bootLines(lab));
    setHistory([]);
    setHistIdx(null);
  }, [resetNonce, lab]);

  // Keep the latest output in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  function submit() {
    const input = value;
    setValue("");
    setHistIdx(null);
    if (input.trim()) setHistory((h) => [...h, input]);

    const result = lab.run(state, input);
    onState(result.state);

    if (input.trim().toLowerCase() === "reset") {
      setLines(bootLines(lab));
      return;
    }
    setLines((prev) => (result.clear ? [] : [...prev, ...result.lines]));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = histIdx === null ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setValue(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === null) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(null);
        setValue("");
      } else {
        setHistIdx(idx);
        setValue(history[idx]);
      }
    }
  }

  const dead = state.status !== "active";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-panel-line bg-[#0B0708]">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-panel-line bg-panel/60 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </span>
        <span className="ml-2 font-mono text-[11px] text-muted">
          floci-sandbox — {lab.instanceId}: kubectl
        </span>
      </div>

      {/* Scrollback */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn("whitespace-pre-wrap break-words", TONE_CLASS[line.tone ?? "out"])}
          >
            {line.text === "" ? " " : line.text}
          </div>
        ))}

        {/* Prompt */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-emerald-400">$</span>
          <input
            ref={inputRef}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={dead ? 'type "reset" to run it again' : "kubectl …"}
            className="flex-1 bg-transparent font-mono text-[12.5px] text-white caret-emerald-400 outline-none placeholder:text-muted/60"
          />
        </div>
      </div>
    </div>
  );
}
