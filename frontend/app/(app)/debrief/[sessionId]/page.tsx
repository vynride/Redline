"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DimensionScores } from "@/components/debrief/DimensionScores";
import { Transcript, type TranscriptLine } from "@/components/drill/Transcript";
import { Button, Card, Pill } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { DebriefOut, SessionDetail } from "@shared/types";

function gradeTone(grade: string): string {
  if (grade.startsWith("A") || grade.startsWith("B")) return "text-positive";
  if (grade.startsWith("C")) return "text-accent";
  return "text-negative";
}

export default function DebriefPage() {
  const sessionId = String(useParams().sessionId);
  const [debrief, setDebrief] = useState<DebriefOut | null>(null);
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setPending(false);
    Promise.all([api.getDebrief(sessionId), api.getSession(sessionId)])
      .then(([d, s]) => {
        if (cancelled) return;
        setDebrief(d);
        setSession(s);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 409) setPending(true);
        else setError(e instanceof Error ? e.message : "Could not load the debrief.");
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (pending) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-body text-secondary">This drill is still active — finish it to unlock the debrief.</p>
        <Link href={`/drill/${sessionId}`}>
          <Button>Back to the drill</Button>
        </Link>
      </div>
    );
  }
  if (error) return <p className="text-body text-negative">{error}</p>;
  if (!debrief || !session) return <p className="text-body text-secondary">Loading debrief…</p>;

  const c = debrief.content;
  const lines: TranscriptLine[] = session.turns.map((t) => ({
    role: t.speaker, text: t.text, emotion: t.emotion as never,
  }));

  return (
    <div className="flex flex-col gap-section">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <Pill>Debrief</Pill>
          <h1 className="text-h1">{debrief.summary}</h1>
        </div>
        <Card widget className="flex min-w-[180px] flex-col items-center gap-1">
          <span className="text-label text-secondary">Overall grade</span>
          <span className={cn("text-[64px] font-bold leading-none", gradeTone(debrief.overall_grade))}>
            {debrief.overall_grade}
          </span>
          {session.score != null && (
            <span className="font-mono text-body text-muted tabular">{session.score} / 100</span>
          )}
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {/* Strengths */}
          <Card className="flex flex-col gap-3">
            <h2 className="text-h2">What went well</h2>
            <ul className="flex flex-col gap-2">
              {c.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-body">
                  <span className="leading-6 text-positive">✓</span>
                  <span className="text-primary">{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Lost control moments */}
          <Card className="flex flex-col gap-4">
            <h2 className="text-h2">Where you lost control</h2>
            {c.lost_control.length === 0 && <p className="text-body text-secondary">No major slips — well held.</p>}
            {c.lost_control.map((m, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-md border border-line bg-surface-2 p-4">
                <p className="border-l-2 border-negative pl-3 text-body italic text-secondary">“{m.quote}”</p>
                <p className="text-body text-secondary"><span className="text-negative">Issue:</span> {m.issue}</p>
                <p className="text-body text-primary"><span className="text-positive">Stronger:</span> {m.better}</p>
              </div>
            ))}
          </Card>

          {/* Missed info + assessments */}
          <Card className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-h2">Missed information</h2>
              {c.missed_information.length === 0 ? (
                <p className="text-body text-secondary">You gathered what mattered.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {c.missed_information.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-body">
                      <span className="leading-6 text-muted">○</span>
                      <span className="text-secondary">{m}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-label text-secondary">Escalation</span>
                <p className="text-body text-primary">{c.escalation_assessment}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label text-secondary">Status communication</span>
                <p className="text-body text-primary">{c.status_communication_assessment}</p>
              </div>
            </div>
          </Card>

          {/* Transcript replay */}
          <Card className="flex flex-col gap-4">
            <h2 className="text-h2">Transcript</h2>
            <Transcript lines={lines} personaName="Persona" />
          </Card>
        </div>

        {/* Scores sidebar */}
        <div className="flex flex-col gap-6">
          <Card widget className="flex flex-col gap-5">
            <h2 className="text-h2">Scores</h2>
            <DimensionScores scores={c.dimension_scores} />
          </Card>
          <Link href="/dashboard">
            <Button variant="secondary" className="w-full">Run another drill</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
