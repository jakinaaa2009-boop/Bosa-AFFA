/** Label used in weighted draw pool / wheel (receipt # for users, company name for companies). */
export function submissionPoolLabel(s: {
  participantType?: string | null;
  receiptNumber?: string | null;
  companyName?: string | null;
  fullName?: string;
}): string {
  const pt = s.participantType ?? 'user';
  if (pt === 'company') {
    const n = (s.companyName || s.fullName || '').trim();
    return n || 'Компани';
  }
  return (s.receiptNumber || '').trim() || '';
}
