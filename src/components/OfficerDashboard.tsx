import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Report, ReportStatus } from '@/lib/types';
import ReportCard from './ReportCard';
import { Loader2, Zap, RefreshCw, Inbox } from 'lucide-react';

const DEPT = 'Electricity';

type Filter = 'all' | ReportStatus;

export default function OfficerDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('department', DEPT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReports((data as Report[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id: string, status: ReportStatus) {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Pending').length,
    progress: reports.filter((r) => r.status === 'In Progress').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
  };

  const filtered =
    filter === 'all'
      ? reports
      : reports.filter((r) => r.status === filter);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.total },
    { key: 'Pending', label: 'Pending', count: counts.pending },
    { key: 'In Progress', label: 'Active', count: counts.progress },
    { key: 'Resolved', label: 'Resolved', count: counts.resolved },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
              <Zap className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Electricity Department
              </h1>
              <p className="text-sm text-slate-500">Officer Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Reports" value={counts.total} className="bg-slate-900 text-white" />
          <StatCard label="Pending" value={counts.pending} className="bg-amber-50 text-amber-700 border border-amber-200" />
          <StatCard label="Resolved" value={counts.resolved} className="bg-emerald-50 text-emerald-700 border border-emerald-200" />
        </div>

        <button
          onClick={load}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>

        {/* Filter tabs */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === t.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="mt-3 text-sm">Loading reports…</p>
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Inbox className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-700">
              No reports in this view
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {filter === 'all'
                ? 'No electricity reports have been submitted yet.'
                : `No reports with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="relative">
                {updatingId === r.id && (
                  <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                  </div>
                )}
                <ReportCard
                  report={r}
                  showStatusSelector
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-2xl px-3 py-4 text-center ${className}`}>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}
