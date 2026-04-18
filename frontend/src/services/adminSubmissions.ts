import { api } from './api';
import { withAdminAuth } from './admin';
import type { Submission } from '@/types/api';

export async function fetchSubmissions(params: {
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
  page?: number;
  limit?: number;
}) {
  const res = await api.get<{
    items: Submission[];
    page: number;
    limit: number;
    total: number;
  }>('/api/submissions', { params, headers: withAdminAuth() });
  return res.data;
}

export async function setSubmissionStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  chances?: number
) {
  const body: { status: typeof status; chances?: number } = { status };
  if (status === 'approved' && chances !== undefined) body.chances = chances;
  const res = await api.patch<{ submission: Submission }>(
    `/api/submissions/${id}/status`,
    body,
    { headers: withAdminAuth() }
  );
  return res.data.submission;
}

export async function deleteSubmissionById(id: string) {
  await api.delete(`/api/submissions/${id}`, { headers: withAdminAuth() });
}

