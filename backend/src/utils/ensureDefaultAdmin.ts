import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { AdminModel } from '../models/Admin.js';

export async function ensureDefaultAdmin() {
  const existing = await AdminModel.findOne({ username: env.ADMIN_DEFAULT_USERNAME }).lean();
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.ADMIN_DEFAULT_PASSWORD, 12);
  await AdminModel.create({ username: env.ADMIN_DEFAULT_USERNAME, passwordHash });
}

