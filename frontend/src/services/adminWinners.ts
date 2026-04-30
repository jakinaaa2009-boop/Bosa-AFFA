import { api } from './api';
import { withAdminAuth } from './admin';
import type { Winner } from '@/types/api';

export async function deleteWinnerById(id: string) {
  await api.delete(`/api/winners/${id}`, { headers: withAdminAuth() });
}

export async function updateWinnerPrizeName(id: string, prizeName: string) {
  const res = await api.patch<{ winner: Winner }>(
    `/api/winners/${encodeURIComponent(id)}/prize`,
    { prizeName },
    { headers: withAdminAuth() }
  );
  return res.data.winner;
}

