'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { RequireAdmin } from '@/components/admin/RequireAdmin';
import { Button } from '@/components/ui/Button';
import { deleteSubmissionById, fetchSubmissions, setSubmissionStatus } from '@/services/adminSubmissions';
import type { Submission } from '@/types/api';
import { resolveReceiptImage } from '@/lib/assets';
import { formatDateMn } from '@/lib/utils';

type Status = 'pending' | 'approved' | 'rejected' | 'all';
type SubmitterTab = 'all' | 'user' | 'company';

const PAGE_SIZE = 50;

const statusTabs: { value: Status; label: string }[] = [
  { value: 'all', label: 'Бүгд' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

const submitterTabs: { value: SubmitterTab; label: string }[] = [
  { value: 'all', label: 'Бүгд' },
  { value: 'user', label: 'Хэрэглэгч' },
  { value: 'company', label: 'Компани' }
];

export default function AdminSubmissionsPage() {
  const [status, setStatus] = useState<Status>('all');
  const [submitterTab, setSubmitterTab] = useState<SubmitterTab>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveTicketsById, setApproveTicketsById] = useState<Record<string, string>>({});

  const apiStatus = useMemo(() => (status === 'all' ? undefined : status), [status]);
  const apiParticipantType = useMemo(
    () => (submitterTab === 'all' ? undefined : submitterTab),
    [submitterTab]
  );

  function getApproveTickets(id: string, fallback: number) {
    const v = approveTicketsById[id];
    if (v === undefined || v === '') return String(fallback);
    return v;
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  async function load(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubmissions({
        status: apiStatus,
        participantType: apiParticipantType,
        search: search.trim() || undefined,
        page: nextPage,
        limit: PAGE_SIZE
      });
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch {
      setError('Баримтуудыг уншиж чадсангүй.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, submitterTab]);

  return (
    <RequireAdmin>
      <AdminShell>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-white/70">Баримтууд</div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Оролцогчдын бүртгэл</h1>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    void load(1);
                  }
                }}
                placeholder="Нэр/утас/компани/бүтээгдэхүүн/баримтын №..."
                className="h-10 w-full sm:w-64 rounded-2xl bg-white/10 ring-1 ring-white/15 px-3 text-sm text-white placeholder:text-white/40 outline-none"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setPage(1);
                  void load(1);
                }}
              >
                Хайх
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {submitterTabs.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSubmitterTab(t.value)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-extrabold ring-1 transition',
                  submitterTab === t.value
                    ? 'bg-white text-slate-900 ring-white'
                    : 'bg-white/10 text-white/85 ring-white/15 hover:bg-white/15'
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {statusTabs.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setStatus(t.value)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-extrabold ring-1 transition',
                  status === t.value
                    ? 'bg-sky-400 text-slate-900 ring-sky-300'
                    : 'bg-white/10 text-white/85 ring-white/15 hover:bg-white/15'
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {!loading && !error && total > 0 ? (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-white/70">
                Нийт <span className="font-extrabold text-white">{total}</span> баримт
                {total > PAGE_SIZE ? (
                  <span>
                    {' '}
                    · <span className="font-semibold text-white/85">{rangeStart}–{rangeEnd}</span> харуулж байна
                  </span>
                ) : null}
              </div>
              {totalPages > 1 ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page <= 1 || loading}
                    onClick={() => void load(page - 1)}
                  >
                    Өмнөх
                  </Button>
                  <span className="text-sm font-semibold text-white/80 tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page >= totalPages || loading}
                    onClick={() => void load(page + 1)}
                  >
                    Дараах
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {loading ? (
            <div className="text-sm text-white/70">Уншиж байна...</div>
          ) : error ? (
            <div className="text-sm text-rose-200">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-white/70">Мэдээлэл алга.</div>
          ) : (
            <div className="grid gap-3">
              {items.map((s) => {
                const fallbackTickets = s.status === 'approved' ? (s.chances ?? 1) : 1;
                return (
                <div key={s._id} className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-extrabold tracking-tight text-white truncate">{s.fullName}</div>
                        <span className="inline-flex rounded-full bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-100 ring-1 ring-sky-300/30">
                          {s.participantType === 'company' ? 'Компани' : 'Хэрэглэгч'}
                        </span>
                        <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                          {s.status}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
                        <div className="text-white/80">
                          <span className="text-white/55">Phone:</span> <span className="font-semibold">{s.phone}</span>
                        </div>
                        <div className="text-white/80">
                          <span className="text-white/55">Product:</span>{' '}
                          <span className="font-semibold">{s.productName}</span>
                        </div>
                        {s.participantType === 'company' ? (
                          <div className="text-white/85">
                            <span className="text-white/55">Компани:</span>{' '}
                            <span className="font-extrabold">{s.companyName || s.fullName}</span>
                          </div>
                        ) : (
                          <div className="text-white/85">
                            <span className="text-white/55">Receipt #:</span>{' '}
                            <span className="font-extrabold">{s.receiptNumber ?? '—'}</span>
                          </div>
                        )}
                        <div className="text-white/70">
                          <span className="text-white/55">Created:</span>{' '}
                          <span className="font-semibold">{s.createdAt ? formatDateMn(new Date(s.createdAt)) : '-'}</span>
                        </div>
                        <div className="text-white/70">
                          <span className="text-white/55">Approved:</span>{' '}
                          <span className="font-semibold">{s.approvedAt ? formatDateMn(new Date(s.approvedAt)) : '-'}</span>
                        </div>
                        {s.status === 'approved' ? (
                          <div className="text-white/80">
                            <span className="text-white/55">Сугалааны эрх:</span>{' '}
                            <span className="font-extrabold text-emerald-200/95">{s.chances ?? 1}</span>
                            {s.chances == null ? (
                              <span className="ml-1 text-xs font-semibold text-white/45">(хуучин бүртгэл)</span>
                            ) : null}
                          </div>
                        ) : null}
                        <div className="text-white/80">
                          <span className="text-white/55">Amount:</span>{' '}
                          <span className="font-semibold">{Number(s.amount).toLocaleString()}₮</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                          <label htmlFor={`tickets-${s._id}`} className="text-xs font-semibold text-white/70">
                            Эрх (барааны тоо)
                          </label>
                          <input
                            id={`tickets-${s._id}`}
                            type="number"
                            min={1}
                            max={10000}
                            inputMode="numeric"
                            value={getApproveTickets(s._id ?? '', fallbackTickets)}
                            onChange={(e) => {
                              if (!s._id) return;
                              setApproveTicketsById((m) => ({ ...m, [s._id!]: e.target.value }));
                            }}
                            className="h-9 w-20 rounded-xl bg-white/10 px-2 text-sm font-bold text-white outline-none ring-1 ring-white/15"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={async () => {
                            if (!s._id) return;
                            const n = Number.parseInt(getApproveTickets(s._id, fallbackTickets), 10);
                            if (!Number.isFinite(n) || n < 1 || n > 10000) {
                              setError('Эрх 1–10000 хооронд байна.');
                              return;
                            }
                            await setSubmissionStatus(s._id, 'approved', n);
                            await load();
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            if (!s._id) return;
                            await setSubmissionStatus(s._id, 'rejected');
                            await load();
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            if (!s._id) return;
                            await setSubmissionStatus(s._id, 'pending');
                            await load();
                          }}
                        >
                          Pending
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ring-rose-300/25 text-rose-100 hover:bg-rose-500/10"
                          onClick={async () => {
                            if (!s._id) return;
                            await deleteSubmissionById(s._id);
                            await load();
                          }}
                        >
                          Устгах
                        </Button>
                      </div>
                    </div>

                    <div className="w-full lg:w-[220px] shrink-0">
                      <a
                        href={resolveReceiptImage(s.receiptImage)}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveReceiptImage(s.receiptImage)}
                          alt="Баримт"
                          className="h-44 w-full object-cover"
                          loading="lazy"
                        />
                      </a>
                      <div className="mt-2 text-xs text-white/55">Зураг дээр дарж томоор нээнэ.</div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}

          {!loading && !error && totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => void load(page - 1)}
              >
                Өмнөх
              </Button>
              <span className="text-sm font-semibold text-white/80 tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => void load(page + 1)}
              >
                Дараах
              </Button>
            </div>
          ) : null}
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}

