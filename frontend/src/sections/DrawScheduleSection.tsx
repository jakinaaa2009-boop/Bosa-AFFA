'use client';

import { GlassCard } from '@/components/ui/GlassCard';

type Row = {
  no: number;
  date: string; // YYYY-MM-DD
  day: string;
  tv: number;
  headphone: number;
  ps5: number;
  boots: number;
  jersey: number;
  ball: number;
};

const rows: Row[] = [
  { no: 1, date: '2026-04-30', day: 'Пүрэв', tv: 1, headphone: 0, ps5: 1, boots: 1, jersey: 0, ball: 0 },
  { no: 2, date: '2026-05-15', day: 'Баасан', tv: 1, headphone: 0, ps5: 1, boots: 1, jersey: 0, ball: 0 },
  { no: 3, date: '2026-05-29', day: 'Баасан', tv: 1, headphone: 1, ps5: 1, boots: 1, jersey: 2, ball: 2 },
  { no: 4, date: '2026-06-15', day: 'Даваа', tv: 1, headphone: 0, ps5: 1, boots: 1, jersey: 2, ball: 2 },
  { no: 5, date: '2026-06-30', day: 'Мягмар', tv: 1, headphone: 1, ps5: 1, boots: 1, jersey: 2, ball: 2 },
  { no: 6, date: '2026-07-15', day: 'Лхагва', tv: 1, headphone: 0, ps5: 1, boots: 1, jersey: 4, ball: 4 },
  { no: 7, date: '2026-07-31', day: 'Баасан', tv: 1, headphone: 1, ps5: 1, boots: 1, jersey: 4, ball: 4 }
];

export function DrawScheduleSection() {
  return (
    <section id="schedule" className="px-5 pt-12 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-white/70">Сугалааны хуваарь</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Тохирлын хүснэгт</h2>
          </div>
          <div className="hidden sm:block text-sm text-white/65 max-w-md text-right">
            Тохирол бүрт хэдэн шагнал сугалаалахыг доорх хүснэгтээс харна.
          </div>
        </div>

        <div className="mt-6">
          <GlassCard className="p-0 overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(900px_380px_at_15%_0%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(700px_320px_at_80%_20%,rgba(37,99,235,0.10),transparent_60%)]" />
            <div className="relative overflow-x-auto p-4 sm:p-5">
              <table className="min-w-[980px] w-full text-sm border-separate border-spacing-y-2">
                <thead className="sticky top-0 z-10">
                  <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:text-[11px] [&>th]:font-extrabold [&>th]:tracking-tight [&>th]:text-white/80 [&>th]:whitespace-nowrap">
                    <th>
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                        Тохирол №
                      </span>
                    </th>
                    <th>
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                        Огноо
                      </span>
                    </th>
                    <th>
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                        Гараг
                      </span>
                    </th>
                    <th className="text-center">
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                        TV
                      </span>
                    </th>
                    <th className="text-center">
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                        Headphone
                      </span>
                    </th>
                    <th className="text-center">
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                        PS5
                      </span>
                    </th>
                    <th className="text-center">
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                        Football boots
                      </span>
                    </th>
                    <th className="text-center">
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                        Jersey Argentina
                      </span>
                    </th>
                    <th className="text-center">
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 backdrop-blur">
                        Soccer ball
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.no}
                      className="group"
                    >
                      <td className="px-3 py-3 font-extrabold text-white/90 bg-white/[0.04] ring-1 ring-white/10 rounded-l-2xl group-hover:bg-white/[0.06] transition">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 px-2 tabular-nums">
                          {r.no}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-white/85 tabular-nums bg-white/[0.04] ring-1 ring-white/10 group-hover:bg-white/[0.06] transition">
                        {r.date}
                      </td>
                      <td className="px-3 py-3 text-white/75 bg-white/[0.04] ring-1 ring-white/10 group-hover:bg-white/[0.06] transition">
                        {r.day}
                      </td>
                      <td className="px-3 py-3 text-white/85 text-center tabular-nums bg-white/[0.04] ring-1 ring-white/10 group-hover:bg-white/[0.06] transition">
                        <span className="inline-flex rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 font-semibold">
                          {r.tv}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-white/85 text-center tabular-nums bg-white/[0.04] ring-1 ring-white/10 group-hover:bg-white/[0.06] transition">
                        <span className="inline-flex rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 font-semibold">
                          {r.headphone}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-white/85 text-center tabular-nums bg-white/[0.04] ring-1 ring-white/10 group-hover:bg-white/[0.06] transition">
                        <span className="inline-flex rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 font-semibold">
                          {r.ps5}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-white/85 text-center tabular-nums bg-white/[0.04] ring-1 ring-white/10 group-hover:bg-white/[0.06] transition">
                        <span className="inline-flex rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 font-semibold">
                          {r.boots}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-white/85 text-center tabular-nums bg-white/[0.04] ring-1 ring-white/10 group-hover:bg-white/[0.06] transition">
                        <span className="inline-flex rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 font-semibold">
                          {r.jersey}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-white/85 text-center tabular-nums bg-white/[0.04] ring-1 ring-white/10 rounded-r-2xl group-hover:bg-white/[0.06] transition">
                        <span className="inline-flex rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 font-semibold">
                          {r.ball}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

