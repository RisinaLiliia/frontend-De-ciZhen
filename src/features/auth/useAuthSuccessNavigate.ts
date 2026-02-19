'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export function useAuthSuccessNavigate(next: string) {
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

    router.replace(next);
    router.refresh();

    if (typeof window !== 'undefined') {
      if (fallbackTimerRef.current != null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
      fallbackTimerRef.current = window.setTimeout(() => {
        if (window.location.pathname.startsWith('/auth')) {
          window.location.assign(next);
        }
        fallbackTimerRef.current = null;
      }, 900);
    }
  }, [next, router]);
}
