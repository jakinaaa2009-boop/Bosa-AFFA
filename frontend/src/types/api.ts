export type ParticipantType = 'user' | 'company';

export type Winner = {
  _id?: string;
  receiptNumber?: string;
  companyName?: string;
  participantType?: ParticipantType;
  /** Primary label for draw UI (receipt # or company name). */
  displayLabel?: string;
  winnerName: string;
  phone: string;
  productName: string;
  prizeName: string;
  drawDate: string | Date;
};

export type Submission = {
  _id?: string;
  fullName: string;
  phone: string;
  email?: string;
  productName: string;
  participantType?: ParticipantType;
  receiptNumber?: string;
  companyName?: string;
  amount: number;
  receiptImage: string;
  status: 'pending' | 'approved' | 'rejected';
  /** Admin-set lottery tickets when approved (= product quantity on receipt). */
  chances?: number | null;
  approvedAt?: string | null;
  createdAt?: string;
};
