// src/lib/auth/RequireAuth.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DEFAULT_PUBLIC_REQUESTS_URL } from '@/features/auth/constants';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStatus();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(DEFAULT_PUBLIC_REQUESTS_URL);
    }
  }, [status, router]);

  if (status === 'loading' || status === 'idle') {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated') return <LoadingScreen />;

  return <>{children}</>;
}
