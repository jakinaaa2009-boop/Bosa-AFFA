import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { ForceAdminModel } from '../models/ForceAdmin.js';

export async function ensureDefaultForceAdmin() {
  const existing = await ForceAdminModel.findOne({ username: env.FORCE_ADMIN_DEFAULT_USERNAME });
  if (!existing) {
    const passwordHash = await bcrypt.hash(env.FORCE_ADMIN_DEFAULT_PASSWORD, 12);
    await ForceAdminModel.create({ username: env.FORCE_ADMIN_DEFAULT_USERNAME, passwordHash });
    return;
  }

  // Keep password synced with env (useful for deployments).
  const ok = await bcrypt.compare(env.FORCE_ADMIN_DEFAULT_PASSWORD, existing.passwordHash);
  if (!ok) {
    existing.passwordHash = await bcrypt.hash(env.FORCE_ADMIN_DEFAULT_PASSWORD, 12);
    await existing.save();
  }
}

