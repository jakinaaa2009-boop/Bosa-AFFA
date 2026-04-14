import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { AdminModel } from '../models/Admin.js';

const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1)
});

export async function adminLogin(req: Request, res: Response) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const admin = await AdminModel.findOne({ username: parsed.data.username });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username: admin.username }, env.JWT_SECRET, {
    subject: admin._id.toString(),
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });

  return res.json({
    token,
    admin: { id: admin._id.toString(), username: admin.username }
  });
}

