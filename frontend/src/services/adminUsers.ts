import { api } from './api';
import { withAdminAuth } from './admin';

export type AgeStats = {
  count: number;
  avgAge: number;
  minAge: number;
  maxAge: number;
  under18: number;
  a18_24: number;
  a25_34: number;
  a35_44: number;
  a45plus: number;
};

export type SubmissionStats = {
  count: number;
  avgReceipts: number;
  minReceipts: number;
  maxReceipts: number;
  b0: number;
  b1: number;
  b2_3: number;
  b4_5: number;
  b6_10: number;
  b11plus: number;
};

export type AdminUserRow = {
  _id: string;
  phone: string;
  fullName: string;
  age: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  lastSubmittedAt?: string;
};

export async function fetchUsersStats(params?: { search?: string }) {
  const res = await api.get<{
    ageStats: AgeStats | null;
    submissionStats: SubmissionStats | null;
    topUser: (AdminUserRow & { totalSubmissions: number }) | null;
  }>('/api/users/stats', { params, headers: withAdminAuth() });
  return res.data;
}

export async function fetchUsers(params: { search?: string; page?: number; limit?: number }) {
  const res = await api.get<{
    items: AdminUserRow[];
    page: number;
    limit: number;
    total: number;
    ageStats?: AgeStats | null;
  }>('/api/users', { params, headers: withAdminAuth() });
  return res.data;
}

export async function fetchUserAgeStats() {
  const res = await fetchUsers({ limit: 1 });
  return res.ageStats ?? null;
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

