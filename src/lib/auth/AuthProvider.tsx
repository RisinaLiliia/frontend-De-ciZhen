// src/lib/auth/AuthProvider.tsx
'use client';

import * as React from 'react';
import { useAuthBootstrap } from '@/hooks/useAuthSnapshot';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthBootstrap();

  React.useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return <>{children}</>;
}
