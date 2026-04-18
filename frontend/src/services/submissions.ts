import { api } from './api';
import { userAuthHeaders } from './userSession';

export type CreateSubmissionInput = {
  productName: string;
  amount: number;
  receiptFile: File;
  participantType: 'user' | 'company';
  receiptNumber?: string;
  companyName?: string;
};

export async function createSubmission(input: CreateSubmissionInput) {
  const fd = new FormData();
  fd.append('productName', input.productName);
  fd.append('amount', String(input.amount));
  fd.append('participantType', input.participantType);
  if (input.participantType === 'user') {
    fd.append('receiptNumber', input.receiptNumber ?? '');
  } else {
    fd.append('companyName', input.companyName ?? '');
  }
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

