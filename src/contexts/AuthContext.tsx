import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  session: null, 
  loading: true,
  clearSession: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    setSession(null);
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(initialSession);
      } catch (error) {
        console.error('Session initialization error:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    
    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        setSession(session);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
      } else if (event === 'USER_DELETED') {
        setSession(null);
        toast.error('User account has been deleted');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);