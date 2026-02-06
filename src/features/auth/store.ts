// src/features/auth/store.ts
import { create } from 'zustand';
import type { MeResponseDto, SafeUserDto } from '@/lib/api/dto/auth';
import { getMe, login, logout, register } from '@/lib/auth/api';
import { refreshAccessToken } from '@/lib/auth/session';
import { setAccessToken as setToken } from '@/lib/auth/token';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: SafeUserDto | null;
  accessToken: string | null;
  error?: string | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: SafeUserDto | null) => void;
  clear: () => void;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: SafeUserDto['role'];
    city?: string;
    language?: string;
    acceptPrivacyPolicy: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<MeResponseDto | null>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  user: null,
  accessToken: null,
  error: null,
  setAccessToken: (token) => {
    setToken(token);
    set({ accessToken: token });
  },
  setUser: (user) => set({ user }),
  clear: () => {
    setToken(null);
    set({ status: 'unauthenticated', user: null, accessToken: null, error: null });
  },
  bootstrap: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading', error: null });

    const token = await refreshAccessToken();
    if (!token) {
      set({ status: 'unauthenticated', user: null, accessToken: null });
      return;
    }

    try {
      setToken(token);
      set({ accessToken: token });
      const me = await getMe();
      set({ status: 'authenticated', user: me, accessToken: token });
    } catch {
      set({ status: 'unauthenticated', user: null, accessToken: null });
    }
  },
  login: async (email, password) => {
    set({ status: 'loading', error: null });
    try {
      const data = await login({ email, password });
      setToken(data.accessToken);
      set({ status: 'authenticated', user: data.user, accessToken: data.accessToken });
    } catch (error) {
      set({ status: 'unauthenticated', user: null, accessToken: null, error: null });
      throw error;
    }
  },
  register: async (payload) => {
    set({ status: 'loading', error: null });
    try {
      const data = await register(payload);
      setToken(data.accessToken);
      set({ status: 'authenticated', user: data.user, accessToken: data.accessToken });
    } catch (error) {
      set({ status: 'unauthenticated', user: null, accessToken: null, error: null });
      throw error;
    }
  },
  logout: async () => {
    try {
      await logout();
    } finally {
      setToken(null);
      set({ status: 'unauthenticated', user: null, accessToken: null, error: null });
    }
  },
  fetchMe: async () => {
    try {
      const me = await getMe();
      set({ status: 'authenticated', user: me });
      return me;
    } catch {
      setToken(null);
      set({ status: 'unauthenticated', user: null, accessToken: null });
      return null;
    }
  },
}));

export const clearAuth = () => useAuthStore.getState().clear();
