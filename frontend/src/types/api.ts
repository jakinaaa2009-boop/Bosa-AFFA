export type Winner = {
  _id?: string;
  receiptNumber?: string;
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
  receiptNumber: string;
  amount: number;
  receiptImage: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string | null;
  createdAt?: string;
};

