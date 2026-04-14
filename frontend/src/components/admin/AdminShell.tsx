'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAdminToken } from '@/services/admin';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Хэрэглэгчид' },
  { href: '/admin/submissions', label: 'Баримтууд' },
  { href: '/admin/winners', label: 'Ялагчид' },
  { href: '/admin/draw', label: 'Сугалаа' }
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#050b1a] text-white">
      <div className="px-5 pt-5">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white/10 ring-1 ring-white/15 backdrop-blur-xl">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
                <Image src="/logo1.png" alt="Лого" fill className="object-contain p-1.5" sizes="32px" />
              </div>
              <div className="font-extrabold tracking-tight">Админ</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/15 transition',
                    pathname === l.href ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/15'
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  clearAdminToken();
                  router.push('/admin/login');
                }}
                className="rounded-full bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 ring-1 ring-rose-300/20 hover:bg-rose-500/20 transition"
              >
                Гарах
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}

