import multer from 'multer';
import { env } from '../config/env.js';

const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.memoryStorage();

export const receiptUpload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) return cb(new Error('Invalid file type'));
    cb(null, true);
  }
});

