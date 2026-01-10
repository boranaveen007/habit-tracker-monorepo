// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { create } from 'zustand';
import { api, setAuthToken } from '../features/habits/habitsApi';

type User = { id: string; email: string; name: string };

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  async login(email, password) {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      console.log('AUTH RESPONSE LOGIN', res.data);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      set({ user, token, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
  async register(name, email, password) {
    set({ loading: true });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      console.log('AUTH RESPONSE REGISTER', res.data);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      set({ user, token, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
  logout() {
    localStorage.removeItem('token');
    setAuthToken(null);
    set({ user: null, token: null });
  },
  hydrate() {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      set({ token });
    }
  },
}));

export function useAuth() {
  const store = useAuthStore();
  useEffect(() => {
    store.hydrate();
  }, []);
  return store;
}
