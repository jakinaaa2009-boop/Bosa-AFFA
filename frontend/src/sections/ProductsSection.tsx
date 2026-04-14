'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { PRODUCTS } from '@/lib/constants';

export function ProductsSection() {
  return (
    <section id="products" className="px-5 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-white/70">Урамшууллын бүтээгдэхүүнүүд</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Бүтээгдэхүүнүүд
            </h2>
          </div>
          <div className="hidden sm:block text-sm text-white/65 max-w-md text-right">
            Эдгээр бүтээгдэхүүнүүдээс худалдан авалт хийж баримтаа бүртгүүлээрэй.
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, idx) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: idx * 0.03 }}
            >
              <GlassCard className="p-5 group h-full">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold tracking-tight text-white">{p.name}</div>
                  <div className="h-9 w-9 rounded-2xl bg-white/10 ring-1 ring-white/15 group-hover:bg-white/15 transition" />
                </div>
                <div className="mt-4 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
                  <div className="aspect-[16/10] p-4">
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={640}
                      height={400}
                      className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03] drop-shadow-[0_12px_30px_rgba(2,6,23,0.55)]"
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

