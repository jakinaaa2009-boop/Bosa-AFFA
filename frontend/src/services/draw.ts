import { api } from './api';
import { withAdminAuth } from './admin';
import type { Winner } from '@/types/api';

export async function spin(prizeName: string, startDate: string, endDate: string) {
  const res = await api.post<{ winner: Winner }>(
    '/api/draw/spin',
    { prizeName, startDate, endDate },
    { headers: withAdminAuth() }
  );
  return res.data;
}

