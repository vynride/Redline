import { API_BASE } from "./config";
import { getToken } from "./storage";
import { deepClean } from "./text";
import type {
  DebriefOut,
  Scenario,
  ScenarioSummary,
  SessionCreate,
  SessionDetail,
  SessionListItem,
  SessionOut,
} from "@shared/types";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
  if (init?.body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const resp = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (resp.status === 204) return undefined as T;
  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    throw new ApiError(resp.status, (data && data.detail) || resp.statusText);
  }
  // Strip em dashes from every string before it reaches the UI.
  return deepClean(data as T);
}

export const api = {
  listScenarios: () => request<ScenarioSummary[]>("/api/scenarios"),
  getScenario: (id: string) => request<Scenario>(`/api/scenarios/${id}`),
  generateScenario: (prompt: string) =>
    request<Scenario>("/api/generated-scenarios", { method: "POST", body: JSON.stringify({ prompt }) }),
  createSession: (body: SessionCreate) =>
    request<SessionOut>("/api/sessions", { method: "POST", body: JSON.stringify(body) }),
  listSessions: () => request<SessionListItem[]>("/api/sessions"),
  getSession: (id: string) => request<SessionDetail>(`/api/sessions/${id}`),
  getDebrief: (id: string) => request<DebriefOut>(`/api/sessions/${id}/debrief`),

  /** Download the debrief as a server-rendered PDF and trigger a browser save. */
  downloadDebriefPdf: async (id: string): Promise<void> => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE}/api/sessions/${id}/debrief.pdf`, { headers });
    if (!resp.ok) {
      const data = await resp.json().catch(() => null);
      throw new ApiError(resp.status, (data && data.detail) || resp.statusText);
    }

    const blob = await resp.blob();
    const match = /filename="?([^";]+)"?/.exec(resp.headers.get("Content-Disposition") ?? "");
    const filename = match?.[1] ?? `redline-debrief-${id}.pdf`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
