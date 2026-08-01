import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AuthState, UserRole } from './types';
import { supabase } from './supabase';

interface AuthContextValue extends AuthState {
  loading: boolean;
  signInAsGuest: () => void;
  signInWithGoogle: () => Promise<void>;
  signInAsOfficer: (userId: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'civic-connect-auth';

function loadStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthState;
  } catch {
    // ignore
  }
  return {
    role: null,
    citizenId: null,
    citizenLabel: null,
    officerId: null,
    isGuest: false,
  };
}

function persistAuth(state: AuthState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function makeGuestId(): string {
  return 'guest_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStoredAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing Supabase session (Google OAuth return)
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user) {
        const email = session.user.email ?? 'Google User';
        const citizenId = session.user.id;
        const next: AuthState = {
          role: 'citizen',
          citizenId,
          citizenLabel: email,
          officerId: null,
          isGuest: false,
        };
        setState(next);
        persistAuth(next);
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const email = session.user.email ?? 'Google User';
          const citizenId = session.user.id;
          const next: AuthState = {
            role: 'citizen',
            citizenId,
            citizenLabel: email,
            officerId: null,
            isGuest: false,
          };
          setState(next);
          persistAuth(next);
        }
      })();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  function update(next: AuthState) {
    setState(next);
    persistAuth(next);
  }

  const value: AuthContextValue = {
    ...state,
    loading,
    signInAsGuest: () => {
      const id = makeGuestId();
      update({
        role: 'citizen',
        citizenId: id,
        citizenLabel: 'Guest',
        officerId: null,
        isGuest: true,
      });
    },
    signInWithGoogle: async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    },
    signInAsOfficer: async (userId: string, password: string) => {
      // Hardcoded officer credentials for the Electricity Department.
      const OFFICER_USER = 'gokul';
      const OFFICER_PASS = 'civic123';
      if (userId.trim().toLowerCase() !== OFFICER_USER || password !== OFFICER_PASS) {
        throw new Error('Invalid User ID or password.');
      }
      const next: AuthState = {
        role: 'officer',
        citizenId: null,
        citizenLabel: null,
        officerId: OFFICER_USER,
        isGuest: false,
      };
      update(next);
    },
    signOut: async () => {
      await supabase.auth.signOut();
      update({
        role: null,
        citizenId: null,
        citizenLabel: null,
        officerId: null,
        isGuest: false,
      });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRole(): UserRole | null {
  return useAuth().role;
}
