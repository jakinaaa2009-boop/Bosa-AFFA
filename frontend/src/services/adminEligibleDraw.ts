import { api } from './api';
import { withAdminAuth } from './admin';

export type EligibleDrawItem = { id: string; receiptNumber: string };

export async function fetchEligibleDraw(input: { startDate: string; endDate: string }) {
  const res = await api.get<{ items: EligibleDrawItem[]; count: number }>('/api/submissions/eligible-draw', {
    headers: withAdminAuth(),
    params: { startDate: input.startDate, endDate: input.endDate }
  });
  return res.data;
}

