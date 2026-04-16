import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { ForcedReceiptModel } from '../models/ForcedReceipt.js';
import type { AuthRequest } from '../types/express.js';
import { clearForceCookie, setForceCookie } from '../middleware/forceAuth.js';
import { ForceAdminModel } from '../models/ForceAdmin.js';

const SecretLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

function signForceToken(forceAdmin: { id: string; username: string }) {
  return jwt.sign({ typ: 'force', username: forceAdmin.username }, env.JWT_SECRET, {
    subject: forceAdmin.id,
    expiresIn: '7d'
  });
}

export async function forceLogin(req: Request, res: Response) {
  const parsed = SecretLoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const admin = await ForceAdminModel.findOne({ username: parsed.data.username });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signForceToken({ id: admin._id.toString(), username: admin.username });
  setForceCookie(res, token);
  return res.json({ ok: true });
}

export async function forceLogout(_req: Request, res: Response) {
  clearForceCookie(res);
  return res.json({ ok: true });
}

export async function getForcedReceipt(_req: AuthRequest, res: Response) {
  const doc = await ForcedReceiptModel.findOne().sort({ updatedAt: -1 }).lean();
  return res.json({ receiptNumber: doc?.receiptNumber ?? '' });
}

export async function setForcedReceipt(req: AuthRequest, res: Response) {
  const parsed = z
    .object({
      receiptNumber: z.string().trim().max(128).default('')
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const receiptNumber = parsed.data.receiptNumber;
  const doc = await ForcedReceiptModel.findOneAndUpdate(
    {},
    { receiptNumber },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return res.json({ ok: true, receiptNumber: doc?.receiptNumber ?? receiptNumber });
}

