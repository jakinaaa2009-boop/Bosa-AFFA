import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Mono } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
  display: 'swap'
});

const notoMono = Noto_Sans_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'cyrillic'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Урамшуулалт Сугалаа',
  description: 'Урамшуулалт сугалааны кампанит вебсайт'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${notoSans.variable} ${notoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
