import type { Request, Response } from 'express';
import { WinnerModel } from '../models/Winner.js';

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
        receiptNumber: { $ifNull: ['$receiptNumber', { $first: '$sub.receiptNumber' }] }
      }
    },
    { $project: { sub: 0 } }
  ] as any[]);

  return res.json({ winners });
}

export async function deleteWinner(req: Request, res: Response) {
  const id = req.params.id;
  const deleted = await WinnerModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  return res.json({ ok: true });
}

