import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
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
  const isDemo = !isSupabaseConfigured;

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) { setUser(DEMO_USER); return { error: null }; }
    const { error } = await supabase!.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) { setUser(DEMO_USER); return { error: null }; }
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) { setUser(DEMO_USER); return; }
    await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) { setUser(null); return; }
    await supabase!.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}