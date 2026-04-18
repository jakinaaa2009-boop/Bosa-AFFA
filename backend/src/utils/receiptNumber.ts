/** Canonical form for receipt numbers: trim + uppercase (case-insensitive uniqueness). */
export function normalizeReceiptNumber(value: string) {
  return value.trim().toUpperCase();
}
