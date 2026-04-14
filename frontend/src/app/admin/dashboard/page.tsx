'use client';

import { AdminShell } from '@/components/admin/AdminShell';
import { RequireAdmin } from '@/components/admin/RequireAdmin';
import { GlassCard } from '@/components/ui/GlassCard';

export default function AdminDashboardPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GlassCard className="p-6">
            <div className="text-xs font-semibold text-white/70">Товч</div>
            <div className="mt-2 text-lg font-extrabold">Хяналтын самбар</div>
            <div className="mt-2 text-sm text-white/70">
              Баримтуудыг баталгаажуулж, сугалаа эргүүлж, ялагчдыг хадгална.
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-xs font-semibold text-white/70">Зөвлөгөө</div>
            <div className="mt-2 text-sm text-white/75">1) Баримтууд → Approved болгоно</div>
            <div className="mt-1 text-sm text-white/75">2) Сугалаа → Шагнал сонгоод Spin</div>
            <div className="mt-1 text-sm text-white/75">3) Ялагчид → Нийтэд харагдана</div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-xs font-semibold text-white/70">Анхаар</div>
            <div className="mt-2 text-sm text-white/75">
              Нэг submission нэг шагнал дээр дахин ялагч болохгүй (backend хамгаалалттай).
            </div>
          </GlassCard>
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}

