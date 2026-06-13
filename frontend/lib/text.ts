/**
 * Strip em dashes from user-facing text. An em dash (and its surrounding spaces)
 * becomes a comma so the prose reads naturally — we never want an em dash, whether
 * it came from an LLM response or static copy, to reach the screen.
 */
export function clean(s: string): string {
  return s.replace(/\s*—\s*/g, ", ");
}

/** Recursively clean every string in a value (API payloads, nested objects/arrays). */
export function deepClean<T>(value: T): T {
  if (typeof value === "string") return clean(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => deepClean(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = deepClean(v);
    return out as T;
  }
  return value;
}
