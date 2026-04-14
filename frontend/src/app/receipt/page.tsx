'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ReceiptSection } from '@/sections/ReceiptSection';
import { clearUserToken, fetchMe, loginUser, registerUser, type User } from '@/services/userSession';

type Tab = 'login' | 'register';

export default function ReceiptPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [session, setSession] = useState<User | null>(null);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe()
      .then((u) => setSession(u))
      .catch(() => setSession(null));
  }, []);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const s = await loginUser({ phone: phone.trim(), password });
      setSession(s);
    } catch {
      setError('Утас эсвэл нууц үг буруу байна.');
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ageNum = Number(age);
      if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) throw new Error('AGE');
      const s = await registerUser({ fullName: fullName.trim(), phone: phone.trim(), password, age: ageNum });
      setSession(s);
    } catch {
      setError('Бүртгүүлэх боломжгүй (утас давхардсан байж магадгүй).');
    } finally {
      setLoading(false);
    }
  }

  if (session) {
    return (
      <div className="min-h-dvh bg-[#050b1a] text-white">
        <Navbar />
        <div className="px-5 pt-6">
          <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
            <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white transition">
              ← Нүүр хуудас
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-sm text-white/70">
                <span className="font-semibold text-white/90">{session.fullName}</span> · {session.phone} · {session.age} настай
              </div>
              <button
                type="button"
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15 transition"
                onClick={() => {
                  clearUserToken();
                  setSession(null);
                }}
              >
                Гарах
              </button>
            </div>
          </div>
        </div>

        {/* Upload after login */}
        <ReceiptSection defaults={{ fullName: session.fullName, phone: session.phone }} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#050b1a] text-white">
      <Navbar />
      <div className="px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Баримт оруулах</h1>
        <p className="mt-2 text-sm text-white/70">
          Эхлээд нэвтэрнэ эсвэл шинээр бүртгүүлээд дараа нь баримтаа илгээнэ үү.
        </p>

        <div className="mt-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15 transition"
              >
                ← Нүүр хуудас
              </Link>

              <div className="rounded-full bg-white/10 ring-1 ring-white/15 p-1 flex">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                    tab === 'login' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Нэвтрэх
                </button>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                    tab === 'register' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Бүртгүүлэх
                </button>
              </div>
            </div>

            <div className="mt-6">
              {tab === 'login' ? (
                <form onSubmit={onLogin} className="grid gap-4">
                  <Field label="Утасны дугаар">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none focus:ring-sky-300/60"
                      placeholder="Ж: 99119999"
                    />
                  </Field>
                  <Field label="Нууц үг">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none focus:ring-sky-300/60"
                      placeholder="••••••••"
                    />
                  </Field>
                  {error ? <div className="text-sm text-rose-200">{error}</div> : null}
                  <Button type="submit" className="w-full">
                    {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={onRegister} className="grid gap-4">
                  <Field label="Овог нэр">
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none focus:ring-sky-300/60"
                      placeholder="Ж: Бат-Эрдэнэ"
                    />
                  </Field>
                  <Field label="Нас">
                    <input
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      inputMode="numeric"
                      className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none focus:ring-sky-300/60"
                      placeholder="Ж: 21"
                    />
                  </Field>
                  <Field label="Утасны дугаар">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none focus:ring-sky-300/60"
                      placeholder="Ж: 99119999"
                    />
                  </Field>
                  <Field label="Нууц үг">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 text-sm text-white outline-none focus:ring-sky-300/60"
                      placeholder="Дор хаяж 6 тэмдэгт"
                    />
                  </Field>
                  {error ? <div className="text-sm text-rose-200">{error}</div> : null}
                  <Button type="submit" className="w-full">
                    {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
                  </Button>
                </form>
              )}
            </div>

            <div className="mt-5 text-xs text-white/60" />
          </GlassCard>
        </div>
      </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-semibold text-white/70">{label}</label>
      {children}
    </div>
  );
}

