// TS mirror of the backend session/turn schemas (app/schemas/session.py, turn.py).
import type { Difficulty, Role } from "./scenario";

export type SessionStatus = "active" | "completed" | "abandoned";
export type Speaker = "user" | "persona";

export interface TurnOut {
  index: number;
  speaker: Speaker;
  text: string;
  emotion: string | null;
  severity_after: number | null;
  confidence_after: number | null;
  evaluation: Record<string, unknown> | null;
  created_at: string;
}

export interface EscalationEvent {
  event: string;
  severity: number;
  turn_index: number;
  at: string;
}

export interface SessionState {
  severity: number;
  severity_start: number;
  confidence: number;
  objectives_met: string[];
  escalation_timeline: EscalationEvent[];
  status: SessionStatus;
}

export interface SessionCreate {
  scenario_id: string;
  role: Role;
  difficulty: Difficulty;
}

export interface SessionOut {
  id: string;
  scenario_id: string;
  role: Role;
  difficulty: Difficulty;
  status: SessionStatus;
  severity: number;
  severity_start: number;
  confidence: number;
  score: number | null;
  objectives_met: string[];
  escalation_timeline: EscalationEvent[];
  created_at: string;
  ended_at: string | null;
}

export interface SessionDetail extends SessionOut {
  turns: TurnOut[];
}

export interface SessionListItem {
  id: string;
  scenario_id: string;
  role: Role;
  difficulty: Difficulty;
  status: SessionStatus;
  score: number | null;
  created_at: string;
  ended_at: string | null;
}
