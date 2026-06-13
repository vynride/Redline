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
  security_alert: "Contain first, explain later, under scrutiny.",
  support_escalation: "An angry customer who feels ignored.",
  broken_release: "A bad ship in the wild, leadership watching.",
  latency_spike: "Slow, not down, and the cause is hiding.",
};

// Acronyms that must stay fully uppercase when we humanize a snake_case role.
const ACRONYMS = new Set([
  "vp", "svp", "evp", "cto", "ceo", "cio", "ciso", "coo", "pm", "tpm", "em",
  "sre", "it", "qa", "ux", "ui", "api", "db", "dba", "dns", "sso", "ci", "cd",
  "oom", "soc", "noc", "vip", "pr", "hr", "saas", "ml", "ai", "ops", "sec",
]);

/**
 * Turn a snake_case role (e.g. "vp_engineering", "sso_vendor_lead") into a clean,
 * human label with correct casing, acronyms uppercased, other words title-cased.
 */
export function humanizeRole(role: string): string {
  return role
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) =>
      ACRONYMS.has(w.toLowerCase())
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(" ");
}
