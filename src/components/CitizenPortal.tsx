import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import MyReports from './MyReports';
import ReportSubmission from './ReportSubmission';
import { Home, Plus, LogOut, Shield } from 'lucide-react';

type View = 'reports' | 'submit';

export default function CitizenPortal() {
  const { citizenLabel, isGuest, signOut } = useAuth();
  const [view, setView] = useState<View>('reports');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top user bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {isGuest ? 'Guest' : citizenLabel ?? 'Citizen'}
            </span>
            {isGuest && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                Guest mode
              </span>
            )}
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut className="h-3.5 w-3.5" /> Exit
          </button>
        </div>
      </div>

      {view === 'submit' ? (
        <ReportSubmission
          onSubmitted={() => setView('reports')}
          onCancel={() => setView('reports')}
        />
      ) : (
        <MyReports onNewReport={() => setView('submit')} />
      )}

      {/* Bottom nav (hidden during submission flow) */}
      {view !== 'submit' && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
            <button
              onClick={() => setView('reports')}
              className={`flex flex-col items-center gap-0.5 px-6 py-2 text-xs font-medium transition ${
                view === 'reports' ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              <Home className="h-5 w-5" />
              My Reports
            </button>
            <button
              onClick={() => setView('submit')}
              className="flex flex-col items-center gap-0.5 rounded-2xl bg-emerald-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 transition active:scale-95 hover:bg-emerald-400"
            >
              <Plus className="h-5 w-5" />
              New Report
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
