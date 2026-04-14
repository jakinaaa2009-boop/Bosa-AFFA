import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../types/express.js';
import { SubmissionModel } from '../models/Submission.js';
import { WinnerModel } from '../models/Winner.js';

const SpinSchema = z.object({
  prizeName: z.string().min(1).max(160),
  startDate: z.string().min(1),
  endDate: z.string().min(1)
});

function randomInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
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

  const eligibleCount = await SubmissionModel.countDocuments(filter);
  if (eligibleCount === 0) return res.status(400).json({ message: 'Оролцогч олдсонгүй' });

  const skip = randomInt(eligibleCount);
  const winnerSubmission = await SubmissionModel.findOne(filter).skip(skip);
  if (!winnerSubmission) return res.status(400).json({ message: 'Оролцогч олдсонгүй' });

  // Prevent duplicates (race-safe)
  try {
    const winner = await WinnerModel.create({
      winnerName: winnerSubmission.fullName,
      phone: winnerSubmission.phone,
      productName: winnerSubmission.productName,
      prizeName,
      drawDate: new Date(),
      submissionId: winnerSubmission._id
    });

    return res.json({
      winner: {
        id: winner._id.toString(),
        receiptNumber: winnerSubmission.receiptNumber,
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

