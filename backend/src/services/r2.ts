import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function extensionFromMime(mime: string) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'bin';
}

const r2 = new S3Client({
  region: env.R2_REGION,
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY
  }
});

export type R2ReceiptObject = {
  key: string;
  url?: string;
};

export async function uploadReceiptToR2(args: { bytes: Buffer; mime: string }) : Promise<R2ReceiptObject> {
  const ext = extensionFromMime(args.mime);
  const yyyy = new Date().getUTCFullYear();
  const rand = crypto.randomUUID();
  const key = `receipts/${yyyy}/${rand}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: args.bytes,
      ContentType: args.mime,
      CacheControl: 'public, max-age=31536000, immutable'
    })
  );

  if (env.R2_PUBLIC_BASE_URL) {
    const base = normalizeBaseUrl(env.R2_PUBLIC_BASE_URL);
    return { key, url: `${base}/${key}` };
  }

  return { key };
}

export async function deleteReceiptFromR2(key: string) {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key
    })
  );
}

export async function getReceiptSignedUrlFromR2(args: { key: string; expiresInSeconds?: number }) {
  const expiresIn = args.expiresInSeconds ?? 60 * 30;
  return await getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: args.key
    }),
    { expiresIn }
  );
}

export async function getReceiptObjectFromR2(key: string) {
  return await r2.send(
    new GetObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key
    })
  );
}

