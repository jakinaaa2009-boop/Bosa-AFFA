'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { RequireAdmin } from '@/components/admin/RequireAdmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { fetchUsersStats, type AgeStats, type SubmissionStats } from '@/services/adminUsers';

export default function AdminDashboardPage() {
  const [ageStats, setAgeStats] = useState<AgeStats | null>(null);
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats | null>(null);
  const [topUser, setTopUser] = useState<any | null>(null);
  const [ageLoading, setAgeLoading] = useState(true);
  const [ageError, setAgeError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setAgeLoading(true);
    setAgeError(null);
    fetchUsersStats()
      .then((s) => {
        if (!mounted) return;
        setAgeStats(s.ageStats ?? null);
        setSubmissionStats(s.submissionStats ?? null);
        setTopUser(s.topUser ?? null);
      })
      .catch(() => {
        if (!mounted) return;
        setAgeError('Статистик уншиж чадсангүй.');
      })
      .finally(() => {
        if (!mounted) return;
        setAgeLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const buckets = useMemo(() => {
    if (!ageStats) return [];
    return [
      { label: '<18', v: ageStats.under18 },
      { label: '18–24', v: ageStats.a18_24 },
      { label: '25–34', v: ageStats.a25_34 },
      { label: '35–44', v: ageStats.a35_44 },
      { label: '45+', v: ageStats.a45plus }
    ];
  }, [ageStats]);

  const maxV = useMemo(() => Math.max(1, ...buckets.map((b) => b.v)), [buckets]);

  const receiptBuckets = useMemo(() => {
    if (!submissionStats) return [];
    return [
      { label: '0', v: submissionStats.b0 },
      { label: '1', v: submissionStats.b1 },
      { label: '2–3', v: submissionStats.b2_3 },
      { label: '4–5', v: submissionStats.b4_5 },
      { label: '6–10', v: submissionStats.b6_10 },
      { label: '11+', v: submissionStats.b11plus }
    ];
  }, [submissionStats]);

  const maxR = useMemo(() => Math.max(1, ...receiptBuckets.map((b) => b.v)), [receiptBuckets]);

  return (
    <RequireAdmin>
      <AdminShell>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GlassCard className="p-6">
            <div className="text-xs font-semibold text-white/70">Товч</div>
            <div className="mt-2 text-lg font-extrabold">Хяналтын самбар</div>
            <div className="mt-2 text-sm text-white/70">
              Баримтуудыг баталгаажуулж, сугалаа эргүүлж, ялагчдыг хадгална.
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-xs font-semibold text-white/70">Зөвлөгөө</div>
            <div className="mt-2 text-sm text-white/75">1) Баримтууд → Approved болгоно</div>
            <div className="mt-1 text-sm text-white/75">2) Сугалаа → Шагнал сонгоод Spin</div>
            <div className="mt-1 text-sm text-white/75">3) Ялагчид → Нийтэд харагдана</div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-xs font-semibold text-white/70">Анхаар</div>
            <div className="mt-2 text-sm text-white/75">
              Нэг submission нэг шагнал дээр дахин ялагч болохгүй (backend хамгаалалттай).
            </div>
          </GlassCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-6 overflow-hidden">
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-xs font-semibold text-white/70">Хэрэглэгчид</div>
                <div className="mt-2 text-lg font-extrabold tracking-tight">Насны статистик</div>
              </div>
              {ageStats ? (
                <div className="text-sm text-white/70">
                  Дундаж: <span className="font-extrabold text-white">{Math.round(ageStats.avgAge)}</span>
                </div>
              ) : null}
            </div>

            {ageLoading ? (
              <div className="mt-6 text-sm text-white/70">Уншиж байна...</div>
            ) : ageError ? (
              <div className="mt-6 text-sm text-rose-200">{ageError}</div>
            ) : !ageStats ? (
              <div className="mt-6 text-sm text-white/70">Мэдээлэл алга.</div>
            ) : (
              <div className="mt-6">
                <div className="grid grid-cols-5 gap-3 items-end">
                  {buckets.map((b) => (
                    <div key={b.label} className="flex flex-col items-center gap-2">
                      <div className="relative h-28 w-full">
                        <div className="absolute inset-x-0 bottom-0 h-full rounded-2xl bg-white/5 ring-1 ring-white/10" />
                        <div
                          className="absolute inset-x-0 bottom-0 rounded-2xl bg-[linear-gradient(180deg,rgba(56,189,248,0.9),rgba(37,99,235,0.9))] ring-1 ring-white/15 shadow-[0_18px_45px_rgba(56,189,248,0.16)]"
                          style={{ height: `${Math.round((b.v / maxV) * 100)}%` }}
                        />
                        <div className="absolute inset-x-0 top-2 text-center text-xs font-extrabold text-white drop-shadow">
                          {b.v}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-white/70">{b.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                    Нийт: {ageStats.count}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                    Min/Max: {ageStats.minAge}/{ageStats.maxAge}
                  </span>
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 overflow-hidden">
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-xs font-semibold text-white/70">Баримтууд</div>
                <div className="mt-2 text-lg font-extrabold tracking-tight">Хэрэглэгч бүрийн баримтын тоо</div>
              </div>
              {submissionStats ? (
                <div className="text-sm text-white/70">
                  Дундаж: <span className="font-extrabold text-white">{submissionStats.avgReceipts.toFixed(1)}</span>
                </div>
              ) : null}
            </div>

            {ageLoading ? (
              <div className="mt-6 text-sm text-white/70">Уншиж байна...</div>
            ) : ageError ? (
              <div className="mt-6 text-sm text-rose-200">{ageError}</div>
            ) : !submissionStats ? (
              <div className="mt-6 text-sm text-white/70">Мэдээлэл алга.</div>
            ) : (
              <div className="mt-6">
                <div className="grid grid-cols-6 gap-3 items-end">
                  {receiptBuckets.map((b) => (
                    <div key={b.label} className="flex flex-col items-center gap-2">
                      <div className="relative h-28 w-full">
                        <div className="absolute inset-x-0 bottom-0 h-full rounded-2xl bg-white/5 ring-1 ring-white/10" />
                        <div
                          className="absolute inset-x-0 bottom-0 rounded-2xl bg-[linear-gradient(180deg,rgba(34,211,238,0.9),rgba(56,189,248,0.9))] ring-1 ring-white/15 shadow-[0_18px_45px_rgba(34,211,238,0.14)]"
                          style={{ height: `${Math.round((b.v / maxR) * 100)}%` }}
                        />
                        <div className="absolute inset-x-0 top-2 text-center text-xs font-extrabold text-white drop-shadow">
                          {b.v}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-white/70">{b.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                    Min/Max: {submissionStats.minReceipts}/{submissionStats.maxReceipts}
                  </span>
                  {topUser ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                      Max user: {topUser.fullName} ({topUser.totalSubmissions})
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}

