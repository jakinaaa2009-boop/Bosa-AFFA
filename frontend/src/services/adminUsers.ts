import { api } from './api';
import { withAdminAuth } from './admin';

export type AdminUserRow = {
  _id: string;
  phone: string;
  fullName: string;
  age: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  lastSubmittedAt?: string;
};

export async function fetchUsers(params: { search?: string; page?: number; limit?: number }) {
  const res = await api.get<{
    items: AdminUserRow[];
    page: number;
    limit: number;
    total: number;
  }>('/api/users', { params, headers: withAdminAuth() });
  return res.data;
}

export async function deleteUserById(id: string) {
  const res = await api.delete<{ ok: boolean; deletedSubmissions: number; deletedUser: boolean }>(
    `/api/users/${encodeURIComponent(id)}`,
    {
    headers: withAdminAuth()
    }
  );
  return res.data;
}

