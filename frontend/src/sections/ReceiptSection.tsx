'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { PRODUCTS } from '@/lib/constants';
import { createSubmission, fetchMySubmissions } from '@/services/submissions';
import type { ParticipantType, Submission } from '@/types/api';
import { resolveReceiptImage } from '@/lib/assets';
import { formatDateMn } from '@/lib/utils';

export function ReceiptSection({
  defaults
}: {
  defaults?: { fullName?: string; phone?: string; accountType?: 'user' | 'company' };
}) {
  const productOptions = useMemo(() => PRODUCTS.map((p) => p.name), []);

  const [participantType, setParticipantType] = useState<ParticipantType>('user');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<Submission[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [preview, setPreview] = useState<Submission | null>(null);

  const phone = defaults?.phone?.trim() ?? '';
  const fullName = defaults?.fullName?.trim() ?? '';
  const isCompanyAccount = defaults?.accountType === 'company';
  const productName = productOptions[0] ?? 'Бүтээгдэхүүн 1';

  async function refreshList() {
    setLoadingItems(true);
    try {
      const list = await fetchMySubmissions();
      setItems(list);
    } catch {
      // ignore
    } finally {
      setLoadingItems(false);
    }
  }

  useEffect(() => {
    void refreshList();
  }, []);

  useEffect(() => {
    if (defaults?.accountType === 'company') setParticipantType('company');
    else setParticipantType('user');
  }, [defaults?.accountType]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!phone) return setError('Нэвтэрсний дараа баримт илгээнэ үү.');
    if (!fullName) return setError('Нэрийн мэдээлэл олдсонгүй. Дахин нэвтэрнэ үү.');
    if (participantType === 'user') {
      if (!receiptNumber.trim()) return setError('Баримтын дугаараа оруулна уу.');
    } else if (!isCompanyAccount && !companyName.trim()) {
      return setError('Компанийн нэрийг оруулна уу.');
    }
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) return setError('Үнийн дүнгээ зөв оруулна уу.');
    if (!receiptFile) {
      return setError(participantType === 'user' ? 'Баримтын зургийг оруулна уу.' : 'Бүтээгдэхүүний зургийг оруулна уу.');
    }

    setLoading(true);
    try {
      const resolvedCompanyName =
        participantType === 'company' ? (isCompanyAccount ? fullName : companyName.trim()) : undefined;

      await createSubmission({
        productName,
        participantType,
        receiptNumber: participantType === 'user' ? receiptNumber.trim() : undefined,
        companyName: resolvedCompanyName,
        amount: amountNum,
        receiptFile
      });
      setSuccess('Амжилттай илгээлээ. Шалгагдсаны дараа баталгаажина.');
      setReceiptNumber('');
      setCompanyName('');
      setAmount('');
      setReceiptFile(null);
      await refreshList();
    } catch {
      setError('Илгээх үед алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="receipt" className="px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Баримт бүртгэх</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Хувь хүн: eBarimt баримт. Компани: савлагаа / боодлын зураг (баримтын дугаар шаардлагагүй).
          </p>
        </div>

        <div className="mt-8">
          <GlassCard className="p-6 sm:p-8">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <form onSubmit={onSubmit} className="grid gap-5">
                <div className="grid gap-2">
                  <span className="text-xs font-semibold text-white/70">Оролцогчийн төрөл *</span>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { v: 'user' as const, label: 'Хэрэглэгч' },
                        { v: 'company' as const, label: 'Компани' }
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => {
                          setParticipantType(opt.v);
                          setError(null);
                        }}
                        className={[
                          'rounded-full px-4 py-2 text-sm font-extrabold ring-1 transition',
                          participantType === opt.v
                            ? 'bg-white text-slate-900 ring-white'
                            : 'bg-white/10 text-white/85 ring-white/15 hover:bg-white/15'
                        ].join(' ')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {participantType === 'user' ? (
                    <Field label="Баримтын дугаар *">
                      <input
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        className="h-12 w-full rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-sky-300/60"
                        placeholder="Ж: AA00000000"
                      />
                      <div className="text-xs text-white/55">2 латин үсэг + 8 тоо, жишээ нь AA00000000</div>
                    </Field>
                  ) : isCompanyAccount ? (
                    <Field label="Компани">
                      <div className="flex min-h-12 items-center rounded-2xl bg-white/5 px-4 text-sm font-semibold text-white/90 ring-1 ring-white/15">
                        {fullName}
                      </div>
                      <div className="text-xs text-white/55">Бүртгэлтэй компанийн нэр автоматаар илгээгдэнэ.</div>
                    </Field>
                  ) : (
                    <Field label="Компанийн нэр *">
                      <input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="h-12 w-full rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-sky-300/60"
                        placeholder="Ж: Bosa LLC"
                      />
                    </Field>
                  )}
                  <Field label="Үнийн дүн (₮) *">
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      inputMode="numeric"
                      className="h-12 w-full rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-sky-300/60"
                      placeholder="Жишээ: 25000"
                    />
                  </Field>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-white/70">
                    {participantType === 'user' ? 'НӨАТ-ын баримтын зураг *' : 'Бүтээгдэхүүний зураг (савлагаа) *'}
                  </label>
                  <label className="group cursor-pointer rounded-3xl border border-dashed border-white/25 bg-white/5 p-5 ring-1 ring-white/10 hover:bg-white/8 transition">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 ring-1 ring-white/15 group-hover:bg-white/15 transition">
                        Файл сонгох
                      </div>
                      <div className="text-xs text-white/60">
                        {receiptFile ? (
                          <>
                            Сонгосон файл: <span className="font-semibold text-white/85">{receiptFile.name}</span>
                          </>
                        ) : (
                          'PNG/JPG/WEBP · max 5MB'
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {error ? <div className="text-sm text-rose-200">{error}</div> : null}
                {success ? <div className="text-sm text-emerald-200">{success}</div> : null}

                <Button
                  variant="primary"
                  className="w-full h-14 text-base shadow-[0_18px_50px_rgba(56,189,248,0.18)]"
                  type="submit"
                >
                  {loading ? 'Илгээж байна...' : 'Илгээх'}
                </Button>
              </form>
            </motion.div>
          </GlassCard>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-extrabold tracking-tight text-white">Бүртгүүлсэн баримтууд</div>
            <div className="flex items-center gap-2">
              {items.length > 6 ? (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15 transition"
                >
                  {showAll ? 'Багаар харах' : 'Бүгдийг харах'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void refreshList()}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15 transition"
              >
                Шинэчлэх
              </button>
            </div>
          </div>

          <div className="mt-4">
            {loadingItems ? (
              <div className="text-sm text-white/70">Уншиж байна...</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-white/70">Одоогоор бүртгүүлсэн баримт алга.</div>
            ) : (
              <div className="grid gap-3">
                {(showAll ? items : items.slice(0, 6)).map((s) => (
                  <GlassCard
                    key={s._id ?? `${s.receiptNumber ?? s.companyName}-${s.createdAt}`}
                    className="p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setPreview(s)}
                        className="shrink-0 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/8 transition"
                        aria-label="Баримт харах"
                      >
                        <div className="relative h-16 w-16">
                          <Image
                            src={resolveReceiptImage(s.receiptImage)}
                            alt="Баримт"
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        </div>
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-sm font-extrabold text-white">
                            {s.participantType === 'company' ? s.companyName || s.fullName : s.receiptNumber || '—'}
                          </div>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
                            {s.participantType === 'company' ? 'Компани' : 'Хэрэглэгч'}
                          </span>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
                            {s.status}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-white/70">
                          Үнийн дүн:{' '}
                          <span className="font-semibold text-white/90">{s.amount.toLocaleString()}₮</span>
                          {s.createdAt ? (
                            <>
                              {' '}
                              · Огноо: <span className="text-white/75">{formatDateMn(new Date(s.createdAt))}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreview(s)}
                          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15 transition"
                        >
                          Харах
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>

        {preview ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              onClick={() => setPreview(null)}
              aria-label="Хаах"
            />
            <div className="relative w-full max-w-3xl">
              <GlassCard className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-extrabold text-white">
                      {preview.participantType === 'company'
                        ? preview.companyName || preview.fullName
                        : preview.receiptNumber}
                    </div>
                    <div className="mt-1 text-sm text-white/70">
                      {preview.amount.toLocaleString()}₮ · {preview.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15 transition"
                    onClick={() => setPreview(null)}
                  >
                    Хаах
                  </button>
                </div>
                <div className="mt-4 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={resolveReceiptImage(preview.receiptImage)}
                      alt="Баримт"
                      fill
                      className="object-contain bg-black/30"
                      sizes="(max-width: 1024px) 100vw, 800px"
                      unoptimized
                    />
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-semibold text-white/70">{label}</label>
      {children}
    </div>
  );
}

