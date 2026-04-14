import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { AdminModel } from '../models/Admin.js';

export async function ensureDefaultAdmin() {
  const existing = await AdminModel.findOne({ username: env.ADMIN_DEFAULT_USERNAME });
  if (!existing) {
    const passwordHash = await bcrypt.hash(env.ADMIN_DEFAULT_PASSWORD, 12);
    await AdminModel.create({ username: env.ADMIN_DEFAULT_USERNAME, passwordHash });
    return;
  }

  // If env password changed, keep default admin in sync (useful for deployments).
  const ok = await bcrypt.compare(env.ADMIN_DEFAULT_PASSWORD, existing.passwordHash);
  if (!ok) {
    existing.passwordHash = await bcrypt.hash(env.ADMIN_DEFAULT_PASSWORD, 12);
    await existing.save();
  }
}

