import { AuthProvider, useAuth } from '@/lib/auth';
import AuthGateway from '@/components/AuthGateway';
import CitizenPortal from '@/components/CitizenPortal';
import OfficerPortal from '@/components/OfficerPortal';
import { Loader2, Shield } from 'lucide-react';

function AppShell() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg">
          <Shield className="h-7 w-7 text-white" strokeWidth={2.2} />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!role) return <AuthGateway />;
  if (role === 'citizen') return <CitizenPortal />;
  return <OfficerPortal />;
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
