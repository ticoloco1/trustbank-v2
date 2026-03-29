'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isConfigured } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  credits: number;
  subscriptions: any[];
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, loading: true, credits: 0,
  subscriptions: [], signOut: async () => {}, refreshCredits: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [subscriptions, setSubs] = useState<any[]>([]);

  const refreshCredits = async () => {
    if (!isConfigured || !user) return;
    const { data } = await supabase.from('profiles').select('credits').eq('user_id', user.id).maybeSingle();
    if (data) setCredits(data.credits || 0);
  };

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null); setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user) refreshCredits(); }, [user]);

  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ user, session, loading, credits, subscriptions, signOut, refreshCredits }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
