'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_AUTH_NEXT } from '@/features/auth/constants';

export function useAuthSuccessNavigate() {
  const router = useRouter();
  const didNavigateRef = React.useRef(false);
  const fallbackTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (fallbackTimerRef.current != null) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, []);

  return React.useCallback(() => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;

    router.replace(DEFAULT_AUTH_NEXT);
    router.refresh();

    if (typeof window !== 'undefined') {
      if (fallbackTimerRef.current != null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
      fallbackTimerRef.current = window.setTimeout(() => {
        if (window.location.pathname.startsWith('/auth')) {
          window.location.assign(DEFAULT_AUTH_NEXT);
        }
        fallbackTimerRef.current = null;
      }, 900);
    }
  }, [router]);
}
