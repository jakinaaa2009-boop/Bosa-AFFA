'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/services/admin';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();
    if (!token) router.replace('/admin/login');
  }, [router]);

  return <>{children}</>;
}

