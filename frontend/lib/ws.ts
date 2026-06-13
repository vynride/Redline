import { WS_BASE } from "./config";
import { getToken } from "./storage";
import type { ClientMessage, ServerMessage } from "@shared/types";

export interface DrillHandlers {
  onMessage: (msg: ServerMessage) => void;
  onAudio: (chunk: ArrayBuffer) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/** Thin wrapper over the drill WebSocket, JSON control in/out, binary audio both ways. */
export class DrillSocket {
  private ws: WebSocket | null = null;

  constructor(private sessionId: string, private handlers: DrillHandlers) {}

  connect(): void {
    const token = getToken() ?? "";
    const ws = new WebSocket(`${WS_BASE}/ws/session/${this.sessionId}?token=${encodeURIComponent(token)}`);
    ws.binaryType = "arraybuffer";
    ws.onmessage = (e: MessageEvent) => {
      if (typeof e.data === "string") {
        this.handlers.onMessage(JSON.parse(e.data) as ServerMessage);
      } else {
        this.handlers.onAudio(e.data as ArrayBuffer);
      }
    };
    ws.onopen = () => this.handlers.onOpen?.();
    ws.onclose = () => this.handlers.onClose?.();
    this.ws = ws;
  }

  sendAudio(buf: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(buf);
  }

  endTurn(): void {
    this.send({ type: "end_turn" });
  }

  endSession(): void {
    this.send({ type: "end_session" });
  }

  private send(msg: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }
}
