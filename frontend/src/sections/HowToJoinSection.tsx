'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/GlassCard';

const steps = [
  { title: 'Бүтээгдэхүүнээ авна', desc: 'Урамшуулалд хамрагдах бүтээгдэхүүнээс сонгон худалдан авна.', img: '/guide/sug1.png' },
  { title: 'Баримтаа бүртгэнэ', desc: 'НӨАТ-ын баримтын зургаа веб сайтад оруулна.', img: '/guide/sug2.png' },
  { title: 'Баталгаат шагнал', desc: 'Баримтыг админ шалгаж баталгаажуулна.', img: '/guide/sug3.png' },
  { title: 'Супер шагнал', desc: 'Зөвшөөрөгдсөн баримт бүр сугалаанд нэг эрх болно.', img: '/guide/sug4.png' }
] as const;

export function HowToJoinSection() {
  return (
    <section id="how-to-join" className="px-5 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-white/70">Алхамууд</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Хэрхэн оролцох вэ?
            </h2>
          </div>
          <div className="hidden sm:block text-sm text-white/65 max-w-md text-right">
            Хялбар 4 алхам. Баримтаа оруулаад азтан болоорой.
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
            >
              <GlassCard className="h-full overflow-hidden p-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-[radial-gradient(420px_220px_at_20%_0%,rgba(56,189,248,0.18),transparent_60%)]" />
                  <div className="relative px-5 pt-5">
                    <div className="text-xs font-bold text-white/70">Алхам {idx + 1}</div>
                  </div>

                  <motion.div
                    whileHover={{ y: -2, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                    className="relative mt-3 px-5 pb-4"
                  >
                    <div className="rounded-3xl bg-white/8 ring-1 ring-white/12 p-4 shadow-[0_18px_45px_rgba(2,6,23,0.45)]">
                      <div className="relative aspect-[16/10] w-full">
                        <Image
                          src={s.img}
                          alt={s.title}
                          fill
                          priority={idx < 2}
                          className="object-contain"
                          sizes="(max-width: 1024px) 100vw, 25vw"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="px-5 pb-6">
                  <div className="text-base font-extrabold tracking-tight text-white">{s.title}</div>
                  <div className="mt-2 text-sm leading-6 text-white/70">{s.desc}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

