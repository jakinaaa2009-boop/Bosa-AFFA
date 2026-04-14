import { api } from './api';
import { userAuthHeaders } from './userSession';

export type CreateSubmissionInput = {
  productName: string;
  receiptNumber: string;
  amount: number;
  receiptFile: File;
};

export async function createSubmission(input: CreateSubmissionInput) {
  const fd = new FormData();
  fd.append('productName', input.productName);
  fd.append('receiptNumber', input.receiptNumber);
  fd.append('amount', String(input.amount));
  fd.append('receiptImage', input.receiptFile);

  const res = await api.post('/api/submissions/me', fd, {
    headers: { ...userAuthHeaders(), 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function fetchMySubmissions() {
  const res = await api.get<{ items: import('@/types/api').Submission[] }>('/api/submissions/me', {
    headers: userAuthHeaders()
  });
  return res.data.items ?? [];
}

