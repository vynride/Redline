// Hands-on lab for the "Cascading OOM Kills" drill (scenario prod-outage-memory-leak).
//
// A deterministic, in-browser kubectl simulator. The cluster is eating itself:
// a deploy ~3h ago introduced a per-request memory leak, pods slowly bloat and
// get OOM-killed, and each death concentrates load onto the survivors — a
// thundering-herd cascade. The lesson, straight from the scenario's hidden_facts:
//
//   1. It's a leak, not raw overload (slow bloat under sustained load).
//   2. Break the cascade by SHEDDING / rate-limiting load so survivors stabilize.
//   3. The real fix is to ROLL BACK the leaky deploy — not just raise the limit.
//   4. Raising the memory limit only buys minutes; it is a trap, not a fix.
//
// Winning requires both: shed the load AND roll back the leak.

import type { ClusterState, CommandResult, Lab, Pod, RunbookStep, TermLine } from "./types";

const NS = "api";
const DEPLOY = "api";
const RS = "api-7f9c8d";
const HEALTHY_MI = 320;

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const pad = (s: string | number, n: number) => String(s).padEnd(n);

function initialState(): ClusterState {
  const pods: Pod[] = [
    { name: `${RS}-2xk9p`, status: "OOMKilled", restarts: 14, memUsedMi: 511 },
    { name: `${RS}-bq4mt`, status: "CrashLoopBackOff", restarts: 11, memUsedMi: 498 },
    { name: `${RS}-h8rzv`, status: "Running", restarts: 3, memUsedMi: 472 },
    { name: `${RS}-k2wln`, status: "OOMKilled", restarts: 9, memUsedMi: 506 },
    { name: `${RS}-pm6xs`, status: "Running", restarts: 2, memUsedMi: 458 },
    { name: `${RS}-tz3dc`, status: "CrashLoopBackOff", restarts: 16, memUsedMi: 512 },
  ];
  return {
    pods,
    memLimitMi: 512,
    replicasDesired: 6,
    leakPresent: true,
    loadShed: false,
    scaledOut: false,
    severity: 8,
    tick: 0,
    flags: { sawOOM: false, sawBloat: false, foundLeakDeploy: false },
    status: "active",
  };
}

function clone(s: ClusterState): ClusterState {
  return {
    ...s,
    pods: s.pods.map((p) => ({ ...p })),
    flags: { ...s.flags },
  };
}

const readyCount = (s: ClusterState) => s.pods.filter((p) => p.status === "Running").length;

// ── Cluster evolution: one tick of simulated time per real command ──────────

function worsenPods(s: ClusterState) {
  for (const p of s.pods) {
    if (p.status === "Running") {
      p.memUsedMi = Math.min(s.memLimitMi, p.memUsedMi + 18); // the leak bloats live pods
      if (p.memUsedMi >= s.memLimitMi - 2) {
        p.status = "OOMKilled";
        p.restarts += 1;
        p.memUsedMi = s.memLimitMi;
      }
    } else if (p.restarts < 99) {
      p.restarts += 1; // crashing pods keep flapping
    }
  }
}

function holdPods(s: ClusterState) {
  // Load is shed: survivors stop climbing toward the limit and hold the line.
  for (const p of s.pods) {
    if (p.status === "Running") p.memUsedMi = Math.max(HEALTHY_MI + 60, p.memUsedMi - 6);
  }
}

function recoverOnePod(s: ClusterState) {
  // Leak rolled back: pods come back healthy, one per tick.
  const sick = s.pods.find((p) => p.status !== "Running");
  if (sick) {
    sick.status = "Running";
    sick.memUsedMi = HEALTHY_MI;
  }
  for (const p of s.pods) {
    if (p.status === "Running" && p.memUsedMi > HEALTHY_MI) {
      p.memUsedMi = Math.max(HEALTHY_MI, p.memUsedMi - 40);
    }
  }
}

function advance(s: ClusterState) {
  if (s.status !== "active") return;
  s.tick += 1;

  if (!s.leakPresent) {
    // Recovering. Fast once load is also shed; slow and stuck otherwise — the
    // restarting pods get hammered by the herd on startup and won't fully settle.
    const rate = s.loadShed ? 2.4 : 1.0;
    s.severity = round1(Math.max(0, s.severity - rate));
    if (!s.loadShed) s.severity = Math.max(s.severity, 3.3);
    recoverOnePod(s);
  } else if (s.loadShed) {
    s.severity = round1(Math.max(3.2, s.severity - 0.15)); // stabilized, leak still live
    holdPods(s);
  } else {
    s.severity = round1(Math.min(10, s.severity + 0.35)); // cascade accelerating
    worsenPods(s);
  }

  if (s.severity >= 10) {
    s.severity = 10;
    s.status = "lost";
  } else if (s.loadShed && !s.leakPresent && s.severity < 3) {
    s.status = "won";
  }
}

// ── Command output renderers ────────────────────────────────────────────────

function renderGetPods(s: ClusterState): TermLine[] {
  const lines: TermLine[] = [];
  lines.push({ text: pad("NAME", 22) + pad("READY", 7) + pad("STATUS", 19) + pad("RESTARTS", 10) + "AGE", tone: "sys" });
  for (const p of s.pods) {
    const ready = p.status === "Running" ? "1/1" : "0/1";
    const tone = p.status === "Running" ? "ok" : "err";
    lines.push({
      text: pad(p.name, 22) + pad(ready, 7) + pad(p.status, 19) + pad(p.restarts, 10) + "3h",
      tone,
    });
  }
  const dead = s.pods.filter((p) => p.status !== "Running").length;
  if (dead > 0) {
    lines.push({ text: `${dead}/${s.pods.length} pods not serving traffic.`, tone: "warn" });
  }
  return lines;
}

function renderDescribe(s: ClusterState, podArg?: string): TermLine[] {
  const pod =
    s.pods.find((p) => p.name === podArg || p.name.endsWith(podArg ?? "")) ??
    s.pods.find((p) => p.status !== "Running") ??
    s.pods[0];
  return [
    { text: `Name:         ${pod.name}`, tone: "out" },
    { text: `Namespace:    ${NS}`, tone: "out" },
    { text: `Containers:`, tone: "out" },
    { text: `  api:`, tone: "out" },
    { text: `    State:          Waiting`, tone: "out" },
    { text: `      Reason:       CrashLoopBackOff`, tone: "err" },
    { text: `    Last State:     Terminated`, tone: "out" },
    { text: `      Reason:       OOMKilled`, tone: "err" },
    { text: `      Exit Code:    137`, tone: "err" },
    { text: `    Restart Count:  ${pod.restarts}`, tone: "out" },
    { text: `    Limits:`, tone: "out" },
    { text: `      memory:       ${s.memLimitMi}Mi`, tone: "out" },
    { text: `    Requests:`, tone: "out" },
    { text: `      memory:       256Mi`, tone: "out" },
    { text: `Events:`, tone: "out" },
    { text: `  Warning  OOMKilling   container api exceeded memory limit (${s.memLimitMi}Mi)`, tone: "warn" },
    { text: `  Warning  BackOff      Back-off restarting failed container`, tone: "warn" },
  ];
}

function renderTop(s: ClusterState): TermLine[] {
  const lines: TermLine[] = [];
  lines.push({ text: pad("NAME", 22) + pad("CPU(cores)", 12) + "MEMORY(bytes)", tone: "sys" });
  for (const p of s.pods) {
    const pct = Math.round((p.memUsedMi / s.memLimitMi) * 100);
    const tone = pct >= 90 ? "err" : pct >= 75 ? "warn" : "ok";
    lines.push({
      text: pad(p.name, 22) + pad("840m", 12) + `${p.memUsedMi}Mi (${pct}% of limit)`,
      tone,
    });
  }
  lines.push({
    text: "Memory has been climbing steadily for hours under steady CPU — classic slow-bloat, not a traffic spike.",
    tone: "warn",
  });
  return lines;
}

function renderRolloutHistory(): TermLine[] {
  return [
    { text: `deployment.apps/${DEPLOY}`, tone: "out" },
    { text: pad("REVISION", 12) + "CHANGE-CAUSE", tone: "sys" },
    { text: pad("3", 12) + "scale api to 6 replicas (2 days ago)", tone: "out" },
    { text: pad("4", 12) + "bump base image (1 day ago)", tone: "out" },
    { text: pad("5", 12) + "deploy api v2.7.0 — request-cache refactor (3h ago)", tone: "warn" },
    { text: "Revision 5 went out ~3h ago, right when memory started climbing. Prime suspect for the leak.", tone: "warn" },
  ];
}

function renderGetDeploy(s: ClusterState): TermLine[] {
  const ready = readyCount(s);
  return [
    { text: pad("NAME", 10) + pad("READY", 9) + pad("UP-TO-DATE", 12) + pad("AVAILABLE", 11) + "AGE", tone: "sys" },
    {
      text: pad(DEPLOY, 10) + pad(`${ready}/${s.replicasDesired}`, 9) + pad(String(s.replicasDesired), 12) + pad(String(ready), 11) + "240d",
      tone: ready < s.replicasDesired ? "err" : "ok",
    },
    { text: `Image: registry.internal/api:v2.7.0  (rolled out 3h ago)`, tone: "out" },
  ];
}

function renderGetHpa(s: ClusterState): TermLine[] {
  return [
    { text: pad("NAME", 8) + pad("REFERENCE", 18) + pad("TARGETS", 16) + pad("MINPODS", 9) + pad("MAXPODS", 9) + "REPLICAS", tone: "sys" },
    {
      text: pad(DEPLOY, 8) + pad(`Deployment/${DEPLOY}`, 18) + pad("cpu: 61%/70%", 16) + pad("3", 9) + pad("6", 9) + String(s.replicasDesired),
      tone: "warn",
    },
    { text: "HPA is already at MAXPODS (6) and CPU is under target — scaling out alone won't save you.", tone: "warn" },
  ];
}

// ── Parsing helpers ─────────────────────────────────────────────────────────

/** Strip namespace flags and collapse whitespace so matching is forgiving. */
function normalize(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s-n(=|\s)\S+/g, "")
    .replace(/\s--namespace(=|\s)\S+/g, "");
}

const HELP_LINES: TermLine[] = [
  { text: "Simulated kubectl — investigate the cluster, then stop the cascade.", tone: "sys" },
  { text: "  kubectl get pods                 list the api pods and their status", tone: "out" },
  { text: "  kubectl describe pod <name>      why a pod died (look at Last State)", tone: "out" },
  { text: "  kubectl top pods                 live memory per pod", tone: "out" },
  { text: "  kubectl get deployment api       deployment health", tone: "out" },
  { text: "  kubectl rollout history deployment/api    recent deploys", tone: "out" },
  { text: "  kubectl get hpa                  autoscaler state", tone: "out" },
  { text: "  kubectl annotate ingress api nginx.ingress.kubernetes.io/limit-rps=50 --overwrite", tone: "out" },
  { text: "                                   rate-limit / shed load to break the cascade", tone: "out" },
  { text: "  kubectl rollout undo deployment/api        roll back the leaky deploy", tone: "out" },
  { text: "  kubectl set resources deployment/api --limits=memory=1Gi", tone: "out" },
  { text: "  kubectl scale deployment/api --replicas=N", tone: "out" },
  { text: "  hint · status · clear · reset", tone: "sys" },
];

// ── Command dispatch ────────────────────────────────────────────────────────

const cmd = (text: string): TermLine => ({ text: `$ ${text}`, tone: "cmd" });

function run(state: ClusterState, input: string): CommandResult {
  const raw = input.trim();
  if (!raw) return { state, lines: [] };

  const norm = normalize(raw);
  const lower = norm.toLowerCase();
  const echo = cmd(raw);

  // ── Meta commands: never advance the simulation clock ──
  if (lower === "clear") return { state, lines: [], clear: true };
  if (lower === "reset") {
    return { state: initialState(), lines: [{ text: "Sandbox reset. Re-provisioning cluster…", tone: "sys" }] };
  }
  if (lower === "help" || lower === "?") return { state, lines: [echo, ...HELP_LINES] };
  if (lower === "status") return { state, lines: [echo, ...statusLines(state)] };
  if (lower === "hint") return { state, lines: [echo, hintLine(state)] };

  // After the incident has resolved one way or the other, the cluster is frozen.
  if (state.status !== "active") {
    return {
      state,
      lines: [echo, { text: `Sandbox is ${state.status}. Type "reset" to run it again.`, tone: "sys" }],
    };
  }

  if (!lower.startsWith("kubectl")) {
    return { state, lines: [echo, { text: `command not found: ${raw.split(" ")[0]} — type "help".`, tone: "err" }] };
  }

  const s = clone(state);
  let body: TermLine[] = [];
  let recognized = true;

  if (/^kubectl get (pods|po)\b/.test(lower)) {
    s.flags.sawOOM = true;
    advance(s);
    body = renderGetPods(s);
  } else if (/^kubectl describe pod/.test(lower)) {
    s.flags.sawOOM = true;
    advance(s);
    const arg = norm.split(" ")[3];
    body = renderDescribe(s, arg);
  } else if (/^kubectl top (pods|po)\b/.test(lower)) {
    s.flags.sawBloat = true;
    advance(s);
    body = renderTop(s);
  } else if (/^kubectl rollout history/.test(lower)) {
    s.flags.foundLeakDeploy = true;
    advance(s);
    body = renderRolloutHistory();
  } else if (/^kubectl get deploy/.test(lower)) {
    advance(s);
    body = renderGetDeploy(s);
  } else if (/^kubectl get hpa/.test(lower)) {
    advance(s);
    body = renderGetHpa(s);
  } else if (/^kubectl rollout undo/.test(lower)) {
    if (s.leakPresent) {
      s.leakPresent = false;
      body.push({ text: `deployment.apps/${DEPLOY} rolled back to revision 4`, tone: "ok" });
      body.push({ text: "Leaky v2.7.0 withdrawn. New pods start clean — no more bloat.", tone: "ok" });
      if (!s.loadShed) {
        body.push({
          text: "But the herd is still hammering pods as they restart — they keep crashlooping on boot. Shed load to let them settle.",
          tone: "warn",
        });
      }
    } else {
      body.push({ text: "Already on the previous revision. The leak is gone.", tone: "sys" });
    }
    advance(s);
  } else if (isLoadShed(lower)) {
    if (!s.loadShed) {
      s.loadShed = true;
      s.severity = round1(Math.max(0, s.severity - 0.5));
      body.push({ text: "ingress.networking.k8s.io/api annotated", tone: "ok" });
      body.push({ text: "Rate limit applied — excess traffic shed. The thundering herd breaks; survivors stop dying.", tone: "ok" });
      if (s.leakPresent) {
        body.push({ text: "The cascade is halted, but the leak is still live. Roll back the bad deploy to actually recover.", tone: "warn" });
      }
    } else {
      body.push({ text: "Load is already being shed.", tone: "sys" });
    }
    advance(s);
  } else if (/^kubectl set resources/.test(lower)) {
    const m = lower.match(/memory=(\d+)\s*(gi|mi)?/);
    if (m) {
      const val = parseInt(m[1], 10);
      s.memLimitMi = (m[2] === "gi" ? val * 1024 : m[2] === "mi" ? val : val >= 64 ? val : val * 1024);
    }
    s.severity = round1(Math.max(0, s.severity - 1.5)); // brief relief
    body.push({ text: `deployment.apps/${DEPLOY} resource limits updated (memory=${s.memLimitMi}Mi)`, tone: "out" });
    body.push({ text: "Headroom buys a few minutes — but pods keep bloating and will OOM again. This delays the cascade, it doesn't break it.", tone: "warn" });
    advance(s);
  } else if (/^kubectl scale/.test(lower)) {
    const m = lower.match(/replicas=(\d+)/);
    const n = m ? parseInt(m[1], 10) : s.replicasDesired;
    s.replicasDesired = n;
    s.scaledOut = n > 6;
    s.severity = round1(Math.max(0, s.severity - 0.8));
    body.push({ text: `deployment.apps/${DEPLOY} scaled to ${n} replicas`, tone: "out" });
    body.push({ text: "More pods spread the load a little — but every new pod inherits the same leak and starts bloating too.", tone: "warn" });
    advance(s);
  } else if (/^kubectl rollout status/.test(lower)) {
    advance(s);
    body.push({
      text: s.leakPresent
        ? `Waiting for deployment "${DEPLOY}" rollout to finish: ${readyCount(s)} of ${s.replicasDesired} updated replicas are available...`
        : `deployment "${DEPLOY}" successfully rolled out`,
      tone: s.leakPresent ? "warn" : "ok",
    });
  } else {
    recognized = false;
  }

  if (!recognized) {
    return { state, lines: [echo, { text: `Unrecognized kubectl command. Type "help" for the available verbs.`, tone: "err" }] };
  }

  const out: TermLine[] = [echo, ...body];
  if (s.status === "won") out.push(...wonLines());
  else if (s.status === "lost") out.push(...lostLines());
  return { state: s, lines: out };
}

// A load-shed move: rate-limit the ingress, apply a rate-limit manifest, or
// scale a non-api workload down to free capacity / drop traffic.
function isLoadShed(lower: string): boolean {
  if (/^kubectl annotate ingress/.test(lower) && /(limit-rps|limit-connections|limit-rpm)/.test(lower)) return true;
  if (/^kubectl apply/.test(lower) && /(ratelimit|rate-limit|throttle)/.test(lower)) return true;
  const scale = lower.match(/^kubectl scale (?:deployment\/|deployment )?(\w[\w-]*)\b.*replicas=(\d+)/);
  if (scale && scale[1] !== "api" && parseInt(scale[2], 10) === 0) return true;
  return false;
}

function statusLines(s: ClusterState): TermLine[] {
  return [
    { text: `severity      ${s.severity.toFixed(1)} / 10   (target < 3, total outage at 10)`, tone: s.severity >= 7 ? "err" : s.severity >= 3 ? "warn" : "ok" },
    { text: `pods serving  ${readyCount(s)} / ${s.pods.length}`, tone: "out" },
    { text: `memory limit  ${s.memLimitMi}Mi`, tone: "out" },
    { text: `leaky deploy  ${s.leakPresent ? "LIVE (v2.7.0)" : "rolled back"}`, tone: s.leakPresent ? "err" : "ok" },
    { text: `load shed     ${s.loadShed ? "yes (rate-limited)" : "no"}`, tone: s.loadShed ? "ok" : "warn" },
  ];
}

function hintLine(s: ClusterState): TermLine {
  const next = oomCascadeLab.runbook.find((step) => !step.done(s));
  if (!next) return { text: "All steps complete. Verify with `kubectl get pods`.", tone: "ok" };
  return { text: `Next: ${next.title} →  ${next.commands.join("   ")}`, tone: "sys" };
}

function wonLines(): TermLine[] {
  return [
    { text: "", tone: "out" },
    { text: "✔ CASCADE BROKEN. Load shed, leaky deploy rolled back, pods are serving again.", tone: "ok" },
    { text: "Two-step save: stopped the bleed (rate-limit), then stopped the leak (rollback).", tone: "ok" },
  ];
}

function lostLines(): TermLine[] {
  return [
    { text: "", tone: "out" },
    { text: "✗ TOTAL OUTAGE. The last pods OOM-killed — the API tier is dark.", tone: "err" },
    { text: "The cascade outran you. Next time shed load early to stop the bleed, then roll back. Type \"reset\".", tone: "err" },
  ];
}

// ── Runbook (drives the side checklist; mirrors the scenario objectives) ──────

const runbook: RunbookStep[] = [
  {
    id: "triage",
    title: "Triage the blast radius",
    detail: "See how many pods are down and confirm they're being OOM-killed.",
    commands: ["kubectl get pods -n api", "kubectl describe pod <name>"],
    done: (s) => s.flags.sawOOM,
  },
  {
    id: "diagnose",
    title: "Leak or overload?",
    detail:
      "Two signals together make the call: memory slow-bloating under steady CPU (top), and a deploy ~3h ago (rollout history). Both point to a leak, not a traffic spike.",
    commands: ["kubectl top pods -n api", "kubectl rollout history deployment/api"],
    done: (s) => s.flags.sawBloat && s.flags.foundLeakDeploy,
  },
  {
    id: "shed",
    title: "Break the cascade",
    detail: "Shed / rate-limit traffic so the surviving pods stop getting hammered and stabilize.",
    commands: ["kubectl annotate ingress api nginx.ingress.kubernetes.io/limit-rps=50 --overwrite"],
    done: (s) => s.loadShed,
  },
  {
    id: "rollback",
    title: "Stop the leak",
    detail: "Roll back the leaky deploy — the real fix. Raising the memory limit only buys minutes.",
    commands: ["kubectl rollout undo deployment/api"],
    done: (s) => !s.leakPresent,
  },
  {
    id: "verify",
    title: "Verify recovery",
    detail: "Re-check the pods a couple of times — once they're back to Running and severity drops below 3, the cluster is stable.",
    commands: ["kubectl get pods -n api"],
    done: (s) => s.status === "won",
  },
];

export const oomCascadeLab: Lab = {
  id: "prod-outage-memory-leak",
  title: "Cascading OOM Kills",
  subtitle: "Break the cascade before the API tier goes dark.",
  instanceId: "api-prod-x7f2",
  runbook,
  initialState,
  run,
};
