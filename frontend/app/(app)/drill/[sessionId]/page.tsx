"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MicButton, type MicState } from "@/components/drill/MicButton";
import { Transcript, type TranscriptLine } from "@/components/drill/Transcript";
import { Button, Card, StatBlock, StatusPill } from "@/components/ui";
import { api } from "@/lib/api";
import { MicCapture, PcmPlayer } from "@/lib/audio";
import { DrillSocket } from "@/lib/ws";
import type { Scenario, SessionState } from "@shared/types";

export default function DrillPage() {
  const sessionId = String(useParams().sessionId);

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [state, setState] = useState<SessionState | null>(null);
  const [mic, setMic] = useState<MicState>("ready");
  const [ended, setEnded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<DrillSocket | null>(null);
  const captureRef = useRef<MicCapture | null>(null);
  const playerRef = useRef<PcmPlayer | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load session + scenario, seed the transcript, then open the socket.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await api.getSession(sessionId);
        const sc = await api.getScenario(session.scenario_id);
        if (cancelled) return;
        setScenario(sc);
        setLines(session.turns.map((t) => ({ role: t.speaker, text: t.text, emotion: t.emotion as never })));
        setState({
          severity: session.severity, severity_start: session.severity_start, confidence: session.confidence,
          objectives_met: session.objectives_met, escalation_timeline: session.escalation_timeline, status: session.status,
        });
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
            setState(msg.state);
            if (msg.state.status !== "active") setEnded(true);
          } else if (msg.type === "turn_complete") {
            setMic((m) => (m === "ended" ? m : "ready"));
          } else if (msg.type === "session_complete") {
            setEnded(true);
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
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

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

  if (error) return <p className="text-body text-negative">{error}</p>;
  if (!scenario || !state) return <p className="text-body text-secondary">Loading drill…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">{scenario.title}</h1>
          <p className="text-body text-secondary">
            You are facing {scenario.persona.name} · {scenario.persona.role.replace(/_/g, " ")}
          </p>
        </div>
        {!ended ? (
          <Button variant="secondary" onClick={endDrill}>End drill</Button>
        ) : (
          <Link href={`/debrief/${sessionId}`}>
            <Button>View debrief</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="flex h-[60vh] flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2">
            <Transcript lines={lines} personaName={scenario.persona.name} />
          </div>
          <div className="mt-4 border-t border-line pt-4">
            {notice && <p className="mb-3 text-center text-label text-negative">{notice}</p>}
            <MicButton state={ended ? "ended" : mic} onToggle={toggleMic} />
          </div>
        </Card>

        <Card widget className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-label text-secondary">Status</span>
            <StatusPill tone={state.status === "active" ? "positive" : "neutral"}>{state.status}</StatusPill>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatBlock label="Severity" value={`${state.severity}/${scenario.severity.max}`}
                       tone={state.severity >= scenario.severity.lose_at - 1 ? "negative" : "default"} mono />
            <StatBlock label="Confidence" value={`${state.confidence}%`} mono
                       tone={state.confidence >= 60 ? "positive" : "default"} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-label text-secondary">Objectives</span>
            {scenario.objectives.map((o) => {
              const met = state.objectives_met.includes(o);
              return (
                <div key={o} className="flex items-start gap-2 text-body">
                  <span className={met ? "text-positive" : "text-muted"}>{met ? "✓" : "○"}</span>
                  <span className={met ? "text-primary" : "text-secondary"}>{o}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
