/** Exact prize names used by admin draw + force override UI. */
export const FORCEABLE_PRIZES = [
  'Airpod gen 4',
  'ФИФА 2026 тэмцээний Аргентины албан ёсны өмсгөл'
] as const;

export type ForceablePrize = (typeof FORCEABLE_PRIZES)[number];

export function isForceablePrize(name: string): name is ForceablePrize {
  return (FORCEABLE_PRIZES as readonly string[]).includes(name);
}
