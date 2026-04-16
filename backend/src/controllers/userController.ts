import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../types/express.js';
import { SubmissionModel } from '../models/Submission.js';
import { UserModel } from '../models/User.js';

export async function usersStats(req: AuthRequest, res: Response) {
  const q = z
    .object({
      // optional search to scope stats (same as listUsers)
      search: z.string().optional()
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

  const agg = await UserModel.aggregate([
    { $match: match },
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
        totalSubmissions: { $size: '$subs' }
      }
    },
    {
      $facet: {
        ageStats: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              avgAge: { $avg: '$age' },
              minAge: { $min: '$age' },
              maxAge: { $max: '$age' },
              under18: { $sum: { $cond: [{ $lt: ['$age', 18] }, 1, 0] } },
              a18_24: {
                $sum: { $cond: [{ $and: [{ $gte: ['$age', 18] }, { $lte: ['$age', 24] }] }, 1, 0] }
              },
              a25_34: {
                $sum: { $cond: [{ $and: [{ $gte: ['$age', 25] }, { $lte: ['$age', 34] }] }, 1, 0] }
              },
              a35_44: {
                $sum: { $cond: [{ $and: [{ $gte: ['$age', 35] }, { $lte: ['$age', 44] }] }, 1, 0] }
              },
              a45plus: { $sum: { $cond: [{ $gte: ['$age', 45] }, 1, 0] } }
            }
          },
          { $project: { _id: 0 } }
        ],
        submissionStats: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              avgReceipts: { $avg: '$totalSubmissions' },
              minReceipts: { $min: '$totalSubmissions' },
              maxReceipts: { $max: '$totalSubmissions' },
              b0: { $sum: { $cond: [{ $eq: ['$totalSubmissions', 0] }, 1, 0] } },
              b1: { $sum: { $cond: [{ $eq: ['$totalSubmissions', 1] }, 1, 0] } },
              b2_3: {
                $sum: {
                  $cond: [{ $and: [{ $gte: ['$totalSubmissions', 2] }, { $lte: ['$totalSubmissions', 3] }] }, 1, 0]
                }
              },
              b4_5: {
                $sum: {
                  $cond: [{ $and: [{ $gte: ['$totalSubmissions', 4] }, { $lte: ['$totalSubmissions', 5] }] }, 1, 0]
                }
              },
              b6_10: {
                $sum: {
                  $cond: [{ $and: [{ $gte: ['$totalSubmissions', 6] }, { $lte: ['$totalSubmissions', 10] }] }, 1, 0]
                }
              },
              b11plus: { $sum: { $cond: [{ $gte: ['$totalSubmissions', 11] }, 1, 0] } }
            }
          },
          { $project: { _id: 0 } }
        ],
        topUser: [
          { $sort: { totalSubmissions: -1 as const, createdAt: 1 as const } },
          { $limit: 1 },
          { $project: { passwordHash: 0, subs: 0 } }
        ]
      }
    }
  ] as any[]);

  const first = agg?.[0] ?? {};
  return res.json({
    ageStats: first.ageStats?.[0] ?? null,
    submissionStats: first.submissionStats?.[0] ?? null,
    topUser: first.topUser?.[0] ?? null
  });
}

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

