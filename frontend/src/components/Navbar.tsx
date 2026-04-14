'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { MENU } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = useMemo(() => MENU, []);
  const receiptHref = '/receipt';
  const leftItems = items.filter((i) => i.href !== receiptHref);
  const receiptItem = items.find((i) => i.href === receiptHref);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-6xl">
        <div
          className={cn(
            'rounded-full bg-white/90 text-slate-900 backdrop-blur-xl ring-1 ring-black/5 transition-shadow',
            scrolled ? 'shadow-[0_18px_50px_rgba(2,6,23,0.25)]' : 'shadow-[0_12px_35px_rgba(2,6,23,0.18)]'
          )}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-3 font-extrabold tracking-tight">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo1.png"
                  alt="Лого"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full bg-white object-contain ring-1 ring-black/5"
                  priority
                />
                <Image
                  src="/logo2.png"
                  alt="Лого"
                  width={120}
                  height={40}
                  className="hidden sm:block h-8 w-auto object-contain"
                  priority
                />
              </div>
            </Link>

            <nav className="hidden lg:flex flex-1 items-center justify-center gap-5 text-sm font-semibold text-slate-700">
              {leftItems.map((it) => (
                <a
                  key={it.href}
                  href={it.href.startsWith('#') ? `/${it.href}` : it.href}
                  className={cn(
                    'transition-colors',
                    'hover:text-slate-950'
                  )}
                >
                  {it.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {receiptItem ? (
                <a
                  href={receiptItem.href}
                  className="hidden lg:inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(2,6,23,0.25)] hover:bg-slate-900/90 transition-colors"
                >
                  {receiptItem.label}
                </a>
              ) : null}
              <button
                type="button"
                className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/5 hover:bg-slate-900/10 transition"
                onClick={() => setOpen((v) => !v)}
                aria-label="Цэс"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="h-0.5 w-5 bg-slate-900" />
                  <span className="h-0.5 w-5 bg-slate-900" />
                  <span className="h-0.5 w-5 bg-slate-900" />
                </div>
              </button>
            </div>
          </div>

          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden px-4 pb-4"
            >
              <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 p-4">
                <div className="grid gap-2 text-sm font-semibold text-slate-800">
                  {items.map((it) => (
                    <a
                      key={it.href}
                      href={it.href.startsWith('#') ? `/${it.href}` : it.href}
                      className={cn(
                        'rounded-2xl px-3 py-2 transition',
                        it.href === receiptHref ? 'bg-slate-900 text-white hover:bg-slate-900/90' : 'hover:bg-slate-900/5'
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {it.label}
                    </a>
                  ))}
                </div>
                <div className="mt-3">
                  {/* No separate CTA: "Баримт оруулах" is highlighted in menu */}
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

