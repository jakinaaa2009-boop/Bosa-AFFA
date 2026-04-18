'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { RequireAdmin } from '@/components/admin/RequireAdmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import type { Winner } from '@/types/api';
import { fetchWinners } from '@/services/winners';
import { deleteWinnerById } from '@/services/adminWinners';
import { formatDateMn } from '@/lib/utils';

export default function AdminWinnersPage() {
  const [items, setItems] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const w = await fetchWinners();
      setItems(w);
    } catch {
      setError('Ялагчдыг уншиж чадсангүй.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <RequireAdmin>
      <AdminShell>
        <div>
          <div className="text-xs font-semibold text-white/70">Ялагчид</div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Ялагчдын жагсаалт</h1>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-white/70">Уншиж байна...</div>
          ) : error ? (
            <div className="text-sm text-rose-200">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-white/70">Ялагч алга.</div>
          ) : (
            <div className="grid gap-4">
              {items.map((w, idx) => (
                <GlassCard key={`${w.phone}-${w.prizeName}-${idx}`} className="p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-base font-extrabold tracking-tight text-white truncate">{w.winnerName}</div>
                      <div className="mt-1 text-xs font-semibold text-white/55">
                        {w.participantType === 'company'
                          ? `Компани · ${w.displayLabel ?? w.companyName ?? '—'}`
                          : `Баримт · ${w.displayLabel ?? w.receiptNumber ?? '—'}`}
                      </div>
                      <div className="mt-1 text-sm text-white/75">
                        <span className="text-white/60">Шагнал:</span> <span className="font-semibold">{w.prizeName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-white/70 whitespace-nowrap">{formatDateMn(new Date(w.drawDate))}</div>
                      {w._id ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ring-rose-300/25 text-rose-100 hover:bg-rose-500/10"
                          onClick={async () => {
                            await deleteWinnerById(w._id as string);
                            await load();
                          }}
                        >
                          Устгах
                        </Button>
                      ) : null}
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

