import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type Role = 'admin' | 'agent' | 'client';

interface AppUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginResult {
  success: boolean;
  error?: string;
  role?: Role;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeRole(role: string | null | undefined): Role | null {
  if (role === 'ADMIN') return 'admin';
  if (role === 'AGENT') return 'agent';
  if (role === 'CLIENT') return 'client';
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const fetchProfile = async (authUser: User) => {
    // Query by id instead of email to avoid casing/string mismatch issues
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error || !profile) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    const role = normalizeRole(profile.role);
    if (!role) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    setState({
      user: {
        id: profile.id,
        email: authUser.email || '',
        name: profile.full_name,
        role,
      },
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });

    if (error) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Query by user ID directly
      const { data: profile } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('id', data.user.id)
        .maybeSingle();

      const role = profile ? normalizeRole(profile.role) : null;

      if (!profile || !role) {
        await supabase.auth.signOut();
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return { success: false, error: 'No account found for this email.' };
      }

      setState({
        user: {
          id: profile.id,
          email: data.user.email || '',
          name: profile.full_name,
          role,
        },
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, role };
    }

    setState({ user: null, isAuthenticated: false, isLoading: false });
    return { success: false, error: 'Login failed. Please try again.' };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}