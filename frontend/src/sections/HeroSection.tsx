'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CAMPAIGN } from '@/lib/constants';

export function HeroSection() {
  return (
    <section id="home" className="relative w-full overflow-hidden">
      {/* Full-width dominant banner */}
      <div className="relative h-[300px] sm:h-[360px] lg:h-[500px]">
        <Image
          src="/banner.jpg"
          alt="Кампанит баннер"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_450px_at_20%_20%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(700px_380px_at_70%_30%,rgba(37,99,235,0.14),transparent_60%)]" />

        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-6 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.05 }}
                  className="text-4xl font-extrabold tracking-tight text-white drop-shadow sm:text-5xl lg:text-6xl"
                >
                  {CAMPAIGN.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="mt-4 text-sm leading-6 text-white/80 sm:text-base lg:text-lg"
                >
                  Худалдан авалтаа хийж, НӨАТ-ын баримтаа оруулаад азтан болоорой. {CAMPAIGN.periodText}
                </motion.p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button href="#receipt" variant="primary" size="lg">
                    Баримт оруулах
                  </Button>
                  <Button href="#how-to-join" variant="secondary" size="lg">
                    Оролцох
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

