import { api } from './api';
import type { Winner } from '@/types/api';

export async function fetchWinners(): Promise<Winner[]> {
  const res = await api.get<{ winners: Winner[] }>('/api/winners');
  return res.data.winners ?? [];
}

