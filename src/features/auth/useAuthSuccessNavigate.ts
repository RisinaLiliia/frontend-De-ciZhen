'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export function useAuthSuccessNavigate(next: string) {
  const router = useRouter();
  const didNavigateRef = React.useRef(false);

  return React.useCallback(() => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;

    router.replace(next);
    router.refresh();

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (window.location.pathname.startsWith('/auth')) {
          window.location.assign(next);
        }
      }, 900);
    }
  }, [next, router]);
}
