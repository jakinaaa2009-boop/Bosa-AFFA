import mongoose, { Schema, type Types } from 'mongoose';

export type ForceAdminDoc = {
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
};

const ForceAdminSchema = new Schema<ForceAdminDoc>(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 64, unique: true, index: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export const ForceAdminModel =
  (mongoose.models.ForceAdmin as mongoose.Model<ForceAdminDoc>) ??
  mongoose.model<ForceAdminDoc>('ForceAdmin', ForceAdminSchema);

