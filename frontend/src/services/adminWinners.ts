import { api } from './api';
import { withAdminAuth } from './admin';

export async function deleteWinnerById(id: string) {
  await api.delete(`/api/winners/${id}`, { headers: withAdminAuth() });
}

