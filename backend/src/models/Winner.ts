import mongoose, { Schema, type Types } from 'mongoose';

export type WinnerDoc = {
  winnerName: string;
  phone: string;
  productName: string;
  prizeName: string;
  participantType?: 'user' | 'company';
  receiptNumber?: string;
  companyName?: string;
  drawDate: Date;
  submissionId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
};

const WinnerSchema = new Schema<WinnerDoc>(
  {
    winnerName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    phone: { type: String, required: true, trim: true, minlength: 6, maxlength: 32 },
    productName: { type: String, required: true, trim: true, maxlength: 120 },
    prizeName: { type: String, required: true, trim: true, maxlength: 160 },
    participantType: { type: String, enum: ['user', 'company'], default: 'user', index: true },
    receiptNumber: { type: String, required: false, trim: true, minlength: 5, maxlength: 64, index: true },
    companyName: { type: String, required: false, trim: true, maxlength: 160 },
    drawDate: { type: Date, required: true, default: Date.now },

    // Internal: used to prevent the same submission winning same prize twice
    submissionId: { type: Schema.Types.ObjectId, required: true, index: true }
  },
  { timestamps: true }
);

WinnerSchema.index({ prizeName: 1, submissionId: 1 }, { unique: true });
WinnerSchema.index({ drawDate: -1 });

export const WinnerModel =
  (mongoose.models.Winner as mongoose.Model<WinnerDoc>) ?? mongoose.model<WinnerDoc>('Winner', WinnerSchema);

