import fs from 'node:fs';
import path from 'node:path';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { ensureDefaultAdmin } from './utils/ensureDefaultAdmin.js';

async function main() {
  const uploadDirAbs = path.resolve(process.cwd(), env.UPLOAD_DIR);
  if (!fs.existsSync(uploadDirAbs)) fs.mkdirSync(uploadDirAbs, { recursive: true });

  await connectDb();
  await ensureDefaultAdmin();

  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

