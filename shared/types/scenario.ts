// TS mirror of the backend scenario schemas (app/schemas/scenario.py, common.py).

export type Archetype =
  | "production_outage"
  | "payment_failure"
  | "security_alert"
  | "support_escalation"
  | "broken_release"
  | "latency_spike";

export type Role =
  | "on_call_engineer"
  | "incident_commander"
  | "support_lead"
  | "customer_support_agent"
  | "ops_responder";

export type Difficulty = "warmup" | "production_like" | "redline";

export type Emotion = "neutral" | "calm" | "confused" | "frustrated" | "angry" | "urgent";

export interface Persona {
  name: string;
  role: string;
  voice_id: string;
  base_emotion: Emotion;
  description: string;
}

export interface SeverityModel {
  start: number;
  max: number;
  win_below: number;
  lose_at: number;
}

export interface Scenario {
  id: string;
  title: string;
  archetype: Archetype;
  summary: string;
  roles: Role[];
  difficulties: Difficulty[];
  persona: Persona;
  stakes: string;
  hidden_facts: string[];
  objectives: string[];
  severity: SeverityModel;
  opening_line: string;
}

export interface ScenarioSummary {
  id: string;
  title: string;
  archetype: Archetype;
  summary: string;
  roles: Role[];
  difficulties: Difficulty[];
  persona_role: string;
}
