import type { Request, Response } from 'express';
import { z } from 'zod';
import { WinnerModel } from '../models/Winner.js';

function isMongoDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

export async function listWinners(_req: Request, res: Response) {
  // Include receiptNumber (stored on Winner, or looked up from related Submission for older docs).
  const winners = await WinnerModel.aggregate([
    { $sort: { drawDate: -1 } },
    { $limit: 200 },
    {
      $lookup: {
        from: 'submissions',
        localField: 'submissionId',
        foreignField: '_id',
        as: 'sub'
      }
    },
    {
      $addFields: {
        receiptNumber: { $ifNull: ['$receiptNumber', { $first: '$sub.receiptNumber' }] },
        participantType: {
          $ifNull: ['$participantType', { $ifNull: [{ $first: '$sub.participantType' }, 'user'] }]
        },
        companyName: { $ifNull: ['$companyName', { $first: '$sub.companyName' }] }
      }
    },
    { $project: { sub: 0 } }
  ] as any[]);

  // eslint-disable-next-line no-console
  console.log('listWinners', { returned: winners.length });

  return res.json({ winners });
}

export async function deleteWinner(req: Request, res: Response) {
  const id = req.params.id;
  const deleted = await WinnerModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  return res.json({ ok: true });
}

export async function updateWinnerPrizeName(req: Request, res: Response) {
  const id = req.params.id;
  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success) return res.status(400).json({ message: 'Invalid id' });

  const body = z
    .object({
      prizeName: z.string().min(1).max(160)
    })
    .safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: 'Invalid payload' });

  try {
    const updated = await WinnerModel.findByIdAndUpdate(
      parsedId.data,
      { $set: { prizeName: body.data.prizeName.trim() } },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json({ winner: updated });
  } catch (err) {
    if (isMongoDuplicateKeyError(err)) {
      // Unique index: { prizeName, submissionId } => cannot set to an already-existing pair.
      return res.status(409).json({ message: 'Duplicate prize for same submission' });
    }
    throw err;
  }
}

