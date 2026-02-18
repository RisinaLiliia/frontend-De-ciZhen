// src/features/auth/store.ts
import { create } from 'zustand';
import type { AppMeDto, CapabilitiesDto, MeResponseDto, SafeUserDto, UserMode } from '@/lib/api/dto/auth';
import { getMe, login, logout, register } from '@/lib/auth/api';
import { allowRefreshAttempts, refreshAccessToken, suppressRefreshAttempts } from '@/lib/auth/session';
import { setAccessToken as setToken } from '@/lib/auth/token';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: SafeUserDto | null;
  me: AppMeDto | null;
  capabilities: CapabilitiesDto | null;
  lastMode: UserMode | null;
  hasProviderProfile: boolean;
  hasClientProfile: boolean;
  accessToken: string | null;
  error?: string | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: SafeUserDto | null) => void;
  setMe: (me: AppMeDto | null) => void;
  setLastMode: (mode: UserMode | null) => void;
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
  me: null,
  capabilities: null,
  lastMode: null,
  hasProviderProfile: false,
  hasClientProfile: false,
  accessToken: null,
  error: null,
  setAccessToken: (token) => {
    setToken(token);
    set({ accessToken: token });
  },
  setUser: (user) => set({ user }),
  setMe: (me) => {
    const prevLastMode = get().lastMode;
    const storedMode =
      typeof window !== 'undefined' ? window.localStorage.getItem('dc_last_mode') : null;
    const fallbackCapabilities = me
      ? { canProvide: Boolean(me?.providerProfile) || me.role === 'provider' }
      : null;
    const nextCapabilities = me?.capabilities ?? fallbackCapabilities;
    const nextLastMode =
      me?.lastMode ??
      prevLastMode ??
      (storedMode === 'client' || storedMode === 'provider' ? storedMode : null);

    set({
      me,
      capabilities: nextCapabilities,
      lastMode: nextLastMode,
      hasProviderProfile: Boolean(me?.providerProfile) || me?.role === 'provider',
      hasClientProfile: Boolean(me?.clientProfile) || me?.role === 'client',
      user: me
        ? {
            id: me.id,
            name: me.name,
            email: me.email,
            role: me.role,
            city: me.city,
            language: me.language,
            createdAt: me.createdAt,
          }
        : null,
    });
  },
  setLastMode: (mode) => {
    set({ lastMode: mode });
    if (typeof window !== 'undefined') {
      if (mode) {
        window.localStorage.setItem('dc_last_mode', mode);
      } else {
        window.localStorage.removeItem('dc_last_mode');
      }
    }
  },
  clear: () => {
    suppressRefreshAttempts();
    setToken(null);
    set({
      status: 'unauthenticated',
      user: null,
      me: null,
      capabilities: null,
      lastMode: null,
      hasProviderProfile: false,
      hasClientProfile: false,
      accessToken: null,
      error: null,
    });
  },
  bootstrap: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading', error: null });

    const token = await refreshAccessToken();
    if (!token) {
      suppressRefreshAttempts();
      set({
        status: 'unauthenticated',
        user: null,
        me: null,
        capabilities: null,
        lastMode: null,
        hasProviderProfile: false,
        hasClientProfile: false,
        accessToken: null,
      });
      return;
    }

    try {
      allowRefreshAttempts();
      setToken(token);
      set({ accessToken: token });
      const me = await getMe();
      get().setMe(me);
      set({ status: 'authenticated', accessToken: token });
    } catch {
      suppressRefreshAttempts();
      set({
        status: 'unauthenticated',
        user: null,
        me: null,
        capabilities: null,
        lastMode: null,
        hasProviderProfile: false,
        hasClientProfile: false,
        accessToken: null,
      });
    }
  },
  login: async (email, password) => {
    set({ status: 'loading', error: null });
    try {
      const data = await login({ email, password });
      allowRefreshAttempts();
      setToken(data.accessToken);
      set({ accessToken: data.accessToken });
      const me = await getMe();
      get().setMe(me);
      set({ status: 'authenticated', accessToken: data.accessToken });
    } catch (error) {
      suppressRefreshAttempts();
      set({
        status: 'unauthenticated',
        user: null,
        me: null,
        capabilities: null,
        lastMode: null,
        hasProviderProfile: false,
        hasClientProfile: false,
        accessToken: null,
        error: null,
      });
      throw error;
    }
  },
  register: async (payload) => {
    set({ status: 'loading', error: null });
    try {
      const data = await register(payload);
      allowRefreshAttempts();
      setToken(data.accessToken);
      set({ accessToken: data.accessToken });
      const me = await getMe();
      get().setMe(me);
      set({ status: 'authenticated', accessToken: data.accessToken });
    } catch (error) {
      suppressRefreshAttempts();
      set({
        status: 'unauthenticated',
        user: null,
        me: null,
        capabilities: null,
        lastMode: null,
        hasProviderProfile: false,
        hasClientProfile: false,
        accessToken: null,
        error: null,
      });
      throw error;
    }
  },
  logout: async () => {
    try {
      await logout();
    } finally {
      suppressRefreshAttempts();
      setToken(null);
      set({
        status: 'unauthenticated',
        user: null,
        me: null,
        capabilities: null,
        lastMode: null,
        hasProviderProfile: false,
        hasClientProfile: false,
        accessToken: null,
        error: null,
      });
    }
  },
  fetchMe: async () => {
    try {
      const me = await getMe();
      allowRefreshAttempts();
      get().setMe(me);
      set({ status: 'authenticated' });
      return me as MeResponseDto;
    } catch {
      suppressRefreshAttempts();
      setToken(null);
      set({
        status: 'unauthenticated',
        user: null,
        me: null,
        capabilities: null,
        lastMode: null,
        hasProviderProfile: false,
        hasClientProfile: false,
        accessToken: null,
      });
      return null;
    }
  },
}));

export const clearAuth = () => useAuthStore.getState().clear();
