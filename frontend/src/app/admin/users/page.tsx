'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { RequireAdmin } from '@/components/admin/RequireAdmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { deleteUserById, fetchUsers, type AdminUserRow } from '@/services/adminUsers';
import { fetchSubmissions } from '@/services/adminSubmissions';
import type { Submission } from '@/types/api';
import { formatDateMn } from '@/lib/utils';

type UsersTab = 'users' | 'companies';

export default function AdminUsersPage() {
  const [tab, setTab] = useState<UsersTab>('users');
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [companyRows, setCompanyRows] = useState<Submission[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers({ search: search.trim() || undefined, limit: 50 });
      setItems(data.items ?? []);
    } catch {
      setError('Хэрэглэгчдийн мэдээллийг уншиж чадсангүй.');
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanies() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubmissions({
        participantType: 'company',
        search: search.trim() || undefined,
        limit: 50
      });
      setCompanyRows(data.items ?? []);
    } catch {
      setError('Компаниудын мэдээллийг уншиж чадсангүй.');
    } finally {
      setLoading(false);
    }
  }

  async function load() {
    if (tab === 'users') await loadUsers();
    else await loadCompanies();
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <RequireAdmin>
      <AdminShell>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-white/70">Хэрэглэгчид</div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Бүртгэл ба компаниуд</h1>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTab('users')}
                className={[
                  'rounded-full px-4 py-2 text-sm font-extrabold ring-1 transition',
                  tab === 'users' ? 'bg-white text-slate-900 ring-white' : 'bg-white/10 text-white/85 ring-white/15 hover:bg-white/15'
                ].join(' ')}
              >
                Хэрэглэгч
              </button>
              <button
                type="button"
                onClick={() => setTab('companies')}
                className={[
                  'rounded-full px-4 py-2 text-sm font-extrabold ring-1 transition',
                  tab === 'companies' ? 'bg-white text-slate-900 ring-white' : 'bg-white/10 text-white/85 ring-white/15 hover:bg-white/15'
                ].join(' ')}
              >
                Компани
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === 'users' ? 'Нэр/утас...' : 'Компани/утас/бүтээгдэхүүн...'}
                className="h-10 w-full sm:w-64 rounded-2xl bg-white/10 ring-1 ring-white/15 px-3 text-sm text-white placeholder:text-white/40 outline-none"
              />
              <Button size="sm" variant="secondary" onClick={() => void load()}>
                Хайх
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-white/70">Уншиж байна...</div>
          ) : error ? (
            <div className="text-sm text-rose-200">{error}</div>
          ) : tab === 'users' ? (
            items.length === 0 ? (
              <div className="text-sm text-white/70">Мэдээлэл алга.</div>
            ) : (
              <div className="grid gap-4">
                {items.map((u) => (
                  <GlassCard key={u._id} className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-base font-extrabold tracking-tight text-white truncate">{u.fullName}</div>
                        <div className="mt-1 text-sm text-white/75">
                          <span className="text-white/60">Утас:</span> <span className="font-semibold">{u.phone}</span>
                        </div>
                        <div className="mt-1 text-sm text-white/75">
                          <span className="text-white/60">Нас:</span> <span className="font-semibold">{u.age}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                            Нийт баримт: {u.totalSubmissions}
                          </span>
                          <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                            Approved: {u.approvedSubmissions}
                          </span>
                          {u.lastSubmittedAt ? (
                            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                              Сүүлд: {formatDateMn(new Date(u.lastSubmittedAt))}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="ring-rose-300/25 text-rose-100 hover:bg-rose-500/10"
                        onClick={async () => {
                          await deleteUserById(u._id);
                          await loadUsers();
                        }}
                      >
                        Хэрэглэгч + баримтуудыг устгах
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )
          ) : companyRows.length === 0 ? (
            <div className="text-sm text-white/70">Компанийн илгээлтүүд алга.</div>
          ) : (
            <div className="grid gap-4">
              {companyRows.map((s) => (
                <GlassCard key={s._id} className="p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-sky-200/90">Компани</div>
                      <div className="mt-1 text-base font-extrabold tracking-tight text-white truncate">
                        {s.companyName || s.fullName}
                      </div>
                      <div className="mt-1 text-sm text-white/75">
                        <span className="text-white/60">Утас:</span> <span className="font-semibold">{s.phone}</span>
                      </div>
                      <div className="mt-1 text-sm text-white/75">
                        <span className="text-white/60">Бүтээгдэхүүн:</span>{' '}
                        <span className="font-semibold">{s.productName}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                          {s.status}
                        </span>
                        {s.approvedAt ? (
                          <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                            Approved: {formatDateMn(new Date(s.approvedAt))}
                          </span>
                        ) : null}
                        {s.createdAt ? (
                          <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                            Илгээсэн: {formatDateMn(new Date(s.createdAt))}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}
