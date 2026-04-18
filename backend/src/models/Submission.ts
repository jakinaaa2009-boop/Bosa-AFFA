import mongoose, { Schema, type Types } from 'mongoose';

export const SubmissionStatus = ['pending', 'approved', 'rejected'] as const;
export type SubmissionStatusType = (typeof SubmissionStatus)[number];

export const ParticipantType = ['user', 'company'] as const;
export type ParticipantTypeType = (typeof ParticipantType)[number];

export type SubmissionDoc = {
  fullName: string;
  phone: string;
  email?: string;
  productName: string;
  participantType?: ParticipantTypeType;
  /** eBarimt receipt number (users only). */
  receiptNumber?: string;
  /** Registered company name (companies only). */
  companyName?: string;
  amount: number;
  // R2 storage (preferred)
  receiptImageKey?: string;
  receiptImageUrl?: string;
  // Legacy storage (backward compatibility)
  receiptImageBase64?: string;
  // Backward compatibility (older docs)
  receiptImageData?: Buffer;
  receiptImageMime: string;
  status: SubmissionStatusType;
  /** Admin-assigned lottery tickets (= purchased product count) when approved. */
  chances?: number | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
};

const SubmissionSchema = new Schema<SubmissionDoc>(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    phone: { type: String, required: true, trim: true, minlength: 6, maxlength: 32 },
    email: { type: String, required: false, trim: true, maxlength: 160 },
    productName: { type: String, required: true, trim: true, maxlength: 120 },
    participantType: {
      type: String,
      enum: ParticipantType,
      default: 'user',
      index: true
    },
    receiptNumber: {
      type: String,
      required: false,
      trim: true,
      minlength: 5,
      maxlength: 64
    },
    companyName: { type: String, required: false, trim: true, minlength: 2, maxlength: 160 },
    amount: { type: Number, required: true, min: 0 },
    receiptImageKey: { type: String, required: false, trim: true, maxlength: 512 },
    receiptImageUrl: { type: String, required: false, trim: true, maxlength: 2048 },
    receiptImageBase64: { type: String, required: false },
    receiptImageData: { type: Buffer, required: false },
    receiptImageMime: { type: String, required: true, trim: true, maxlength: 64 },
    status: { type: String, enum: SubmissionStatus, default: 'pending', index: true },
    chances: { type: Number, required: false, default: null },
    approvedAt: { type: Date, required: false, default: null, index: true }
  },
  { timestamps: true }
);

SubmissionSchema.index({ phone: 1, createdAt: -1 });
SubmissionSchema.index({ receiptNumber: 1 }, { unique: true, sparse: true });

export const SubmissionModel =
  (mongoose.models.Submission as mongoose.Model<SubmissionDoc>) ??
  mongoose.model<SubmissionDoc>('Submission', SubmissionSchema);

