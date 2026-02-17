// src/app/(client)/layout.tsx
'use client';

import * as React from 'react';
import { RequireAuth } from '@/lib/auth/RequireAuth';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const status = useAuthStatus();

  if (status === 'loading' || status === 'idle') {
    return <LoadingScreen />;
  }

  return <RequireAuth>{children}</RequireAuth>;
}
