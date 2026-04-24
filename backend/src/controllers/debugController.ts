import type { Response } from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../types/express.js';

export async function debugDb(_req: AuthRequest, res: Response) {
  const conn = mongoose.connection;
  const db = conn.db;
  if (!db) return res.status(500).json({ message: 'MongoDB not connected' });

  const collections = await db.listCollections().toArray();
  const names = collections.map((c) => c.name).sort((a, b) => a.localeCompare(b));

  const counts: Record<string, number> = {};
  await Promise.all(
    names.map(async (name) => {
      try {
        counts[name] = await db.collection(name).countDocuments({});
      } catch {
        counts[name] = -1;
      }
    })
  );

  return res.json({
    readyState: conn.readyState,
    databaseName: db.databaseName,
    collections: names,
    counts
  });
}

