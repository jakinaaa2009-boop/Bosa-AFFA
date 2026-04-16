import mongoose, { Schema, type Types } from 'mongoose';

export type ForcedReceiptDoc = {
  receiptNumber: string;
  updatedAt: Date;
  createdAt: Date;
  _id: Types.ObjectId;
};

const ForcedReceiptSchema = new Schema<ForcedReceiptDoc>(
  {
    receiptNumber: { type: String, required: true, trim: true, minlength: 0, maxlength: 128 }
  },
  { timestamps: true }
);

ForcedReceiptSchema.index({ updatedAt: -1 });

export const ForcedReceiptModel =
  (mongoose.models.ForcedReceipt as mongoose.Model<ForcedReceiptDoc>) ??
  mongoose.model<ForcedReceiptDoc>('ForcedReceipt', ForcedReceiptSchema);

