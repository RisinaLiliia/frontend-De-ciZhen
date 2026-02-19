'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_AUTH_NEXT } from '@/features/auth/constants';

export function useAuthSuccessNavigate() {
  const router = useRouter();
  const didNavigateRef = React.useRef(false);
  const fallbackTimerRef = React.useRef<number | null>(null);

  const sanitizeNext = React.useCallback((nextPath?: string | null) => {
    if (!nextPath) return DEFAULT_AUTH_NEXT;
    const value = String(nextPath).trim();
    if (!value.startsWith('/')) return DEFAULT_AUTH_NEXT;
    if (/[\r\n]/.test(value)) return DEFAULT_AUTH_NEXT;
    return value;
  }, []);

  React.useEffect(() => {
    return () => {
      if (fallbackTimerRef.current != null) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, []);

  return React.useCallback((nextPath?: string | null) => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;
    const target = sanitizeNext(nextPath);

    router.replace(target);
    router.refresh();

    if (typeof window !== 'undefined') {
      if (fallbackTimerRef.current != null) {
        window.clearTimeout(fallbackTimerRef.current);
      }

      fallbackTimerRef.current = window.setTimeout(() => {
        const isAuthPath = window.location.pathname.startsWith('/auth');
        const hasAuthModal = Boolean(document.querySelector('.auth-route-modal'));
        const targetUrl = new URL(target, window.location.origin);
        const isAtTarget =
          window.location.pathname === targetUrl.pathname &&
          window.location.search === targetUrl.search;

        // Always exit auth flow after success. If client navigation stalls,
        // force a hard navigation to target.
        if (isAuthPath || hasAuthModal || !isAtTarget) {
          window.location.replace(target);
        }

        fallbackTimerRef.current = null;
      }, 900);
    }
  }, [router, sanitizeNext]);
}
