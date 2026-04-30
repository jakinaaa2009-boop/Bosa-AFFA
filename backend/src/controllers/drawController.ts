import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../types/express.js';
import { SubmissionModel } from '../models/Submission.js';
import { WinnerModel } from '../models/Winner.js';
import { ForcedReceiptModel } from '../models/ForcedReceipt.js';
import { UserModel } from '../models/User.js';
import { normalizeReceiptNumber } from '../utils/receiptNumber.js';
import { submissionPoolLabel } from '../utils/submissionDisplay.js';

const SpinSchema = z.object({
  prizeName: z.string().min(1).max(160),
  startDate: z.string().min(1),
  endDate: z.string().min(1)
});

async function pickRandomSubmission(filter: Record<string, unknown>) {
  const row = await SubmissionModel.aggregate([
    { $match: filter as any },
    { $sample: { size: 1 } },
    {
      $project: {
        _id: 1,
        fullName: 1,
        phone: 1,
        productName: 1,
        receiptNumber: 1,
        companyName: 1,
        participantType: 1
      }
    }
  ]);
  return row?.[0] ?? null;
}

export async function spinDraw(req: AuthRequest, res: Response) {
  const parsed = SpinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  // Eligible: approved submissions that haven't already won this exact prize
  const prizeName = parsed.data.prizeName;
  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ message: 'Invalid date range' });
  }

  const alreadyWon = await WinnerModel.find({ prizeName }).select({ submissionId: 1 }).lean();
  const excludeIds = alreadyWon.map((w: { submissionId: unknown }) => w.submissionId).filter(Boolean);

  const filter: Record<string, unknown> = { status: 'approved', approvedAt: { $gte: start, $lte: end } };
  if (excludeIds.length) filter._id = { $nin: excludeIds };

  // Global eligibility: exclude users that already won any prize.
  // This does NOT delete or modify their receipts/submissions; it only affects draw eligibility.
  const ineligiblePhones = await UserModel.find({ hasWon: true }).select({ phone: 1 }).lean();
  const banned = ineligiblePhones.map((u: any) => String(u.phone)).filter(Boolean);
  if (banned.length) filter.phone = { $nin: banned };

  // Check forced receipt (super-secret override) — ONLY for PlayStation 5
  const forced =
    prizeName === 'PlayStation 5' ? await ForcedReceiptModel.findOne().sort({ updatedAt: -1 }).lean() : null;
  let winnerSubmission = null as any;
  const forcedRequested = forced?.receiptNumber ? normalizeReceiptNumber(forced.receiptNumber) : '';
  let forcedApplied = false;
  let forcedReason: string | null = null;
  if (forcedRequested) {
    winnerSubmission = await SubmissionModel.findOne({
      ...filter,
      receiptNumber: forcedRequested,
      $or: [{ participantType: 'user' }, { participantType: { $exists: false } }]
    });
    if (winnerSubmission) forcedApplied = true;
    else {
      winnerSubmission = null;
      forcedReason =
        'Forced receipt нь сонгосон хугацааны eligible (approved) жагсаалтад байхгүй байна.';
    }
  }

  if (!winnerSubmission) {
    winnerSubmission = await pickRandomSubmission(filter);
    if (!winnerSubmission) return res.status(400).json({ message: 'Оролцогч олдсонгүй' });
  }

  // Extra safety: if this winner is a registered user and is already marked as won, refuse.
  // (Prevents edge-case races when multiple spins happen at once.)
  const wsAny = winnerSubmission as any;
  const ptCandidate = (wsAny.participantType as 'user' | 'company' | undefined) ?? 'user';
  if (ptCandidate !== 'company') {
    const u = await UserModel.findOne({ phone: winnerSubmission.phone }).select({ hasWon: 1 }).lean();
    if (u?.hasWon) return res.status(409).json({ message: 'Дахин оролдоно уу' });
  }

  // Prevent duplicates (race-safe)
  try {
    const ws = winnerSubmission as any;
    const pt = (ws.participantType as 'user' | 'company' | undefined) ?? 'user';
    const displayName =
      pt === 'company' ? String(ws.companyName || ws.fullName || '').trim() : ws.fullName;
    const winner = await WinnerModel.create({
      winnerName: displayName,
      phone: winnerSubmission.phone,
      productName: winnerSubmission.productName,
      prizeName,
      participantType: pt,
      receiptNumber: pt === 'company' ? undefined : ws.receiptNumber,
      companyName: pt === 'company' ? ws.companyName : undefined,
      drawDate: new Date(),
      submissionId: winnerSubmission._id
    });

    // Mark user as no longer eligible after winning (individual participants only).
    if (pt !== 'company') {
      await UserModel.updateOne({ phone: winnerSubmission.phone }, { $set: { hasWon: true } });
    }

    return res.json({
      forced: {
        requested: forcedRequested || null,
        applied: forcedApplied,
        reason: forcedApplied ? null : forcedReason
      },
      winner: {
        id: winner._id.toString(),
        receiptNumber: pt === 'company' ? undefined : ws.receiptNumber,
        companyName: pt === 'company' ? ws.companyName : undefined,
        participantType: pt,
        displayLabel: submissionPoolLabel(ws),
        winnerName: winner.winnerName,
        phone: winner.phone,
        productName: winner.productName,
        prizeName: winner.prizeName,
        drawDate: winner.drawDate
      }
    });
  } catch (err) {
    // Unique index conflict => try again
    return res.status(409).json({ message: 'Дахин оролдоно уу' });
  }
}

export async function forcedReceiptStatus(_req: AuthRequest, res: Response) {
  const forced = await ForcedReceiptModel.findOne().sort({ updatedAt: -1 }).lean();
  return res.json({
    receiptNumber: forced?.receiptNumber ?? '',
    updatedAt: forced?.updatedAt ?? null
  });
}

