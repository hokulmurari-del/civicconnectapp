import { useAuth } from '@/lib/auth';
import OfficerDashboard from './OfficerDashboard';
import { LogOut, Zap } from 'lucide-react';

export default function OfficerPortal() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Officer · Electricity
            </span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>

      <OfficerDashboard />
    </div>
  );
}
