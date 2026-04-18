import mongoose, { Schema, type Types } from 'mongoose';

export const UserAccountType = ['user', 'company'] as const;
export type UserAccountTypeType = (typeof UserAccountType)[number];

export type UserDoc = {
  fullName: string;
  phone: string;
  age: number;
  /** Defaults to `user` when missing (legacy documents). */
  accountType?: UserAccountTypeType;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
};

const UserSchema = new Schema<UserDoc>(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    phone: { type: String, required: true, trim: true, minlength: 6, maxlength: 32, unique: true, index: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    accountType: { type: String, enum: UserAccountType, default: 'user', index: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDoc>) ?? mongoose.model<UserDoc>('User', UserSchema);

