// Types for the hands-on incident "labs": a small, deterministic command engine
// that replays realistic terminal output so a user can resolve an outage by
// hand. No real infrastructure is contacted — every effect is computed locally.

/** A single pod in the simulated cluster. */
export interface Pod {
  name: string;
  status: "Running" | "CrashLoopBackOff" | "OOMKilled" | "Terminating" | "Pending";
  restarts: number;
  /** Working-set memory, in MiB. */
  memUsedMi: number;
}

/** Everything the simulation needs to know about the cluster right now. */
export interface ClusterState {
  pods: Pod[];
  /** Per-pod memory limit, in MiB. */
  memLimitMi: number;
  replicasDesired: number;
  /** The leaky deploy is live until it is rolled back. */
  leakPresent: boolean;
  /** Traffic is being shed / rate-limited, breaking the thundering herd. */
  loadShed: boolean;
  /** Whether the user scaled the deployment out. */
  scaledOut: boolean;
  /** 0–10. Starts at 8; win below 3; total outage at 10. */
  severity: number;
  /** Number of time-advancing commands run so far. */
  tick: number;
  /** Diagnosis breadcrumbs, drive the runbook checklist. */
  flags: {
    sawOOM: boolean;
    sawBloat: boolean;
    foundLeakDeploy: boolean;
  };
  status: "active" | "won" | "lost";
}

/** Tone controls the colour a terminal line is rendered in. */
export type LineTone = "out" | "err" | "sys" | "ok" | "warn" | "cmd";

export interface TermLine {
  text: string;
  tone?: LineTone;
}

/** The result of running one command: the next state plus lines to print. */
export interface CommandResult {
  state: ClusterState;
  lines: TermLine[];
  /** Set when the terminal should clear its scrollback (the `clear` command). */
  clear?: boolean;
}

/** One step of the guided runbook shown alongside the terminal. */
export interface RunbookStep {
  id: string;
  title: string;
  detail: string;
  /** The command(s) we suggest for this step. Running all of them completes it. */
  commands: string[];
  /** True once the state shows this step is satisfied. */
  done: (state: ClusterState) => boolean;
}

/** A self-contained hands-on lab for one scenario. */
export interface Lab {
  /** Matches the scenario id it belongs to. */
  id: string;
  title: string;
  subtitle: string;
  /** A faux sandbox instance id shown in the "provisioned by Floci" chrome. */
  instanceId: string;
  runbook: RunbookStep[];
  initialState: () => ClusterState;
  /** Pure: given the current state and a raw input line, return the next state. */
  run: (state: ClusterState, input: string) => CommandResult;
}
