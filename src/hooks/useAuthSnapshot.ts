'use client';

import { useAuthStore } from '@/features/auth/store';
import type { AuthStatus } from '@/features/auth/store';
import type { AppMeDto, CapabilitiesDto, SafeUserDto, UserMode } from '@/lib/api/dto/auth';
import { useShallow } from 'zustand/react/shallow';

export type AuthSnapshot = {
  status: AuthStatus;
  user: SafeUserDto | null;
  me: AppMeDto | null;
  capabilities: CapabilitiesDto | null;
  lastMode: UserMode | null;
  hasProviderProfile: boolean;
  hasClientProfile: boolean;
  role: SafeUserDto['role'] | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: SafeUserDto['role'];
    city?: string;
    language?: string;
    acceptPrivacyPolicy: boolean;
  }) => Promise<void>;
};

export function useAuthSnapshot(): AuthSnapshot {
  return useAuthStore(
    useShallow((s) => ({
      status: s.status,
      user: s.user,
      me: s.me,
      capabilities: s.capabilities,
      lastMode: s.lastMode,
      hasProviderProfile: s.hasProviderProfile,
      hasClientProfile: s.hasClientProfile,
      role: s.user?.role ?? null,
      login: s.login,
      logout: s.logout,
      register: s.register,
    })),
  );
}

export function useAuthStatus() {
  return useAuthStore((s) => s.status);
}

export function useAuthUser() {
  return useAuthStore((s) => s.user);
}

export function useAuthMe() {
  return useAuthStore((s) => s.me);
}

export function useAuthCapabilities() {
  return useAuthStore((s) => s.capabilities);
}

export function useAuthLastMode() {
  return useAuthStore((s) => s.lastMode);
}

export function useAuthSetLastMode() {
  return useAuthStore((s) => s.setLastMode);
}

export function useHasProviderProfile() {
  return useAuthStore((s) => s.hasProviderProfile);
}

export function useHasClientProfile() {
  return useAuthStore((s) => s.hasClientProfile);
}

export function useAuthRole() {
  return useAuthStore((s) => s.user?.role ?? null);
}

export function useAuthLogin() {
  return useAuthStore((s) => s.login);
}

export function useAuthLogout() {
  return useAuthStore((s) => s.logout);
}

export function useAuthRegister() {
  return useAuthStore((s) => s.register);
}

export function useAuthBootstrap() {
  return useAuthStore((s) => s.bootstrap);
}
