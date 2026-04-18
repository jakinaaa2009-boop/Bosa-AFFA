/**
 * Lottery weight per approved submission.
 * - Legacy docs without `chances`: treat as 1 (old "1 receipt = 1 ticket" behavior).
 * - New flow: admin sets integer >= 1 when approving (= product count / tickets).
 */
export function effectiveDrawChances(sub: { chances?: number | null }): number {
  const c = sub.chances;
  if (c === undefined || c === null) return 1;
  if (!Number.isFinite(c)) return 0;
  const n = Math.floor(Number(c));
  if (n < 1) return 0;
  return Math.min(n, 10_000);
}
