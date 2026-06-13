import type { Archetype, Difficulty, Role } from "@shared/types";

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  production_outage: "Production outage",
  payment_failure: "Payment failure",
  security_alert: "Security alert",
  support_escalation: "Support escalation",
  broken_release: "Broken release",
  latency_spike: "Latency spike",
};

export const ROLE_LABELS: Record<Role, string> = {
  on_call_engineer: "On-call engineer",
  incident_commander: "Incident commander",
  support_lead: "Support lead",
  customer_support_agent: "Customer support agent",
  ops_responder: "Ops responder",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  warmup: "Warm-up",
  production_like: "Production-like",
  redline: "Redline",
};

export const ARCHETYPE_BLURBS: Record<Archetype, string> = {
  production_outage: "Everything is down and the clock is the enemy.",
  payment_failure: "Money is on the line and trust is bleeding.",
  security_alert: "Contain first, explain later — under scrutiny.",
  support_escalation: "An angry customer who feels ignored.",
  broken_release: "A bad ship in the wild, leadership watching.",
  latency_spike: "Slow, not down — and the cause is hiding.",
};
