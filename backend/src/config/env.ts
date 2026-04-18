import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),

  ADMIN_DEFAULT_USERNAME: z.string().min(3).default('admin'),
  ADMIN_DEFAULT_PASSWORD: z.string().min(8),

  // Super-secret separate auth (stored in MongoDB, seeded from env)
  FORCE_ADMIN_DEFAULT_USERNAME: z.string().min(2),
  FORCE_ADMIN_DEFAULT_PASSWORD: z.string().min(6),

  UPLOAD_DIR: z.string().min(1).default('uploads'),
  MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),

  FRONTEND_ORIGIN: z.string().min(1).default('http://localhost:3000'),

  // Cloudflare R2 (S3-compatible object storage)
  R2_ENDPOINT: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_REGION: z.string().min(1).default('auto'),
  // Optional. If set, receipts can be served via stable public URLs.
  R2_PUBLIC_BASE_URL: z.string().min(1).optional()
});

export const env = EnvSchema.parse(process.env);

