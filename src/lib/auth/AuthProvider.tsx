// src/lib/auth/AuthProvider.tsx
'use client';

import * as React from 'react';
import { useAuthBootstrap, useAuthLastMode, useAuthSetLastMode, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthBootstrap();
  const status = useAuthStatus();
  const user = useAuthUser();
  const lastMode = useAuthLastMode();
  const setLastMode = useAuthSetLastMode();
  const didBootstrap = React.useRef(false);

  React.useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;
    bootstrap();
  }, [bootstrap]);

  React.useEffect(() => {
    if (status !== 'authenticated') return;
    if (lastMode) return;
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('dc_last_mode');
    if (stored === 'client' || stored === 'provider') {
      setLastMode(stored);
      return;
    }
    const fallback = user?.role === 'provider' ? 'provider' : 'client';
    setLastMode(fallback);
  }, [lastMode, setLastMode, status, user?.role]);

  return <>{children}</>;
}
