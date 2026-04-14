import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/sections/HeroSection';
import { HowToJoinSection } from '@/sections/HowToJoinSection';
import { PrizesSection } from '@/sections/PrizesSection';
import { ProductsCarouselSection } from '@/sections/ProductsCarouselSection';
import { WinnersSection } from '@/sections/WinnersSection';

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
        <WinnersSection />
        {/* Receipt is now on /receipt with login/register gate */}
      </main>

      <footer className="px-5 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white/5 ring-1 ring-white/10 px-6 py-8 text-sm text-white/70">
          © 2026 Урамшуулалт сугалаа. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </footer>
    </div>
  );
}
