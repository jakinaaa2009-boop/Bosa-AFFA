import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/sections/HeroSection';
import { HowToJoinSection } from '@/sections/HowToJoinSection';
import { PrizesSection } from '@/sections/PrizesSection';
import { ProductsCarouselSection } from '@/sections/ProductsCarouselSection';
import { DrawScheduleSection } from '@/sections/DrawScheduleSection';
import { WinnersSection } from '@/sections/WinnersSection';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#050b1a] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(56,189,248,0.35),transparent_65%),radial-gradient(900px_500px_at_90%_20%,rgba(37,99,235,0.35),transparent_60%),radial-gradient(700px_400px_at_60%_90%,rgba(14,165,233,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.0),rgba(2,6,23,0.8))]" />
      </div>

      <Navbar />
      <main>
        <HeroSection />
        <HowToJoinSection />
        <PrizesSection />
        <ProductsCarouselSection />
        <DrawScheduleSection />
        <WinnersSection />
        {/* Receipt is now on /receipt with login/register gate */}
      </main>

      <footer className="px-5 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white/5 ring-1 ring-white/10 px-6 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo1.png"
                alt="Лого"
                width={44}
                height={44}
                className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/15 object-contain p-1.5"
              />
              <Image
                src="/logo2.png"
                alt="Лого"
                width={150}
                height={44}
                className="h-9 w-auto object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-white/75">
              <Link href="/receipt" className="hover:text-white transition-colors">
                Баримт оруулах
              </Link>
              <a
                href="/juram/udirdamj.pdf"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Удирдамж
              </a>
            </div>
          </div>

          <div className="mt-6 text-sm text-white/60">
            © 2026 Урамшуулалт сугалаа. Бүх эрх хуулиар хамгаалагдсан.
          </div>
        </div>
      </footer>
    </div>
  );
} 