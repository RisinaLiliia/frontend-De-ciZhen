'use client';

import { useAuthStore } from '@/features/auth/store';
import type { AuthStatus } from '@/features/auth/store';
import type { SafeUserDto } from '@/lib/api/dto/auth';
import { useShallow } from 'zustand/react/shallow';

export type AuthSnapshot = {
  status: AuthStatus;
  user: SafeUserDto | null;
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
