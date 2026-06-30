'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, User } from '@/types';
import api from '@/services/api';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedLocal = localStorage.getItem('auth_user');
    const storedSession = sessionStorage.getItem('auth_user');
    if (storedLocal) {
      setUser(JSON.parse(storedLocal));
    } else if (storedSession) {
      setUser(JSON.parse(storedSession));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      const response = await api.post('/Auth/login', { email, password });
      const data = response.data;

      const user: User = {
        id: '1',
        name: data.user,
        email,
        role: data.role,
      };

      setUser(user);
      if (rememberMe) {
        localStorage.setItem('auth_user', JSON.stringify(user));
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      } else {
        sessionStorage.setItem('auth_user', JSON.stringify(user));
        if (data.token) {
          sessionStorage.setItem('token', data.token);
        }
      }
      return true;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data ?? error.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
