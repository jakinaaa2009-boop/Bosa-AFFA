import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { UserModel } from '../models/User.js';
import type { AuthRequest } from '../types/express.js';

const RegisterSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(32),
  age: z.coerce.number().int().min(1).max(120),
  password: z.string().min(6).max(128)
});

const LoginSchema = z.object({
  phone: z.string().min(6).max(32),
  password: z.string().min(1)
});

function signUserToken(user: { id: string; phone: string }) {
  return jwt.sign({ phone: user.phone, typ: 'user' }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });
}

export async function registerUser(req: Request, res: Response) {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const exists = await UserModel.findOne({ phone: parsed.data.phone }).lean();
  if (exists) return res.status(409).json({ message: 'Phone already registered' });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await UserModel.create({
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    age: parsed.data.age,
    passwordHash
  });

  const token = signUserToken({ id: user._id.toString(), phone: user.phone });
  return res.status(201).json({
    token,
    user: { id: user._id.toString(), fullName: user.fullName, phone: user.phone, age: user.age }
  });
}

export async function loginUser(req: Request, res: Response) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const user = await UserModel.findOne({ phone: parsed.data.phone });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signUserToken({ id: user._id.toString(), phone: user.phone });
  return res.json({
    token,
    user: { id: user._id.toString(), fullName: user.fullName, phone: user.phone, age: user.age }
  });
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
  const user = await UserModel.findById(req.user.id).select({ passwordHash: 0 }).lean();
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  return res.json({ user: { id: String(user._id), fullName: user.fullName, phone: user.phone, age: user.age } });
}

