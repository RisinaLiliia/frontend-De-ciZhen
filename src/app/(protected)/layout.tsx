// src/app/(protected)/layout.tsx
'use client';

import { RequireAuth } from '@/lib/auth/RequireAuth';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
