import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Report } from '@/lib/types';
import ReportCard from './ReportCard';
import { Loader2, FileText, Plus, RefreshCw } from 'lucide-react';

interface Props {
  onNewReport: () => void;
}

export default function MyReports({ onNewReport }: Props) {
  const { citizenId } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!citizenId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('citizen_id', citizenId)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citizenId]);

  const counts = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Pending').length,
    progress: reports.filter((r) => r.status === 'In Progress').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">My Reports</h1>
          <p className="text-sm text-slate-500">
            Track the status of issues you've reported.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Stat label="Total" value={counts.total} className="bg-slate-900 text-white" />
          <Stat label="Pending" value={counts.pending} className="bg-amber-50 text-amber-700 border border-amber-200" />
          <Stat label="Active" value={counts.progress} className="bg-sky-50 text-sky-700 border border-sky-200" />
          <Stat label="Resolved" value={counts.resolved} className="bg-emerald-50 text-emerald-700 border border-emerald-200" />
        </div>

        <button
          onClick={load}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="mt-3 text-sm">Loading your reports…</p>
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-700">
              No reports yet
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              When you submit a report, it will appear here.
            </p>
            <button
              onClick={onNewReport}
              className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Report an Issue
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {reports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-xl px-2 py-2.5 text-center ${className}`}>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
    </div>
  );
}
