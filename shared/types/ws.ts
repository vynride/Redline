// TS mirror of the realtime ws message envelopes (app/schemas/ws.py).
import type { Emotion } from "./scenario";
import type { SessionState } from "./session";

// client -> server
export interface EndTurn {
  type: "end_turn";
}
export interface EndSession {
  type: "end_session";
}
export type ClientMessage = EndTurn | EndSession;

// server -> client (JSON; binary frames carry raw PCM audio)
export interface TranscriptMsg {
  type: "transcript";
  role: "user" | "persona";
  text: string;
  emotion?: Emotion | null;
}
export interface StateMsg {
  type: "state";
  state: SessionState;
}
export interface TurnComplete {
  type: "turn_complete";
  index: number;
}
export interface SessionComplete {
  type: "session_complete";
  debrief_ready: boolean;
}
export interface ErrorMsg {
  type: "error";
  detail: string;
  code?: string | null;
}

export type ServerMessage =
  | TranscriptMsg
  | StateMsg
  | TurnComplete
  | SessionComplete
  | ErrorMsg;
