import bcrypt from 'bcryptjs';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { AdminModel } from '../models/Admin.js';
import { SubmissionModel } from '../models/Submission.js';
import { WinnerModel } from '../models/Winner.js';

async function seed() {
  await connectDb();

  const tinyPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAY6Jq7QAAAABJRU5ErkJggg==';

  // Admin
  const admin = await AdminModel.findOne({ username: env.ADMIN_DEFAULT_USERNAME });
  if (!admin) {
    const passwordHash = await bcrypt.hash(env.ADMIN_DEFAULT_PASSWORD, 12);
    await AdminModel.create({ username: env.ADMIN_DEFAULT_USERNAME, passwordHash });
  }

  // Submissions dummy
  const existingSubCount = await SubmissionModel.countDocuments();
  if (existingSubCount === 0) {
    const subs = await SubmissionModel.create([
      {
        fullName: 'Бат-Эрдэнэ Н.',
        phone: '99112233',
        email: 'bat@example.com',
        productName: 'Бүтээгдэхүүн 1',
        receiptNumber: 'AA00000001',
        amount: 25000,
        receiptImageBase64: tinyPngBase64,
        receiptImageMime: 'image/png',
        chances: 1,
        status: 'approved',
        approvedAt: new Date('2026-04-08T10:00:00.000Z')
      },
      {
        fullName: 'Сарангэрэл Б.',
        phone: '88112233',
        email: 'saran@example.com',
        productName: 'Бүтээгдэхүүн 2',
        receiptNumber: 'AA00000002',
        amount: 18000,
        receiptImageBase64: tinyPngBase64,
        receiptImageMime: 'image/png',
        chances: null,
        status: 'pending',
        approvedAt: null
      },
      {
        fullName: 'Тэмүүлэн Г.',
        phone: '77112233',
        productName: 'Бүтээгдэхүүн 3',
        receiptNumber: 'AA00000003',
        amount: 42000,
        receiptImageBase64: tinyPngBase64,
        receiptImageMime: 'image/png',
        chances: 3,
        status: 'approved',
        approvedAt: new Date('2026-04-12T10:00:00.000Z')
      }
    ]);

    // Winners dummy (use first approved submission)
    const first = subs.find((s: { status: string }) => s.status === 'approved');
    if (first) {
      await WinnerModel.create({
        winnerName: first.fullName,
        phone: first.phone,
        productName: first.productName,
        prizeName: 'Ухаалаг ТВ',
        drawDate: new Date('2026-04-10T10:00:00.000Z'),
        submissionId: first._id
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

