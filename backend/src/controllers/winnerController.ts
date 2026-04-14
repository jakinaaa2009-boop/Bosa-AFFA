import type { Request, Response } from 'express';
import { WinnerModel } from '../models/Winner.js';

export async function listWinners(_req: Request, res: Response) {
  const winners = await WinnerModel.find().sort({ drawDate: -1 }).limit(200).lean();
  return res.json({ winners });
}

export async function deleteWinner(req: Request, res: Response) {
  const id = req.params.id;
  const deleted = await WinnerModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  return res.json({ ok: true });
}

