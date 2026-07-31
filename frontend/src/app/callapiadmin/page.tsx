'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

type Mode = 'loading' | 'login' | 'app';

const FORCE_PRIZES = [
  'Airpod gen 4',
  'ФИФА 2026 тэмцээний Аргентины албан ёсны өмсгөл'
] as const;

type ForcePrize = (typeof FORCE_PRIZES)[number];

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, credentials: 'include' });
  return res;
}

function emptyReceipts(): Record<ForcePrize, string> {
  return {
    'Airpod gen 4': '',
    'ФИФА 2026 тэмцээний Аргентины албан ёсны өмсгөл': ''
  };
}

export default function CallApiAdminPage() {
  const [mode, setMode] = useState<Mode>('loading');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [receipts, setReceipts] = useState<Record<ForcePrize, string>>(emptyReceipts);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await apiFetch('/api/force/receipt');
    if (res.status === 401) {
      setMode('login');
      return;
    }
    if (!res.ok) {
      setError('Уншиж чадсангүй.');
      setMode('login');
      return;
    }
    const data = (await res.json()) as {
      receipts?: Record<string, string>;
      receiptNumber?: string;
    };
    if (!dirty) {
      const next = emptyReceipts();
      for (const p of FORCE_PRIZES) {
        next[p] = data.receipts?.[p] ?? (p === FORCE_PRIZES[0] ? (data.receiptNumber ?? '') : '');
      }
      setReceipts(next);
    }
    setMode('app');
  }

  useEffect(() => {
    void load();
  }, []);

  // Realtime sync: poll for changes from other tabs/pages.
  useEffect(() => {
    if (mode !== 'app') return;
    const id = window.setInterval(() => {
      if (!dirty && !saving) void load();
    }, 4000);
    return () => window.clearInterval(id);
  }, [mode, dirty, saving]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch('/api/force/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        setError('Нэвтрэх мэдээлэл буруу байна.');
        return;
      }
      await load();
    } catch {
      setError('Алдаа гарлаа.');
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/force/receipt', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ receipts })
      });
      if (res.status === 401) {
        setMode('login');
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        setError(body?.message ?? 'Хадгалж чадсангүй.');
        return;
      }
    } catch {
      setError('Алдаа гарлаа.');
    } finally {
      setSaving(false);
      setDirty(false);
    }
  }

  async function onReset() {
    setSaving(true);
    setError(null);
    try {
      const cleared = emptyReceipts();
      const res = await apiFetch('/api/force/receipt', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ receipts: cleared })
      });
      if (res.status === 401) {
        setMode('login');
        return;
      }
      if (!res.ok) {
        setError('Reset хийх боломжгүй.');
        return;
      }
      setReceipts(cleared);
      setDirty(false);
    } catch {
      setError('Алдаа гарлаа.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#050b1a] text-white px-5 py-10">
      <div className="mx-auto max-w-md">
        <div className="text-xs font-semibold text-white/60">Super secret</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">/callapiadmin</h1>

        {mode === 'loading' ? (
          <div className="mt-6 text-sm text-white/70">Уншиж байна...</div>
        ) : mode === 'login' ? (
          <div className="mt-6">
            <GlassCard className="p-6">
              <form className="grid gap-4" onSubmit={onLogin}>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-white/70">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-white/70">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none"
                  />
                </div>
                {error ? <div className="text-sm text-rose-200">{error}</div> : null}
                <Button type="submit" className="w-full">
                  Нэвтрэх
                </Button>
              </form>
            </GlassCard>
          </div>
        ) : (
          <div className="mt-6">
            <GlassCard className="p-6">
              <form className="grid gap-6" onSubmit={onSave}>
                {FORCE_PRIZES.map((prize) => (
                  <div key={prize} className="grid gap-2">
                    <div className="text-sm font-bold tracking-tight text-white">{prize}</div>
                    <label className="text-xs font-semibold text-white/70">Forced receipt number</label>
                    <input
                      value={receipts[prize]}
                      onChange={(e) => {
                        setReceipts((prev) => ({ ...prev, [prize]: e.target.value }));
                        setDirty(true);
                      }}
                      placeholder="Баримтын дугаар..."
                      className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none"
                    />
                  </div>
                ))}
                {error ? <div className="text-sm text-rose-200">{error}</div> : null}
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-slate-900 font-semibold tracking-tight transition hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Хадгалж байна...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => void onReset()}
                  disabled={saving}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white/10 text-white font-semibold tracking-tight transition hover:bg-white/15 ring-1 ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
