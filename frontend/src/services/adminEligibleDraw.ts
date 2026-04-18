import { api } from './api';
import { withAdminAuth } from './admin';
import type { ParticipantType } from '@/types/api';

export type EligibleDrawItem = {
  id?: string;
  _id?: string;
  receiptNumber?: string;
  displayLabel: string;
  participantType?: ParticipantType;
  chances: number;
};

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

