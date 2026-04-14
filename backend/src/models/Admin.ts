import mongoose, { Schema } from 'mongoose';

export type AdminDoc = {
  username: string;
  passwordHash: string;
};

const AdminSchema = new Schema<AdminDoc>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 64 },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export const AdminModel =
  (mongoose.models.Admin as mongoose.Model<AdminDoc>) ?? mongoose.model<AdminDoc>('Admin', AdminSchema);

