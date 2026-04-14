'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Winner } from '@/types/api';
import { fetchWinners } from '@/services/winners';
import { formatDateMn } from '@/lib/utils';

export function WinnersSection() {
  const [items, setItems] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchWinners()
      .then((w) => {
        if (!mounted) return;
        setItems(w);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Ялагчдын мэдээллийг уншиж чадсангүй.');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="winners" className="px-5 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-white/70">Ялагчид</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Сугалааны азтанууд
            </h2>
          </div>
          <div className="hidden sm:block text-sm text-white/65 max-w-md text-right">
            Ялагчид шууд мэдээллийн санд хадгалагдаж, энд автоматаар шинэчлэгдэнэ.
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="text-sm text-white/70">Уншиж байна...</div>
          ) : error ? (
            <div className="text-sm text-rose-200">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-white/70">Одоогоор ялагч зарлаагүй байна.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((w, idx) => (
                <motion.div
                  key={`${w.phone}-${w.prizeName}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: idx * 0.03 }}
                >
                  <GlassCard className="p-6 relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(500px_220px_at_20%_0%,rgba(56,189,248,0.20),transparent_60%)]" />
                    <div className="relative">
                      <div className="text-xs font-semibold text-white/70">Шагнал</div>
                      <div className="mt-1 text-base font-extrabold tracking-tight text-white">{w.prizeName}</div>
                      <div className="mt-4 grid gap-1 text-sm text-white/75">
                        <div>
                          <span className="text-white/60">Нэр:</span>{' '}
                          <span className="font-semibold text-white/90">{w.winnerName}</span>
                        </div>
                        <div>
                          <span className="text-white/60">Огноо:</span>{' '}
                          <span className="font-semibold text-white/90">
                            {formatDateMn(new Date(w.drawDate))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

