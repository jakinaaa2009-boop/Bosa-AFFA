import mongoose, { Schema, type Types } from 'mongoose';

export type UserDoc = {
  fullName: string;
  phone: string;
  age: number;
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
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDoc>) ?? mongoose.model<UserDoc>('User', UserSchema);

