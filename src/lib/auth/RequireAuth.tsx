// src/lib/auth/RequireAuth.tsx
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStatus();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/auth/login${next}`);
    }
  }, [status, pathname, router]);

  if (status === 'loading' || status === 'idle') {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
