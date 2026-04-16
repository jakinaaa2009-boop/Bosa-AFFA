'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { PRIZES } from '@/lib/constants';

const prizeImages: Record<string, string> = {
  'Samsung crystal UHD 50 inch smart tv': '/prizes/smartTV.png',
  'Airpod gen 4': '/prizes/headphone.png',
  'PlayStation 5': '/prizes/playstation5.png',
  'Пүүз / спорт шагнал- 500,000₮ воучер': '/prizes/puzz.png',
  'ФИФА 2026 тэмцээний Аргентины албан ёсны өмсгөл': '/prizes/jersey.png',
  'ФИФА 2026 тэмцээний албан ёсны бөмбөг': '/prizes/fifa.png'
};

export function PrizesSection() {
  return (
    <section id="prizes" className="px-5 pt-12 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div>
          <div className="text-xs font-semibold text-white/70">ШАГНАЛЫН САН</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Шагналууд / Prize Pool
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
            Оролцогч нь дээрх хугацаанд худалдан авалт хийж, НӨАТ-ын баримтаа вэб сайтад бүртгүүлсэн байх шаардлагатай.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRIZES.map((p, idx) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
              >
                <GlassCard className="group h-full overflow-hidden p-0">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(520px_260px_at_15%_10%,rgba(56,189,248,0.20),transparent_60%)]" />
                  <div className="relative p-6">
                    <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-4">
                      <div className="relative aspect-[16/9] w-full">
                        <Image
                          src={prizeImages[p.name] ?? '/prizes/gift.png'}
                          alt={p.name}
                          fill
                          className="object-contain drop-shadow-[0_16px_40px_rgba(2,6,23,0.55)] transition-transform duration-200 group-hover:scale-[1.02]"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-base font-extrabold tracking-tight text-white">{p.name}</div>
                      </div>
                      <div className="shrink-0 rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-[0_18px_45px_rgba(56,189,248,0.16)]">
                        x{p.qty}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

