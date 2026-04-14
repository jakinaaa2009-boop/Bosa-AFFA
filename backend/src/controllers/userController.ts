import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../types/express.js';
import { SubmissionModel } from '../models/Submission.js';
import { UserModel } from '../models/User.js';

export async function listUsers(req: AuthRequest, res: Response) {
  const q = z
    .object({
      search: z.string().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(200).default(20)
    })
    .safeParse(req.query);

  if (!q.success) return res.status(400).json({ message: 'Invalid query' });

  const match: Record<string, unknown> = {};
  if (q.data.search) {
    const s = q.data.search.trim();
    if (s.length) {
      match.$or = [{ fullName: { $regex: s, $options: 'i' } }, { phone: { $regex: s, $options: 'i' } }];
    }
  }

  const skip = (q.data.page - 1) * q.data.limit;

  // List actual registered users from MongoDB, and join submission stats by phone.
  const agg = await UserModel.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 as const } },
    {
      $lookup: {
        from: 'submissions',
        localField: 'phone',
        foreignField: 'phone',
        as: 'subs'
      }
    },
    {
      $addFields: {
        totalSubmissions: { $size: '$subs' },
        approvedSubmissions: {
          $size: {
            $filter: {
              input: '$subs',
              as: 's',
              cond: { $eq: ['$$s.status', 'approved'] }
            }
          }
        },
        lastSubmittedAt: { $max: '$subs.createdAt' }
      }
    },
    { $project: { subs: 0, passwordHash: 0 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: q.data.limit }],
        total: [{ $count: 'count' }]
      }
    }
  ] as any[]);

  const first = agg?.[0] ?? { items: [], total: [] };
  const total = first.total?.[0]?.count ?? 0;

  return res.json({
    items: first.items,
    page: q.data.page,
    limit: q.data.limit,
    total
  });
}

export async function deleteUser(req: AuthRequest, res: Response) {
  const userId = req.params.id;
  const parsed = z.string().min(1).safeParse(userId);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid user id' });

  const user = await UserModel.findById(parsed.data).lean();
  if (!user) return res.status(404).json({ message: 'Not found' });

  const [deletedSubs, deletedUser] = await Promise.all([
    SubmissionModel.deleteMany({ phone: user.phone }),
    UserModel.findByIdAndDelete(user._id)
  ]);

  return res.json({ ok: true, deletedSubmissions: deletedSubs.deletedCount ?? 0, deletedUser: Boolean(deletedUser) });
}

