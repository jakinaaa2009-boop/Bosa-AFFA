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

  UPLOAD_DIR: z.string().min(1).default('uploads'),
  MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),

  FRONTEND_ORIGIN: z.string().min(1).default('http://localhost:3000')
});

export const env = EnvSchema.parse(process.env);

