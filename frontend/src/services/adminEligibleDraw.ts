import { api } from './api';
import { withAdminAuth } from './admin';

export type EligibleDrawItem = { id: string; receiptNumber: string; chances: number };

export async function fetchEligibleDraw(input: { startDate: string; endDate: string }) {
  const res = await api.get<{
    items: EligibleDrawItem[];
    /** Total lottery tickets (sum of chances) — weighted pool size */
    count: number;
    /** Distinct approved receipts in range */
    receiptCount?: number;
  }>('/api/submissions/eligible-draw', {
    headers: withAdminAuth(),
    params: { startDate: input.startDate, endDate: input.endDate }
  });
  return res.data;
}

