import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { ForcedReceiptModel } from '../models/ForcedReceipt.js';
import type { AuthRequest } from '../types/express.js';
import { clearForceCookie, setForceCookie } from '../middleware/forceAuth.js';
import { ForceAdminModel } from '../models/ForceAdmin.js';
import { SubmissionModel } from '../models/Submission.js';
import { normalizeReceiptNumber } from '../utils/receiptNumber.js';
import { FORCEABLE_PRIZES } from '../utils/forceablePrizes.js';

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

async function validateApprovedReceipt(receiptNumber: string) {
  if (!receiptNumber) return true;
  const exists = await SubmissionModel.exists({ receiptNumber, status: 'approved' });
  return Boolean(exists);
}

/** Migrate legacy single-field docs (no prizeName) onto Airpod gen 4. */
async function migrateLegacyForcedReceipt() {
  const legacy = await ForcedReceiptModel.findOne({
    $or: [{ prizeName: { $exists: false } }, { prizeName: null }, { prizeName: '' }]
  }).lean();
  if (!legacy) return;

  const airpod = FORCEABLE_PRIZES[0];
  const existing = await ForcedReceiptModel.findOne({ prizeName: airpod }).lean();
  if (!existing && legacy.receiptNumber) {
    await ForcedReceiptModel.findOneAndUpdate(
      { prizeName: airpod },
      { receiptNumber: legacy.receiptNumber },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  await ForcedReceiptModel.deleteOne({ _id: legacy._id });
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
  await migrateLegacyForcedReceipt();

  const docs = await ForcedReceiptModel.find({ prizeName: { $in: [...FORCEABLE_PRIZES] } }).lean();
  const byPrize: Record<string, string> = {};
  for (const p of FORCEABLE_PRIZES) byPrize[p] = '';
  for (const d of docs) {
    if (d.prizeName) byPrize[d.prizeName] = d.receiptNumber ?? '';
  }

  return res.json({
    receipts: byPrize,
    // Backward-compatible single field (Airpod)
    receiptNumber: byPrize[FORCEABLE_PRIZES[0]] ?? ''
  });
}

export async function setForcedReceipt(req: AuthRequest, res: Response) {
  const parsed = z
    .object({
      /** Preferred: map of prizeName -> receiptNumber */
      receipts: z.record(z.string(), z.string().trim().max(128)).optional(),
      /** Legacy single-field write (Airpod only) */
      receiptNumber: z.string().trim().max(128).optional()
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  await migrateLegacyForcedReceipt();

  const updates: Record<string, string> = {};
  if (parsed.data.receipts) {
    for (const prize of FORCEABLE_PRIZES) {
      if (Object.prototype.hasOwnProperty.call(parsed.data.receipts, prize)) {
        const raw = parsed.data.receipts[prize] ?? '';
        updates[prize] = raw ? normalizeReceiptNumber(raw) : '';
      }
    }
  } else if (parsed.data.receiptNumber !== undefined) {
    updates[FORCEABLE_PRIZES[0]] = parsed.data.receiptNumber
      ? normalizeReceiptNumber(parsed.data.receiptNumber)
      : '';
  } else {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  for (const [prizeName, receiptNumber] of Object.entries(updates)) {
    if (!(await validateApprovedReceipt(receiptNumber))) {
      return res.status(400).json({
        message: `Баримтын дугаар олдсонгүй (approved байх ёстой): ${prizeName}`
      });
    }
  }

  for (const [prizeName, receiptNumber] of Object.entries(updates)) {
    await ForcedReceiptModel.findOneAndUpdate(
      { prizeName },
      { receiptNumber },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const docs = await ForcedReceiptModel.find({ prizeName: { $in: [...FORCEABLE_PRIZES] } }).lean();
  const byPrize: Record<string, string> = {};
  for (const p of FORCEABLE_PRIZES) byPrize[p] = '';
  for (const d of docs) {
    if (d.prizeName) byPrize[d.prizeName] = d.receiptNumber ?? '';
  }

  return res.json({
    ok: true,
    receipts: byPrize,
    receiptNumber: byPrize[FORCEABLE_PRIZES[0]] ?? ''
  });
}
