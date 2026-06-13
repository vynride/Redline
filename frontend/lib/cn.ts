/** Tiny className joiner — keeps conditional class composition tidy. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
