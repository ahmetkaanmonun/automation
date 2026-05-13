import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { api } from '../api/client';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'TESTER' | 'VIEWER';
};

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('qa_user');
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('qa_access_token', response.data.accessToken);
        localStorage.setItem('qa_user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      },
      logout() {
        localStorage.removeItem('qa_access_token');
        localStorage.removeItem('qa_user');
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

