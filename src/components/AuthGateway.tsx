import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
  Shield,
  User,
  Loader2,
  ArrowLeft,
  Lock,
  UserCircle2,
  LogIn,
  AlertCircle,
  Zap,
} from 'lucide-react';

type Tab = 'citizen' | 'officer';

export default function AuthGateway() {
  const { signInAsGuest, signInWithGoogle, signInAsOfficer } = useAuth();
  const [tab, setTab] = useState<Tab>('citizen');
  const [officerMode, setOfficerMode] = useState<'select' | 'login'>('select');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed.');
      setBusy(false);
    }
  }

  async function handleOfficerLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInAsOfficer(userId, password);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Login failed. Check your User ID and password.'
      );
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/20">
          <Shield className="h-8 w-8 text-white" strokeWidth={2.2} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Civic Connect
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Report issues in your community in seconds
        </p>
      </header>

      {/* Toggle */}
      <div className="mx-auto w-full max-w-md px-6">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1.5">
          <button
            onClick={() => {
              setTab('citizen');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              tab === 'citizen'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <User className="h-4 w-4" />
            I am a Citizen
          </button>
          <button
            onClick={() => {
              setTab('officer');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              tab === 'officer'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Shield className="h-4 w-4" />
            Department Officer
          </button>
        </div>
      </div>

      {/* Body */}
      <main className="flex flex-1 items-start justify-center px-6 pt-6">
        <div className="w-full max-w-md">
          {tab === 'citizen' ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Report an issue
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Continue to capture a photo, auto-detect your location, and
                  pick a department.
                </p>

                <button
                  onClick={signInAsGuest}
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-slate-800"
                >
                  <UserCircle2 className="h-5 w-5" />
                  Continue as Guest
                </button>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium text-slate-400">OR</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  onClick={handleGoogle}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white py-4 text-base font-semibold text-slate-700 transition active:scale-[0.98] hover:bg-slate-50 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Sign in with Google
                </button>
              </div>
              <p className="px-2 text-center text-xs text-slate-400">
                Guest reports are saved to this device. Sign in with Google to
                keep your reports across devices.
              </p>
            </div>
          ) : officerMode === 'select' ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Officer Portal
                  </h2>
                  <p className="text-sm text-slate-500">
                    Electricity Department
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Sign in with your department User ID and password to view and
                manage assigned reports.
              </p>
              <button
                onClick={() => setOfficerMode('login')}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-amber-400"
              >
                <LogIn className="h-5 w-5" />
                Officer Sign In
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleOfficerLogin}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <button
                type="button"
                onClick={() => {
                  setOfficerMode('select');
                  setError(null);
                }}
                className="mb-4 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h2 className="text-lg font-bold text-slate-900">
                Officer Sign In
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Electricity Department access
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <label className="mt-5 block text-sm font-medium text-slate-700">
                User ID
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="e.g. officer.elec01"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <label className="mt-4 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-amber-400 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                Sign In
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="px-6 pb-8 pt-4 text-center text-xs text-slate-400">
        Civic Connect · Community issue reporting
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
