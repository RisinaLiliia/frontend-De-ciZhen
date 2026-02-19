// src/features/auth/store.ts
import { create } from 'zustand';
import type { AppMeDto, CapabilitiesDto, MeResponseDto, SafeUserDto, UserMode } from '@/lib/api/dto/auth';
import { completeOauthRegister, getMe, login, logout, register } from '@/lib/auth/api';
import {
  allowRefreshAttempts,
  clearSessionHint,
  markSessionHint,
  refreshAccessToken,
  shouldAttemptRefreshOnBootstrap,
  suppressRefreshAttempts,
} from '@/lib/auth/session';
import { setAccessToken as setToken } from '@/lib/auth/token';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

function logAuthWarning(scope: string, error: unknown) {
  if (process.env.NODE_ENV === 'production') return;
  // Keep diagnostics in dev without interrupting user flow.
  console.warn(`[auth] ${scope} failed`, error);
}

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
    acceptPrivacyPolicy: boolean;
    signupToken?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<MeResponseDto | null>;
};

export const useAuthStore = create<AuthState>((set, get) => {
  const setUnauthenticatedState = () => {
    suppressRefreshAttempts();
    clearSessionHint();
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
  };

  const setAuthenticatedTokenState = (accessToken: string) => {
    allowRefreshAttempts();
    markSessionHint();
    setToken(accessToken);
    set({ status: 'authenticated', accessToken, error: null });
  };

  return {
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
      setUnauthenticatedState();
    },
    bootstrap: async () => {
      if (get().status !== 'idle') return;
      if (!shouldAttemptRefreshOnBootstrap()) {
        setUnauthenticatedState();
        return;
      }

      set({ status: 'loading', error: null });

      const token = await refreshAccessToken();
      if (!token) {
        setUnauthenticatedState();
        return;
      }

      try {
        setAuthenticatedTokenState(token);
        const me = await getMe();
        get().setMe(me);
      } catch {
        setUnauthenticatedState();
      }
    },
    login: async (email, password) => {
      set({ status: 'loading', error: null });
      try {
        const data = await login({ email, password });
        setAuthenticatedTokenState(data.accessToken);
        void getMe()
          .then((me) => {
            get().setMe(me);
          })
          .catch((error) => {
            logAuthWarning('login:getMe', error);
          });
      } catch (error) {
        setUnauthenticatedState();
        throw error;
      }
    },
    register: async (payload) => {
      set({ status: 'loading', error: null });
      try {
        const data = payload.signupToken
          ? await completeOauthRegister({
              signupToken: payload.signupToken,
              acceptPrivacyPolicy: payload.acceptPrivacyPolicy,
            })
          : await register(payload);
        setAuthenticatedTokenState(data.accessToken);
        void getMe()
          .then((me) => {
            get().setMe(me);
          })
          .catch((error) => {
            logAuthWarning('register:getMe', error);
          });
      } catch (error) {
        setUnauthenticatedState();
        throw error;
      }
    },
    logout: async () => {
      try {
        await logout();
      } finally {
        setUnauthenticatedState();
      }
    },
    fetchMe: async () => {
      try {
        const me = await getMe();
        allowRefreshAttempts();
        markSessionHint();
        get().setMe(me);
        set({ status: 'authenticated', error: null });
        return me as MeResponseDto;
      } catch {
        setUnauthenticatedState();
        return null;
      }
    },
  };
});

export const clearAuth = () => useAuthStore.getState().clear();
