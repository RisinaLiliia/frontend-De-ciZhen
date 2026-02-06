// src/app/(client)/layout.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RequireAuth } from '@/lib/auth/RequireAuth';
import { useAuthRole, useAuthStatus } from '@/hooks/useAuthSnapshot';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStatus();
  const role = useAuthRole();

  React.useEffect(() => {
    if (status === 'authenticated' && role && role !== 'client') {
      router.replace('/provider');
    }
  }, [status, role, router]);

  if (status === 'loading' || status === 'idle') {
    return <LoadingScreen />;
  }

  return <RequireAuth>{children}</RequireAuth>;
}
