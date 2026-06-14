"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw, Quote, Download } from "lucide-react";
import { DimensionScores } from "@/components/debrief/DimensionScores";
import { Transcript, type TranscriptLine } from "@/components/drill/Transcript";
import { Button, Card, LoadingScreen, StatusPill, type StatusTone } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { ARCHETYPE_ICONS, SEV, hardest } from "@/lib/scenarioMeta";
import { ARCHETYPE_LABELS, DIFFICULTY_LABELS, ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { DebriefOut, Scenario, SessionDetail } from "@shared/types";

/** Mono section eyebrow, matches the drill HUD / dashboard chrome. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-secondary">{children}</span>
  );
}

function gradeTone(grade: string): string {
  if (grade.startsWith("A") || grade.startsWith("B")) return "text-emerald-400";
  if (grade.startsWith("C")) return "text-violet-300";
  if (grade.startsWith("D")) return "text-amber-300";
  return "text-rose-400";
}

/** Win / loss / ended outcome derived from the final severity and status. */
function outcome(
  session: SessionDetail,
  scenario: Scenario,
): { label: string; tone: StatusTone } {
  const { win_below, lose_at } = scenario.severity;
  if (session.severity >= lose_at) return { label: "Lost", tone: "negative" };
  if (session.status === "completed" && session.severity < win_below)
    return { label: "Resolved", tone: "positive" };
  if (session.status === "abandoned") return { label: "Ended early", tone: "neutral" };
  return { label: "Held the line", tone: "accent" };
}

function duration(start: string, end: string | null): string {
  if (!end) return ", ";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms < 0) return ", ";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function DebriefPage() {
  const sessionId = String(useParams().sessionId);
  const [debrief, setDebrief] = useState<DebriefOut | null>(null);
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function onDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await api.downloadDebriefPdf(sessionId);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Could not export the PDF.");
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setPending(false);
    (async () => {
      try {
        // Fetch the debrief first, generating it also finalises the session's
        // composite score, so the session must be read *after* that commits.
        const d = await api.getDebrief(sessionId);
        const s = await api.getSession(sessionId);
        if (cancelled) return;
        setDebrief(d);
        setSession(s);
        // Resolve via the session (not the static catalog) so generated drills,
        // whose scenario lives only as a per-session snapshot, load correctly.
        const sc = await api.getSessionScenario(sessionId);
        if (!cancelled) setScenario(sc);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 409) setPending(true);
        else setError(e instanceof Error ? e.message : "Could not load the debrief.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (pending) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-body text-secondary">This drill is still active, finish it to unlock the debrief.</p>
        <Link href={`/drill/${sessionId}`}>
          <Button>Back to the drill</Button>
        </Link>
      </div>
    );
  }
  if (error) return <p className="text-body text-rose-400">{error}</p>;
  if (!debrief || !session || !scenario) return <LoadingScreen />;

  const c = debrief.content;
  const lines: TranscriptLine[] = session.turns.map((t) => ({
    role: t.speaker, text: t.text, emotion: t.emotion as never,
  }));

  const Icon = ARCHETYPE_ICONS[scenario.archetype];
  const sev = SEV[session.difficulty ?? hardest(scenario.difficulties)];
  const result = outcome(session, scenario);
  const score = session.score != null ? Math.round(session.score) : null;
  const objTotal = scenario.objectives.length;
  const objMet = session.objectives_met.length;
  const userTurns = lines.filter((l) => l.role === "user").length;
  const severityDrop = session.severity_start - session.severity;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      {/* ── Report header ─────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-panel-line bg-panel px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-panel-2 text-violet-300">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Eyebrow>Debrief</Eyebrow>
              <span className="text-muted">·</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {ARCHETYPE_LABELS[scenario.archetype]}
              </span>
              <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold", sev.cls)}>
                {sev.label}
              </span>
            </div>
            <h1 className="mt-0.5 truncate text-[22px] font-semibold leading-tight text-white">
              {scenario.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-label text-muted">
          <span>{ROLE_LABELS[session.role]}</span>
          <span>·</span>
          <span>{DIFFICULTY_LABELS[session.difficulty]}</span>
          <StatusPill tone={result.tone} className="ml-1">{result.label}</StatusPill>
        </div>
      </header>

      {/* ── Verdict: grade + summary + key stats ──────────── */}
      <section className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card widget className="flex flex-col items-center justify-center gap-1 text-center">
          <Eyebrow>Overall grade</Eyebrow>
          <span className={cn("text-[58px] font-bold leading-none", gradeTone(debrief.overall_grade))}>
            {debrief.overall_grade}
          </span>
          {score != null && (
            <span className="font-mono text-body-strong tabular text-secondary">{score}<span className="text-muted"> / 100</span></span>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <Eyebrow>Coach&apos;s summary</Eyebrow>
          <p className="text-body-lg leading-relaxed text-primary">{debrief.summary}</p>
          <div className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-panel-line bg-panel-line sm:grid-cols-4">
            <Stat label="Severity" value={`${session.severity_start} → ${session.severity}`} tone={severityDrop > 0 ? "positive" : severityDrop < 0 ? "negative" : "default"} />
            <Stat label="Objectives" value={`${objMet} / ${objTotal}`} tone={objMet === objTotal ? "positive" : "default"} />
            <Stat label="Your turns" value={userTurns} />
            <Stat label="Duration" value={duration(session.created_at, session.ended_at)} />
          </div>
        </Card>
      </section>

      {/* ── Performance by dimension ──────────────────────── */}
      <Card className="flex flex-col gap-5">
        <Eyebrow>Performance by dimension</Eyebrow>
        <DimensionScores scores={c.dimension_scores} />
      </Card>

      {/* ── What went well ────────────────────────────────── */}
      <Card className="flex flex-col gap-4">
        <Eyebrow>What went well</Eyebrow>
        <ul
          className={cn(
            "grid gap-x-10 gap-y-3",
            c.strengths.length > 1 && "sm:grid-cols-2",
          )}
        >
          {c.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-body">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[11px] text-emerald-400">✓</span>
              <span className="leading-snug text-primary">{s}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ── Where you lost control ────────────────────────── */}
      <Card className="flex flex-col gap-4">
        <Eyebrow>Where you lost control</Eyebrow>
        {c.lost_control.length === 0 ? (
          <p className="text-body text-secondary">No major slips, well held.</p>
        ) : (
          <div
            className={cn(
              "grid items-stretch gap-4",
              c.lost_control.length > 1 && "lg:grid-cols-2",
            )}
          >
            {c.lost_control.map((m, i) => (
              <div key={i} className="flex h-full flex-col gap-2.5 rounded-xl border border-panel-line bg-panel-2 p-4">
                <p className="flex gap-2 text-body italic leading-snug text-secondary">
                  <Quote className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-400/70" />
                  {m.quote}
                </p>
                <p className="text-[13.5px] leading-snug text-secondary">
                  <span className="font-medium text-rose-400">Issue · </span>{m.issue}
                </p>
                <p className="text-[13.5px] leading-snug text-primary">
                  <span className="font-medium text-emerald-400">Stronger · </span>{m.better}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Missed information ────────────────────────────── */}
      <Card className="flex flex-col gap-4">
        <Eyebrow>Missed information</Eyebrow>
        {c.missed_information.length === 0 ? (
          <p className="text-body text-secondary">You gathered what mattered.</p>
        ) : (
          <ul
            className={cn(
              "grid gap-x-10 gap-y-3",
              c.missed_information.length > 1 && "sm:grid-cols-2",
            )}
          >
            {c.missed_information.map((m, i) => (
              <li key={i} className="flex items-start gap-2.5 text-body">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-panel-line bg-panel text-[11px] text-muted">○</span>
                <span className="leading-snug text-secondary">{m}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ── Escalation & status ───────────────────────────── */}
      <Card className="flex flex-col gap-4">
        <Eyebrow>Escalation &amp; status</Eyebrow>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-label text-secondary">Escalation</span>
            <p className="text-body leading-snug text-primary">{c.escalation_assessment}</p>
          </div>
          <div className="flex flex-col gap-1.5 sm:border-l sm:border-panel-line sm:pl-6">
            <span className="text-label text-secondary">Status communication</span>
            <p className="text-body leading-snug text-primary">{c.status_communication_assessment}</p>
          </div>
        </div>
      </Card>

      {/* ── Transcript replay ─────────────────────────────── */}
      <Card className="flex flex-col gap-4">
        <Eyebrow>Transcript</Eyebrow>
        <div className="max-h-[460px] overflow-y-auto pr-1">
          <Transcript lines={lines} personaName={scenario.persona.name} />
        </div>
      </Card>

      {/* ── Actions ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Button variant="secondary" className="gap-2" onClick={onDownload} disabled={downloading}>
            <Download className="h-4 w-4" /> {downloading ? "Preparing PDF…" : "Download PDF"}
          </Button>
          {downloadError && <span className="text-[12px] text-rose-400">{downloadError}</span>}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Run another drill
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="gap-2">
              Back to dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Compact stat cell for the verdict strip. */
function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <div className="flex flex-col gap-1 bg-panel px-4 py-3">
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      <span
        className={cn(
          "font-mono text-body-strong tabular",
          tone === "positive" ? "text-emerald-400" : tone === "negative" ? "text-rose-400" : "text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}
