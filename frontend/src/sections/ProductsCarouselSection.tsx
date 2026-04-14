'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

type ProductItem = { name: string; image: string };

const products: ProductItem[] = Array.from({ length: 21 }, (_, i) => {
  const n = i + 1;
  return { name: `Бүтээгдэхүүн ${n}`, image: `/products/product${n}.png` };
});

export function ProductsCarouselSection() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);

  const items = useMemo(() => products, []);

  function scrollByCards(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9) * dir;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onPointerEnter = () => setPaused(true);
    const onPointerLeave = () => setPaused(false);
    const onTouchStart = () => setPaused(true);
    const onTouchEnd = () => setPaused(false);

    el.addEventListener('pointerenter', onPointerEnter);
    el.addEventListener('pointerleave', onPointerLeave);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('pointerenter', onPointerEnter);
      el.removeEventListener('pointerleave', onPointerLeave);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const el = scrollerRef.current;
    if (!el) return;

    const stepPx = 1; // smooth speed
    const tickMs = 18; // ~55fps

    const id = window.setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;

      // Loop back when reaching the end
      if (el.scrollLeft >= max - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollLeft += stepPx;
      }
    }, tickMs);

    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section id="products" className="px-5 pt-10 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-white/70">Урамшууллын бүтээгдэхүүнүүд</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Бүтээгдэхүүнүүд
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15 transition"
              aria-label="Өмнөх"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15 transition"
              aria-label="Дараах"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-6 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#050b1a] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#050b1a] to-transparent" />

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((p, idx) => (
              <motion.div
                key={p.image}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: Math.min(0.18, idx * 0.01) }}
                className="snap-start shrink-0 w-[240px] sm:w-[280px]"
              >
                <GlassCard className={cn('p-5 group')}>
                  <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-4">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-contain drop-shadow-[0_16px_40px_rgba(2,6,23,0.55)] transition-transform duration-200 group-hover:scale-[1.03]"
                        sizes="280px"
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-sm font-extrabold tracking-tight text-white">{p.name}</div>
                  <div className="mt-1 text-xs text-white/65">Урамшуулалд хамрагдана</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

