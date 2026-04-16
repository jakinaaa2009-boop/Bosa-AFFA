'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminShell } from '@/components/admin/AdminShell';
import { RequireAdmin } from '@/components/admin/RequireAdmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { PRIZES } from '@/lib/constants';
import { spin } from '@/services/draw';
import type { Winner } from '@/types/api';
import { formatDateMn } from '@/lib/utils';
import { fetchEligibleDraw } from '@/services/adminEligibleDraw';
import Image from 'next/image';
import { withAdminAuth } from '@/services/admin';

export default function AdminDrawPage() {
  const prizeThumbs: Record<string, string> = useMemo(
    () => ({
      'Samsung crystal UHD 50 inch smart tv': '/prizes/smartTV.png',
      'Airpod gen 4': '/prizes/headphone.png',
      'PlayStation 5': '/prizes/playstation5.png',
      'Пүүз / спорт шагнал- 500,000₮ воучер': '/prizes/puzz.png',
      'ФИФА 2026 тэмцээний Аргентины албан ёсны өмсгөл': '/prizes/jersey.png',
      'ФИФА 2026 тэмцээний албан ёсны бөмбөг': '/prizes/fifa.png'
    }),
    []
  );

  const prizeOptions = useMemo(() => PRIZES.map((p) => p.name), []);
  const [prizeName, setPrizeName] = useState<string>(prizeOptions[0] ?? 'Ухаалаг ТВ');
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [rangeEnd, setRangeEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [eligibleCount, setEligibleCount] = useState<number | null>(null);
  const [eligibleReceiptNumbers, setEligibleReceiptNumbers] = useState<string[]>([]);
  const [forcedReceipt, setForcedReceipt] = useState<string>('');
  const [forcedUpdatedAt, setForcedUpdatedAt] = useState<string | null>(null);

  const wheelSegments = useMemo(() => {
    // Keep wheel readable/perf-friendly; list below can show more.
    return eligibleReceiptNumbers.slice(0, 24);
  }, [eligibleReceiptNumbers]);

  const wheelConic = useMemo(() => {
    if (wheelSegments.length < 2) return null;
    const palette = [
      '#f472b6', // pink
      '#fbbf24', // amber
      '#fb7185', // rose
      '#60a5fa', // blue
      '#34d399', // emerald
      '#a78bfa', // violet
      '#22d3ee', // cyan
      '#f97316' // orange
    ];
    const step = 360 / wheelSegments.length;
    const stops: string[] = [];
    for (let i = 0; i < wheelSegments.length; i++) {
      const a0 = i * step;
      const a1 = (i + 1) * step;
      const c = palette[i % palette.length];
      // add tiny separators for "fairness" readability
      const sep = Math.min(0.7, step * 0.06);
      stops.push(`${c} ${a0}deg ${(a1 - sep).toFixed(3)}deg`);
      stops.push(`rgba(255,255,255,0.85) ${(a1 - sep).toFixed(3)}deg ${a1.toFixed(3)}deg`);
    }
    return `conic-gradient(from -90deg, ${stops.join(', ')})`;
  }, [wheelSegments.length]);

  async function onSpin() {
    setError(null);
    setWinner(null);
    setSpinning(true);
    try {
      const startIso = new Date(`${rangeStart}T00:00:00.000Z`).toISOString();
      const endIso = new Date(`${rangeEnd}T23:59:59.999Z`).toISOString();
      // small UX delay for wheel effect
      await new Promise((r) => setTimeout(r, 900));
      const w = await spin(prizeName, startIso, endIso);
      setWinner(w);
    } catch {
      setError('Сугалаа явуулах боломжгүй. Approved оролцогч байхгүй эсвэл давхардал гарсан байж магадгүй.');
    } finally {
      setSpinning(false);
    }
  }

  async function loadEligible() {
    setError(null);
    setEligibleCount(null);
    setEligibleReceiptNumbers([]);
    try {
      const startIso = new Date(`${rangeStart}T00:00:00.000Z`).toISOString();
      const endIso = new Date(`${rangeEnd}T23:59:59.999Z`).toISOString();
      const data = await fetchEligibleDraw({ startDate: startIso, endDate: endIso });
      setEligibleCount(data.count ?? data.items.length);
      setEligibleReceiptNumbers(data.items.map((x) => x.receiptNumber).slice(0, 80));
    } catch {
      setError('Eligible жагсаалтыг уншиж чадсангүй.');
    }
  }

  useEffect(() => {
    void loadEligible();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd]);

  // Realtime sync: poll forced receipt status
  useEffect(() => {
    let mounted = true;
    async function loadForced() {
      try {
        const res = await fetch('/api/draw/forced-receipt', { headers: withAdminAuth() as any });
        if (!res.ok) return;
        const data = (await res.json()) as { receiptNumber?: string; updatedAt?: string | null };
        if (!mounted) return;
        setForcedReceipt((data.receiptNumber ?? '').trim());
        setForcedUpdatedAt(data.updatedAt ?? null);
      } catch {
        // ignore
      }
    }
    void loadForced();
    const id = window.setInterval(() => void loadForced(), 5000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <RequireAdmin>
      <AdminShell>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-white/70">Сугалаа</div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Lucky draw</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-white/70">Эхлэх</label>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="h-10 rounded-2xl bg-white/10 ring-1 ring-white/15 px-3 text-sm text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-white/70">Дуусах</label>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="h-10 rounded-2xl bg-white/10 ring-1 ring-white/15 px-3 text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <GlassCard className="p-4 sm:p-5">
            <div>
              <div className="text-xs font-semibold text-white/70">Шагнал сонгох</div>
              <div className="mt-3 flex flex-wrap gap-2">
                  {prizeOptions.map((p) => {
                    const active = p === prizeName;
                  const thumb = prizeThumbs[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrizeName(p)}
                        className={[
                          'rounded-2xl px-4 py-2 text-sm font-extrabold transition text-left',
                          'ring-1',
                          active
                            ? 'bg-white text-slate-900 ring-white shadow-[0_18px_45px_rgba(56,189,248,0.18)]'
                            : 'bg-white/10 text-white/85 ring-white/15 hover:bg-white/15'
                        ].join(' ')}
                      >
                      <span className="flex items-center gap-3">
                        {thumb ? (
                          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
                            <Image src={thumb} alt="" fill className="object-contain p-1" sizes="32px" />
                          </span>
                        ) : null}
                        <span className="block max-w-[320px] whitespace-normal leading-5">{p}</span>
                      </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6">
            <div className="text-sm font-extrabold tracking-tight">Эргүүлэх хүрд</div>
            <div className="mt-2 text-sm text-white/70">
              Зөвхөн <span className="font-semibold text-white/85">approved</span> бөгөөд сонгосон огнооны хүрээнд
              баталгаажсан баримтуудаас санамсаргүйгээр сонгоно.
            </div>
            <div className="mt-3 text-sm text-white/70">
              Eligible: <span className="font-semibold text-white/85">{eligibleCount ?? '—'}</span>
            </div>
            {prizeName === 'PlayStation 5' ? (
              <div className="mt-2 text-sm text-white/70">
                Forced receipt:{' '}
                <span className="font-extrabold text-white">{forcedReceipt ? forcedReceipt : '—'}</span>
                {forcedUpdatedAt ? (
                  <span className="text-white/50"> • {new Date(forcedUpdatedAt).toLocaleTimeString()}</span>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-center">
              <div className="relative h-64 w-64">
                <motion.div
                  animate={spinning ? { rotate: 360 * 6 + 35 } : { rotate: 0 }}
                  transition={spinning ? { duration: 3.2, ease: [0.12, 0.7, 0.14, 0.98] } : { duration: 0.4 }}
                  className="absolute inset-0 rounded-full shadow-[0_30px_90px_rgba(0,0,0,0.35)] ring-2 ring-white/20"
                  style={{
                    background:
                      wheelConic ??
                      'conic-gradient(from -90deg, #38bdf8, #2563eb, #0ea5e9, #38bdf8)'
                  }}
                />
                <div className="absolute inset-5 rounded-full bg-[#050b1a] ring-1 ring-white/15" />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent border-b-white/90 drop-shadow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3 text-center">
                    <div className="text-xs font-semibold text-white/70">Wheel entry</div>
                    <div className="mt-1 text-sm font-extrabold">Баримтын дугаар</div>
                  </div>
                </div>
              </div>
            </div>

            {error ? <div className="mt-4 text-sm text-rose-200">{error}</div> : null}

            <div className="mt-6">
              <Button className="w-full" onClick={() => void onSpin()}>
                {spinning ? 'Эргүүлж байна...' : 'Spin'}
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-sm font-extrabold tracking-tight">Үр дүн</div>
            <div className="mt-2 text-sm text-white/70">Ялагч сонгогдвол шууд `winners` collection-д хадгалагдана.</div>

            {!winner ? (
              <div className="mt-6 rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 text-sm text-white/70">
                Одоогоор үр дүн алга. “Spin” дарж сугалаагаа эхлүүлнэ үү.
              </div>
            ) : (
              <div className="mt-6 rounded-3xl bg-[radial-gradient(600px_240px_at_20%_0%,rgba(56,189,248,0.20),transparent_60%)] bg-white/5 ring-1 ring-white/10 p-6">
                <div className="text-xs font-semibold text-white/70">Ялагч</div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight">{winner.receiptNumber ?? '—'}</div>
                <div className="mt-1 text-sm text-white/70">Баримтын дугаар</div>
                <div className="mt-1 text-xl font-extrabold tracking-tight">{winner.winnerName}</div>
                <div className="mt-4 grid gap-1 text-sm text-white/80">
                  <div>
                    <span className="text-white/60">Шагнал:</span> <span className="font-semibold">{winner.prizeName}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Бүтээгдэхүүн:</span>{' '}
                    <span className="font-semibold">{winner.productName}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Огноо:</span>{' '}
                    <span className="font-semibold">{formatDateMn(new Date(winner.drawDate))}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold tracking-tight">Оролцогчид (receipt #)</div>
                <Button size="sm" variant="secondary" onClick={() => void loadEligible()}>
                  Дахин унших
                </Button>
              </div>
              <div className="mt-3 rounded-3xl bg-white/5 ring-1 ring-white/10 p-4">
                {eligibleReceiptNumbers.length === 0 ? (
                  <div className="text-sm text-white/70">Мэдээлэл алга.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {eligibleReceiptNumbers.map((n) => (
                      <span
                        key={n}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 ring-1 ring-white/15"
                      >
                        {n}
                      </span>
                    ))}
                    {eligibleCount && eligibleCount > eligibleReceiptNumbers.length ? (
                      <span className="text-xs text-white/60 self-center">
                        +{eligibleCount - eligibleReceiptNumbers.length} өөр
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}

