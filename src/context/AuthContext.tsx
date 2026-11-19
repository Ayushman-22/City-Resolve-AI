import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type Role = 'citizen' | 'department' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: Role;
  department: string | null;
  roleLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USER: any = {
  id: 'demo-user',
  email: 'demo@cityresolve.gov',
  user_metadata: { full_name: 'Demo Admin' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>('citizen');
  const [department, setDepartment] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const isDemo = !isSupabaseConfigured;

  // Session load + auth changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Role + department load (sirf tab chalta hai jab user badle, token refresh pe nahi)
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setRole('citizen');
      setDepartment(null);
      setRoleLoading(false);
      return;
    }

    // Demo mode (Supabase configured nahi): demo user ko admin maano
    if (!isSupabaseConfigured) {
      setRole('admin');
      setDepartment(null);
      setRoleLoading(false);
      return;
    }

    let cancelled = false;
    setRoleLoading(true);

    supabase!
      .from('profiles')
      .select('role, department_id, departments(name)')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error('Profile load failed:', error.message);
        const d: any = data;
        const r = d?.role;
        setRole(r === 'department' || r === 'admin' ? r : 'citizen');
        // departments join kabhi object aata hai, kabhi array, dono sambhal lo
        const dep = Array.isArray(d?.departments) ? d.departments[0] : d?.departments;
        setDepartment(dep?.name ?? null);
        setRoleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, loading]);

  const signUp = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      return { error: null };
    }
    const { error } = await supabase!.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      return { error: null };
    }
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      return;
    }
    await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }
    await supabase!.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        department,
        roleLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        isDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}