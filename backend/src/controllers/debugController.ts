import type { Response } from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../types/express.js';

export async function debugDb(_req: AuthRequest, res: Response) {
  const conn = mongoose.connection;
  const db = conn.db;
  if (!db) return res.status(500).json({ message: 'MongoDB not connected' });

  const collections = await db.listCollections().toArray();
  const names = collections.map((c) => c.name).sort((a, b) => a.localeCompare(b));

  const [usersCount, submissionsCount] = await Promise.all([
    db.collection('users').countDocuments({}),
    db.collection('submissions').countDocuments({})
  ]);

  return res.json({
    readyState: conn.readyState,
    dbName: db.databaseName,
    collections: names,
    usersCount,
    submissionsCount
  });
}

