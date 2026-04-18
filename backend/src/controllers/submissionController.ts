import type { Request, Response } from 'express';
import { z } from 'zod';
import { SubmissionModel, SubmissionStatus } from '../models/Submission.js';
import type { AuthRequest } from '../types/express.js';
import { UserModel } from '../models/User.js';
import { deleteReceiptFromR2, getReceiptObjectFromR2, uploadReceiptToR2 } from '../services/r2.js';
import { normalizeReceiptNumber } from '../utils/receiptNumber.js';
import { effectiveDrawChances } from '../utils/drawChances.js';

const CreateSubmissionPublicSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(32),
  email: z.string().email().optional().or(z.literal('')),
  productName: z.string().min(1).max(120),
  receiptNumber: z.string().min(5).max(64),
  amount: z.coerce.number().min(0)
});

const CreateSubmissionUserSchema = z.object({
  productName: z.string().min(1).max(120),
  receiptNumber: z.string().min(5).max(64),
  amount: z.coerce.number().min(0)
});

function isMongoDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

export async function createSubmission(req: Request, res: Response) {
  const parsed = CreateSubmissionPublicSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) return res.status(400).json({ message: 'Receipt image is required' });
  if (!file.buffer) return res.status(400).json({ message: 'Receipt image is required' });

  const receiptNumber = normalizeReceiptNumber(parsed.data.receiptNumber);
  const dup = await SubmissionModel.exists({ receiptNumber });
  if (dup) {
    return res.status(409).json({ message: 'This receipt number is already registered' });
  }

  const uploaded = await uploadReceiptToR2({ bytes: file.buffer, mime: file.mimetype });

  let submission;
  try {
    submission = await SubmissionModel.create({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      productName: parsed.data.productName,
      receiptNumber,
      amount: parsed.data.amount,
      receiptImageMime: file.mimetype,
      receiptImageKey: uploaded.key,
      receiptImageUrl: uploaded.url,
      status: 'pending',
      approvedAt: null
    });
  } catch (err) {
    if (isMongoDuplicateKeyError(err)) {
      try {
        await deleteReceiptFromR2(uploaded.key);
      } catch {
        // ignore cleanup failure
      }
      return res.status(409).json({ message: 'This receipt number is already registered' });
    }
    throw err;
  }

  const submissionObj = submission.toObject() as any;
  const { receiptImageBase64, receiptImageData, receiptImageKey, receiptImageUrl, ...safe } = submissionObj;
  safe.receiptImage = `/api/submissions/${submission._id.toString()}/receipt`;

  return res.status(201).json({ submission: safe });
}

export async function createSubmissionForUser(req: AuthRequest, res: Response) {
  if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

  const parsed = CreateSubmissionUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file?.buffer) return res.status(400).json({ message: 'Receipt image is required' });

  const user = await UserModel.findById(req.user.id).lean();
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const receiptNumber = normalizeReceiptNumber(parsed.data.receiptNumber);
  const dup = await SubmissionModel.exists({ receiptNumber });
  if (dup) {
    return res.status(409).json({ message: 'This receipt number is already registered' });
  }

  const uploaded = await uploadReceiptToR2({ bytes: file.buffer, mime: file.mimetype });

  let submission;
  try {
    submission = await SubmissionModel.create({
      fullName: user.fullName,
      phone: user.phone,
      productName: parsed.data.productName,
      receiptNumber,
      amount: parsed.data.amount,
      receiptImageMime: file.mimetype,
      receiptImageKey: uploaded.key,
      receiptImageUrl: uploaded.url,
      status: 'pending',
      approvedAt: null
    });
  } catch (err) {
    if (isMongoDuplicateKeyError(err)) {
      try {
        await deleteReceiptFromR2(uploaded.key);
      } catch {
        // ignore cleanup failure
      }
      return res.status(409).json({ message: 'This receipt number is already registered' });
    }
    throw err;
  }

  const submissionObj = submission.toObject() as any;
  const { receiptImageBase64, receiptImageData, receiptImageKey, receiptImageUrl, ...safe } = submissionObj;
  safe.receiptImage = `/api/submissions/${submission._id.toString()}/receipt`;

  return res.status(201).json({ submission: safe });
}

export async function listMySubmissions(req: Request, res: Response) {
  const q = z
    .object({
      phone: z.string().min(6).max(32)
    })
    .safeParse(req.query);
  if (!q.success) return res.status(400).json({ message: 'Invalid query' });

  const itemsRaw = await SubmissionModel.find({ phone: q.data.phone })
    .select({ receiptImageBase64: 0, receiptImageData: 0, receiptImageMime: 0, receiptImageKey: 0, receiptImageUrl: 0 })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const items = itemsRaw.map((s: any) => ({
    ...s,
    receiptImage: `/api/submissions/${String(s._id)}/receipt`
  }));

  return res.json({ items });
}

export async function listMySubmissionsAuthed(req: AuthRequest, res: Response) {
  if (!req.user?.phone) return res.status(401).json({ message: 'Unauthorized' });
  const itemsRaw = await SubmissionModel.find({ phone: req.user.phone })
    .select({ receiptImageBase64: 0, receiptImageData: 0, receiptImageMime: 0, receiptImageKey: 0, receiptImageUrl: 0 })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const items = itemsRaw.map((s: any) => ({
    ...s,
    receiptImage: `/api/submissions/${String(s._id)}/receipt`
  }));

  return res.json({ items });
}

export async function listSubmissions(req: AuthRequest, res: Response) {
  const q = z
    .object({
      status: z.enum(SubmissionStatus).optional(),
      search: z.string().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(200).default(20)
    })
    .safeParse(req.query);

  if (!q.success) return res.status(400).json({ message: 'Invalid query' });

  const filter: Record<string, unknown> = {};
  if (q.data.status) filter.status = q.data.status;
  if (q.data.search) {
    const s = q.data.search.trim();
    if (s.length) {
      filter.$or = [
        { fullName: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { productName: { $regex: s, $options: 'i' } },
        { receiptNumber: { $regex: s, $options: 'i' } }
      ];
    }
  }

  const skip = (q.data.page - 1) * q.data.limit;
  const [itemsRaw, total] = await Promise.all([
    SubmissionModel.find(filter)
      .select({ receiptImageBase64: 0, receiptImageData: 0, receiptImageMime: 0, receiptImageKey: 0, receiptImageUrl: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(q.data.limit)
      .lean(),
    SubmissionModel.countDocuments(filter)
  ]);

  const items = itemsRaw.map((s: any) => ({
    ...s,
    receiptImage: `/api/submissions/${String(s._id)}/receipt`
  }));

  return res.json({
    items,
    page: q.data.page,
    limit: q.data.limit,
    total
  });
}

export async function getSubmissionReceiptImage(req: Request, res: Response) {
  const id = req.params.id;
  const doc = await SubmissionModel.findById(id)
    .select({ receiptImageKey: 1, receiptImageUrl: 1, receiptImageBase64: 1, receiptImageData: 1, receiptImageMime: 1 })
    .lean();
  if (!doc) return res.status(404).end();
  if (!doc.receiptImageMime) return res.status(404).end();

  const anyDoc = doc as any;
  if (anyDoc.receiptImageKey) {
    try {
      const obj = await getReceiptObjectFromR2(anyDoc.receiptImageKey);
      const body: any = (obj as any).Body;
      if (!body) return res.status(404).end();

      res.setHeader('Content-Type', doc.receiptImageMime);
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

      // AWS SDK v3 in Node can return a Readable stream or a web stream-like body.
      if (typeof body.pipe === 'function') {
        return body.pipe(res);
      }
      if (typeof body.transformToByteArray === 'function') {
        const bytes = await body.transformToByteArray();
        return res.status(200).send(Buffer.from(bytes));
      }
      return res.status(500).json({ message: 'Unsupported R2 response body' });
    } catch {
      // Fall back to legacy storage if present.
    }
  }

  res.setHeader('Content-Type', doc.receiptImageMime);
  res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

  if (anyDoc.receiptImageBase64) {
    const bytes = Buffer.from(anyDoc.receiptImageBase64, 'base64');
    return res.status(200).send(bytes);
  }
  if (anyDoc.receiptImageData) {
    const v = anyDoc.receiptImageData;
    // Handles: Buffer, BSON Binary, or { type: 'Buffer', data: number[] }
    if (Buffer.isBuffer(v)) return res.status(200).send(v);
    if (Buffer.isBuffer(v.buffer)) return res.status(200).send(v.buffer);
    if (Array.isArray(v.data)) return res.status(200).send(Buffer.from(v.data));
    if (typeof v === 'object' && v !== null) {
      // Some BSON Binary shapes: { _bsontype: 'Binary', buffer: <Buffer>, ... }
      const maybeBuf = (v as any).buffer;
      if (Buffer.isBuffer(maybeBuf)) return res.status(200).send(maybeBuf);
    }
  }
  return res.status(404).end();
}

export async function patchSubmissionStatus(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = z
    .object({
      status: z.enum(SubmissionStatus),
      chances: z.coerce.number().int().min(1).max(10_000).optional()
    })
    .superRefine((data, ctx) => {
      if (data.status === 'approved' && data.chances === undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'chances is required when approving (product count = lottery tickets)',
          path: ['chances']
        });
      }
      if (data.status !== 'approved' && data.chances !== undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'chances must only be sent when status is approved',
          path: ['chances']
        });
      }
    })
    .safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: 'Invalid payload' });

  const updated = await SubmissionModel.findByIdAndUpdate(
    id,
    body.data.status === 'approved'
      ? { status: 'approved', approvedAt: new Date(), chances: body.data.chances }
      : ({ status: body.data.status, approvedAt: null, $unset: { chances: 1 } } as Record<string, unknown>),
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: 'Not found' });
  return res.json({ submission: updated });
}

export async function listEligibleForDraw(req: AuthRequest, res: Response) {
  const q = z
    .object({
      startDate: z.string().min(1),
      endDate: z.string().min(1)
    })
    .safeParse(req.query);
  if (!q.success) return res.status(400).json({ message: 'Invalid query' });

  const start = new Date(q.data.startDate);
  const end = new Date(q.data.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ message: 'Invalid date range' });
  }

  const items = await SubmissionModel.find({
    status: 'approved',
    approvedAt: { $gte: start, $lte: end }
  })
    .select({ receiptNumber: 1, chances: 1 })
    .sort({ approvedAt: -1 })
    .limit(5000)
    .lean();

  const itemsOut = items
    .map((s: any) => ({
      id: String(s._id),
      receiptNumber: s.receiptNumber,
      chances: effectiveDrawChances(s)
    }))
    .filter((x) => x.chances > 0);

  const totalChances = itemsOut.reduce((sum, x) => sum + x.chances, 0);

  // count = total lottery tickets (weighted pool size); receiptCount = distinct receipts
  return res.json({
    items: itemsOut,
    count: totalChances,
    receiptCount: itemsOut.length
  });
}

export async function deleteSubmission(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const deleted = await SubmissionModel.findByIdAndDelete(id).lean();
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  const anyDeleted = deleted as any;
  if (anyDeleted.receiptImageKey) {
    try {
      await deleteReceiptFromR2(anyDeleted.receiptImageKey);
    } catch {
      // Best-effort cleanup; DB is source of truth.
    }
  }
  return res.json({ ok: true });
}

