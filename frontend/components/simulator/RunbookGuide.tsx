"use client";

import { useState } from "react";
import { Check, CheckCircle2, Circle, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ClusterState, Lab } from "@/lib/simulator/types";

// ── Minimal kubectl syntax highlighting ─────────────────────────────────────
const VERBS = new Set([
  "get", "describe", "top", "rollout", "history", "undo", "status", "annotate",
  "apply", "set", "resources", "scale", "logs", "delete", "edit", "rollback",
]);
const KINDS = new Set([
  "pod", "pods", "po", "deployment", "deployments", "deploy", "ingress",
  "hpa", "node", "nodes", "svc", "service", "rs", "replicaset",
]);

function tokenClass(token: string): string {
  if (token === "kubectl") return "text-violet-300 font-semibold";
  if (VERBS.has(token)) return "text-sky-300";
  if (token.startsWith("<") && token.endsWith(">")) return "italic text-muted";
  if (token.startsWith("-")) return "text-amber-300";
  const base = token.split("/")[0].split(".")[0];
  if (KINDS.has(base)) return "text-emerald-300";
  return "text-secondary";
}

/** Render a command string with each whitespace-separated token colored. */
function HighlightedCommand({ text }: { text: string }) {
  const tokens = text.split(" ");
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i}>
          <span className={tokenClass(t)}>{t}</span>
          {i < tokens.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

/** Small copy-to-clipboard button shown beside each runbook command. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy command"
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          })
          .catch(() => {});
      }}
      className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-md border border-panel-line bg-panel-2 text-muted transition hover:border-violet-500/40 hover:text-white"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function RunbookGuide({ lab, state }: { lab: Lab; state: ClusterState }) {
  const steps = lab.runbook;
  const doneCount = steps.filter((s) => s.done(state)).length;
  const total = steps.length;
  const pct = total ? (doneCount / total) * 100 : 0;
  // The first not-yet-done step is the one to nudge the user toward.
  const activeIdx = steps.findIndex((s) => !s.done(state));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-panel-line bg-panel">
      {/* Pinned header */}
      <div className="shrink-0 border-b border-panel-line px-5 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
            Runbook
          </span>
          <span className={cn("font-mono text-[13px] tabular", doneCount === total ? "text-emerald-400" : "text-secondary")}>
            {doneCount}/{total}
          </span>
        </div>
        <p className="mt-1 text-label text-muted">Stop the cascade first, then stop the leak.</p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-panel-2">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Scrolling step list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => {
            const done = step.done(state);
            const active = !done && i === activeIdx;
            return (
              <li key={step.id} className="flex gap-3">
                <span className="mt-0.5 shrink-0">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className={cn("h-4 w-4", active ? "text-violet-300" : "text-muted/50")} />
                  )}
                </span>
                <div className="min-w-0">
                  <div
                    className={cn(
                      "text-[15px] font-medium leading-snug",
                      done ? "text-secondary line-through" : active ? "text-white" : "text-secondary",
                    )}
                  >
                    {step.title}
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-secondary">{step.detail}</p>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {step.commands.map((c) => (
                      <div key={c} className="flex items-start gap-1.5">
                        <code className="min-w-0 break-all rounded-md border border-panel-line bg-panel-2 px-2 py-1 font-mono text-[12.5px]">
                          <HighlightedCommand text={c} />
                        </code>
                        <CopyButton text={c} />
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
