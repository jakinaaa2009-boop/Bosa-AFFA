import mongoose, { Schema, type Types } from 'mongoose';

export type ForcedReceiptDoc = {
  /** Prize this forced receipt applies to (exact admin draw prize name). */
  prizeName: string;
  receiptNumber: string;
  updatedAt: Date;
  createdAt: Date;
  _id: Types.ObjectId;
};

const ForcedReceiptSchema = new Schema<ForcedReceiptDoc>(
  {
    prizeName: { type: String, required: true, trim: true, minlength: 1, maxlength: 160, unique: true, index: true },
    receiptNumber: { type: String, required: true, trim: true, minlength: 0, maxlength: 128 }
  },
  { timestamps: true }
);

ForcedReceiptSchema.index({ updatedAt: -1 });

export const ForcedReceiptModel =
  (mongoose.models.ForcedReceipt as mongoose.Model<ForcedReceiptDoc>) ??
  mongoose.model<ForcedReceiptDoc>('ForcedReceipt', ForcedReceiptSchema);
