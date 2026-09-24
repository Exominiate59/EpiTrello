import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore, User } from './api';

interface Session {
  accessToken: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!tokenStore.get());
  const queryClient = useQueryClient();

  // Au chargement : si un token existe, on vérifie qu'il est toujours valide
  useEffect(() => {
    if (!tokenStore.get()) return;
    api<User>('/auth/me')
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const startSession = (session: Session) => {
    tokenStore.set(session.accessToken);
    setUser(session.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    startSession(await api<Session>('/auth/login', { method: 'POST', body: { email, password } }));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    startSession(await api<Session>('/auth/register', { method: 'POST', body: { name, email, password } }));
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}
