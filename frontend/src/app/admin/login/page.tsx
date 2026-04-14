'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { adminLogin } from '@/services/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin({ username, password });
      router.push('/admin/dashboard');
    } catch {
      setError('Нэвтрэх мэдээлэл буруу байна.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#050b1a] text-white px-5 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-extrabold tracking-tight">Админ нэвтрэх</h1>
        <p className="mt-2 text-sm text-white/70">Зөвхөн админ хэрэглэгч нэвтэрнэ.</p>

        <div className="mt-6">
          <GlassCard className="p-6">
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-white/70">Нэвтрэх нэр</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none focus:ring-sky-300/60"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-white/70">Нууц үг</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none focus:ring-sky-300/60"
                />
              </div>
              {error ? <div className="text-sm text-rose-200">{error}</div> : null}
              <Button type="submit" className="w-full">
                {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

