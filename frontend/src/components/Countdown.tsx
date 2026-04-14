'use client';

import { useEffect, useMemo, useState } from 'react';

function diffParts(target: Date, now: Date) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, done: ms === 0 };
}

export function Countdown({ endIso }: { endIso: string }) {
  const target = useMemo(() => new Date(endIso), [endIso]);
  // Avoid hydration mismatch: don't render time-dependent numbers until mounted.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const p = now ? diffParts(target, now) : null;

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      <TimeBox label="Өдөр" value={p?.days} />
      <TimeBox label="Цаг" value={p?.hours} />
      <TimeBox label="Мин" value={p?.minutes} />
      <TimeBox label="Сек" value={p?.seconds} />
      {p?.done ? <div className="col-span-4 mt-2 text-xs text-white/70">Кампанит хугацаа дууссан.</div> : null}
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-2xl bg-white/10 ring-1 ring-white/15 px-3 py-3 text-center backdrop-blur-xl">
      <div
        className="text-2xl font-extrabold tabular-nums tracking-tight text-white"
        suppressHydrationWarning
      >
        {typeof value === 'number' ? String(value).padStart(2, '0') : '--'}
      </div>
      <div className="mt-1 text-[11px] font-semibold text-white/70">{label}</div>
    </div>
  );
}

