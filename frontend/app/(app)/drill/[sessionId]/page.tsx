"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, PhoneOff } from "lucide-react";
import { MicButton, type MicState } from "@/components/drill/MicButton";
import { Transcript, type TranscriptLine } from "@/components/drill/Transcript";
import { IncidentClock } from "@/components/drill/IncidentClock";
import { DrillHud, type Trend } from "@/components/drill/hud/DrillHud";
import { Button, LoadingScreen } from "@/components/ui";
import { api } from "@/lib/api";
import { MicCapture, PcmPlayer } from "@/lib/audio";
import { ARCHETYPE_LABELS, ROLE_LABELS } from "@/lib/labels";
import { ARCHETYPE_ICONS, SEV, hardest } from "@/lib/scenarioMeta";
import { cn } from "@/lib/cn";
import { DrillSocket } from "@/lib/ws";
import type { Difficulty, Role, Scenario, SessionState } from "@shared/types";

export default function DrillPage() {
  const sessionId = String(useParams().sessionId);

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [meta, setMeta] = useState<{ role: Role; difficulty: Difficulty } | null>(null);
  const [times, setTimes] = useState<{ startedAt: string; endedAt: string | null } | null>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [state, setState] = useState<SessionState | null>(null);
  const [mic, setMic] = useState<MicState>("ready");
  const [ended, setEnded] = useState(false);
  const [trend, setTrend] = useState<Trend>("flat");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<DrillSocket | null>(null);
  const captureRef = useRef<MicCapture | null>(null);
  const playerRef = useRef<PcmPlayer | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const prevSeverityRef = useRef<number | null>(null);

  // Stamp the end time once so the incident clock freezes; server time wins if we
  // already have it, otherwise mark the moment the call closed client-side.
  const stampEnded = useCallback(() => {
    setEnded(true);
    setTimes((t) => (t && !t.endedAt ? { ...t, endedAt: new Date().toISOString() } : t));
  }, []);

  // Load session + scenario, seed the transcript, then open the socket.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await api.getSession(sessionId);
        const sc = await api.getScenario(session.scenario_id);
        if (cancelled) return;
        setScenario(sc);
        setMeta({ role: session.role, difficulty: session.difficulty });
        setTimes({ startedAt: session.created_at, endedAt: session.ended_at });
        setLines(session.turns.map((t) => ({ role: t.speaker, text: t.text, emotion: t.emotion as never })));
        setState({
          severity: session.severity, severity_start: session.severity_start, confidence: session.confidence,
          objectives_met: session.objectives_met, escalation_timeline: session.escalation_timeline, status: session.status,
        });
        prevSeverityRef.current = session.severity;
        if (session.status !== "active") setEnded(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load the drill.");
        return;
      }

      const player = new PcmPlayer();
      playerRef.current = player;
      const socket = new DrillSocket(sessionId, {
        onMessage: (msg) => {
          if (msg.type === "transcript") {
            setLines((prev) => [...prev, { role: msg.role, text: msg.text, emotion: msg.emotion }]);
          } else if (msg.type === "state") {
            // Severity vs. the previous turn drives the momentum arrow.
            const prev = prevSeverityRef.current;
            if (prev !== null && msg.state.severity !== prev) {
              setTrend(msg.state.severity > prev ? "up" : "down");
            }
            prevSeverityRef.current = msg.state.severity;
            setState(msg.state);
            if (msg.state.status !== "active") stampEnded();
          } else if (msg.type === "turn_complete") {
            setMic((m) => (m === "ended" ? m : "ready"));
          } else if (msg.type === "session_complete") {
            stampEnded();
            setMic("ended");
          } else if (msg.type === "error") {
            setNotice(msg.detail);
            setMic((m) => (m === "thinking" ? "ready" : m));
          }
        },
        onAudio: (chunk) => playerRef.current?.enqueue(chunk),
      });
      socket.connect();
      socketRef.current = socket;
    })();

    return () => {
      cancelled = true;
      captureRef.current?.stop();
      socketRef.current?.close();
      playerRef.current?.close();
    };
  }, [sessionId, stampEnded]);

  // Keep the latest turn in view — also when the "typing" indicator appears so it
  // isn't stranded below the fold.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, mic]);

  const toggleMic = useCallback(async () => {
    setNotice(null);
    if (mic === "ready") {
      await playerRef.current?.resume();
      const capture = new MicCapture((pcm) => socketRef.current?.sendAudio(pcm));
      try {
        await capture.start();
      } catch {
        setNotice("Microphone access is required to respond.");
        return;
      }
      captureRef.current = capture;
      setMic("recording");
    } else if (mic === "recording") {
      captureRef.current?.stop();
      captureRef.current = null;
      socketRef.current?.endTurn();
      setMic("thinking");
    }
  }, [mic]);

  function endDrill() {
    captureRef.current?.stop();
    socketRef.current?.endSession();
  }

  if (error) return <p className="text-body text-rose-400">{error}</p>;
  if (!scenario || !state || !meta) return <LoadingScreen />;

  const Icon = ARCHETYPE_ICONS[scenario.archetype];
  const sev = SEV[meta.difficulty ?? hardest(scenario.difficulties)];
  const personaRole = scenario.persona.role.replace(/_/g, " ");
  const turns = lines.filter((l) => l.role === "user").length;

  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:px-8 lg:h-[calc(100dvh-4rem)]">
      {/* ── Command bar — title, badges, live clock, end ───── */}
      <header
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-panel-line bg-panel px-4 py-3 sm:px-5"
        style={{ animation: "redline-fade-up 0.4s ease-out both" }}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-panel-2 text-violet-300">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                {ARCHETYPE_LABELS[scenario.archetype]}
              </span>
              <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold", sev.cls)}>
                {sev.label}
              </span>
              <span className="rounded-md bg-panel-2 px-2 py-0.5 text-[11px] font-medium text-secondary">
                {ROLE_LABELS[meta.role]}
              </span>
            </div>
            <h1 className="mt-0.5 truncate text-h2 text-white">{scenario.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {times && <IncidentClock startedAt={times.startedAt} endedAt={times.endedAt} />}
          {!ended ? (
            <Button variant="secondary" onClick={endDrill} className="gap-2">
              <PhoneOff className="h-4 w-4" /> End drill
            </Button>
          ) : (
            <Link href={`/debrief/${sessionId}`}>
              <Button className="gap-2">
                View debrief <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* ── Console: transcript + live HUD, equal-height ───── */}
      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
        {/* Transcript / call console */}
        <section
          className="relative flex h-[62vh] min-h-0 flex-col overflow-hidden rounded-2xl border border-panel-line bg-panel lg:h-full"
          style={{ animation: "redline-fade-up 0.45s ease-out both", animationDelay: "0.05s" }}
        >
          {/* Call header — who you're on the line with + live status */}
          <div className="flex items-center justify-between gap-3 border-b border-panel-line px-5 py-3.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-panel-2 text-violet-300">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-body-strong text-white">{scenario.persona.name}</p>
                <p className="truncate text-label capitalize text-muted">{personaRole}</p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                ended ? "border-panel-line text-muted" : "border-emerald-500/40 text-emerald-300",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  ended ? "bg-muted" : "bg-emerald-400 animate-pulse",
                )}
              />
              {ended ? "Call ended" : "On the line"}
            </span>
          </div>

          {/* Scrollback — conversation kept in a readable centred column */}
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-5 py-6 sm:px-6">
              <Transcript
                lines={lines}
                personaName={scenario.persona.name}
                personaIcon={Icon}
                thinking={!ended && mic === "thinking"}
              />
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-panel-line bg-ink-2/40 px-5 py-5">
            <div className="mx-auto w-full max-w-3xl">
              {notice && <p className="mb-3 text-center text-label text-rose-400">{notice}</p>}
              <MicButton state={ended ? "ended" : mic} onToggle={toggleMic} />
            </div>
          </div>
        </section>

        <div
          className="flex min-h-0 flex-col"
          style={{ animation: "redline-fade-up 0.45s ease-out both", animationDelay: "0.1s" }}
        >
          <DrillHud scenario={scenario} state={state} turns={turns} trend={trend} />
        </div>
      </div>
    </div>
  );
}
