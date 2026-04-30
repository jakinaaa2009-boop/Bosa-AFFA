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
import type { EligibleDrawItem } from '@/services/adminEligibleDraw';
import { resetAllUsersEligibility, setUserEligibilityByPhone } from '@/services/adminUsers';
import Image from 'next/image';

type PoolEntry = {
  id: string;
  displayLabel: string;
  receiptNumber?: string;
  companyName?: string;
  participantType?: EligibleDrawItem['participantType'];
  chances: number;
};
type WheelSlice = { label: string; chances: number; color: string };

function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

export default function AdminDrawPage() {
  const prizeThumbs: Record<string, string> = useMemo(
    () => ({
      'Samsung crystal UHD 50 inch smart tv': '/prizes/smartTV.png',
      'Airpod gen 4': '/prizes/headphone.png',
      'PlayStation 5': '/prizes/playstation5.png',
      'Пүүз / спорт шагнал- 500,000₮ воучер': '/prizes/puuz2.png',
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
  const [eligibleReceiptCount, setEligibleReceiptCount] = useState<number | null>(null);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [showAllPool, setShowAllPool] = useState(false);
  const [resetting, setResetting] = useState(false);

  const wheelSlices = useMemo<WheelSlice[]>(() => {
    // Dynamic slices: each participant is a slice whose angle is proportional to chances (эрх).
    // Limit slice count so the wheel stays readable.
    const maxSlices = 60;
    const sorted = [...poolEntries]
      .filter((x) => x.displayLabel && x.chances > 0)
      .sort((a, b) => b.chances - a.chances || a.displayLabel.localeCompare(b.displayLabel));

    const slices = sorted.slice(0, maxSlices);
    const total = slices.reduce((sum, x) => sum + x.chances, 0);
    if (total <= 0) return [];

    const maxChance = slices[0]?.chances ?? 1;
    const minChance = slices[slices.length - 1]?.chances ?? 1;
    const denom = Math.max(1, maxChance - minChance);

    return slices.map((x) => {
      const baseHue = hashString(x.displayLabel) % 360;
      // More эрх => a bit brighter/more saturated.
      const t = clamp((x.chances - minChance) / denom, 0, 1);
      const sat = 60 + t * 25;
      const light = 48 + t * 10;
      return { label: x.displayLabel, chances: x.chances, color: hsl(baseHue, sat, light) };
    });
  }, [poolEntries]);

  const wheelConic = useMemo(() => {
    if (wheelSlices.length < 2) return null;
    const total = wheelSlices.reduce((sum, x) => sum + x.chances, 0);
    if (total <= 0) return null;

    const stops: string[] = [];
    let a = 0;
    for (const s of wheelSlices) {
      const span = (s.chances / total) * 360;
      const a0 = a;
      const a1 = a + span;
      // Separator size scales with slice size but stays subtle.
      const sep = Math.min(0.9, Math.max(0.25, span * 0.03));
      stops.push(`${s.color} ${a0.toFixed(3)}deg ${(a1 - sep).toFixed(3)}deg`);
      stops.push(`rgba(255,255,255,0.85) ${(a1 - sep).toFixed(3)}deg ${a1.toFixed(3)}deg`);
      a = a1;
    }
    return `conic-gradient(from -90deg, ${stops.join(', ')})`;
  }, [wheelSlices]);

  async function onSpin() {
    setError(null);
    setWinner(null);
    setSpinning(true);
    try {
      const startIso = new Date(`${rangeStart}T00:00:00.000Z`).toISOString();
      const endIso = new Date(`${rangeEnd}T23:59:59.999Z`).toISOString();
      // small UX delay for wheel effect
      await new Promise((r) => setTimeout(r, 900));
      const data = await spin(prizeName, startIso, endIso);
      setWinner(data.winner);
      await loadEligible(); // refresh pool so winner disappears immediately
    } catch {
      setError('Сугалаа явуулах боломжгүй. Approved оролцогч байхгүй эсвэл давхардал гарсан байж магадгүй.');
    } finally {
      setSpinning(false);
    }
  }

  async function loadEligible() {
    setError(null);
    setEligibleCount(null);
    setEligibleReceiptCount(null);
    setPoolEntries([]);
    try {
      const startIso = new Date(`${rangeStart}T00:00:00.000Z`).toISOString();
      const endIso = new Date(`${rangeEnd}T23:59:59.999Z`).toISOString();
      const data = await fetchEligibleDraw({ startDate: startIso, endDate: endIso });
      setEligibleCount(data.count ?? 0);
      setEligibleReceiptCount(data.receiptCount ?? data.items.length);
      const entries: PoolEntry[] = (data.items as EligibleDrawItem[])
        .map((it, idx) => {
          const rawId = it.id ?? it._id;
          const label = it.displayLabel || it.receiptNumber || `оролцогч-${idx}`;
          const id =
            rawId != null && String(rawId).trim() !== ''
              ? String(rawId)
              : `pool-${idx}-${label}`;
          return {
            id,
            displayLabel: label,
            receiptNumber: it.receiptNumber,
            companyName: it.companyName,
            participantType: it.participantType,
            chances: Math.min(Math.max(0, it.chances), 10_000)
          };
        })
        .filter((x) => x.chances > 0)
        .sort((a, b) => b.chances - a.chances || a.displayLabel.localeCompare(b.displayLabel));
      setPoolEntries(entries);
    } catch {
      setError('Eligible жагсаалтыг уншиж чадсангүй.');
    }
  }

  useEffect(() => {
    void loadEligible();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd]);

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
              баталгаажсан баримтуудаас сонгоно. Нэг бараанд нэг эрх: олон бараа = олон эрх (жинтэй санамсаргүй).
            </div>
            <div className="mt-3 text-sm text-white/70">
              Нийт эрх (pool): <span className="font-semibold text-white/85">{eligibleCount ?? '—'}</span>
              {eligibleReceiptCount != null ? (
                <>
                  {' '}
                  · Баримтын тоо: <span className="font-semibold text-white/85">{eligibleReceiptCount}</span>
                </>
              ) : null}
            </div>

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
                    <div className="mt-1 text-sm font-extrabold">Эрхийн жин</div>
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
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold tracking-tight">Үр дүн</div>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => {
                  setWinner(null);
                  setError(null);
                }}
              >
                Цэвэрлэх
              </Button>
            </div>
            <div className="mt-2 text-sm text-white/70">Ялагч сонгогдвол шууд `winners` collection-д хадгалагдана.</div>

            {!winner ? (
              <div className="mt-6 rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 text-sm text-white/70">
                Одоогоор үр дүн алга. “Spin” дарж сугалаагаа эхлүүлнэ үү.
              </div>
            ) : (
              <div className="mt-6 rounded-3xl bg-[radial-gradient(600px_240px_at_20%_0%,rgba(56,189,248,0.20),transparent_60%)] bg-white/5 ring-1 ring-white/10 p-6">
                <div className="text-xs font-semibold text-white/70">Ялагч</div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight">
                  {winner.displayLabel ??
                    winner.receiptNumber ??
                    winner.companyName ??
                    winner.winnerName ??
                    '—'}
                </div>
                <div className="mt-1 text-sm text-white/70">
                  {winner.participantType === 'company' ? 'Компани (ялагч)' : 'Баримтын дугаар (ялагч)'}
                </div>
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

                {winner.phone ? (
                  <div className="mt-5">
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={async () => {
                        try {
                          await setUserEligibilityByPhone({ phone: winner.phone, hasWon: false });
                          await loadEligible();
                        } catch {
                          setError('Ялагчийн эрхийг reset хийж чадсангүй.');
                        }
                      }}
                    >
                      Энэ хэрэглэгчийг дахин eligible болгох (reset)
                    </Button>
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold tracking-tight">Pool (баримт × эрхийн тоо)</div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className={resetting ? 'opacity-60 pointer-events-none' : undefined}
                    onClick={async () => {
                      try {
                        setResetting(true);
                        await resetAllUsersEligibility();
                        await loadEligible();
                      } catch {
                        setError('Reset хийж чадсангүй.');
                      } finally {
                        setResetting(false);
                      }
                    }}
                  >
                    Reset
                  </Button>
                  <Button size="sm" variant="secondary" type="button" onClick={() => setShowAllPool((v) => !v)}>
                    Бүгдийг харах
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void loadEligible()}>
                    Дахин унших
                  </Button>
                </div>
              </div>
              <div className="mt-3 rounded-3xl bg-white/5 ring-1 ring-white/10 p-4">
                {poolEntries.length === 0 ? (
                  <div className="text-sm text-white/70">Мэдээлэл алга.</div>
                ) : (
                  <>
                    {showAllPool ? (
                      <div className="max-h-[420px] overflow-auto pr-1">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-3 text-[0.7rem] font-extrabold tracking-tight text-white/60">
                            <div>Receipt #</div>
                            <div>Company name</div>
                            <div className="text-right">Эрх</div>
                          </div>
                          {poolEntries.map((e, index) => (
                            <div
                              key={`${e.id}-${index}`}
                              className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10 text-xs text-white/85"
                            >
                              <div className="min-w-0 truncate font-extrabold">
                                {e.participantType === 'company' ? '—' : (e.receiptNumber ?? e.displayLabel ?? '—')}
                              </div>
                              <div className="min-w-0 truncate font-extrabold">
                                {e.participantType === 'company' ? (e.companyName ?? e.displayLabel ?? '—') : '—'}
                              </div>
                              <div className="text-right font-extrabold text-emerald-200/95 tabular-nums">
                                {e.chances}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {poolEntries.slice(0, 80).map((e, index) => (
                          <span
                            key={`${e.id}-${index}`}
                            className="inline-flex items-baseline gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/15"
                          >
                            <span className="font-extrabold tracking-tight">{e.displayLabel}</span>
                            <span className="text-[0.7rem] font-bold text-white/50">×</span>
                            <span className="font-extrabold text-emerald-200/95 tabular-nums">{e.chances}</span>
                          </span>
                        ))}
                        {poolEntries.length > 80 ? (
                          <span className="text-xs text-white/60 self-center">
                            +{poolEntries.length - 80} баримт
                          </span>
                        ) : null}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}

