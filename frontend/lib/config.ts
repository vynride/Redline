/** Base URL of the Redline backend. Override with NEXT_PUBLIC_API_BASE. */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

/** WebSocket base derived from the API base (http -> ws, https -> wss). */
export const WS_BASE = API_BASE.replace(/^http/, "ws");

export const TOKEN_KEY = "redline.token";
