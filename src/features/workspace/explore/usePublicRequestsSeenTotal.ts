'use client';

import * as React from 'react';

import { WORKSPACE_PUBLIC_REQUESTS_SEEN_TOTAL_KEY_PREFIX } from '@/features/workspace/requests';

type Args = {
  isAuthed: boolean;
  userId: string | null | undefined;
  platformRequestsTotal: number;
  autoMarkSeen?: boolean;
};

export function usePublicRequestsSeenTotal({
  isAuthed,
  userId,
  platformRequestsTotal,
  autoMarkSeen = false,
}: Args) {
  const total = platformRequestsTotal;
  const [seenTotal, setSeenTotal] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !isAuthed) return;
    const storageKey = `${WORKSPACE_PUBLIC_REQUESTS_SEEN_TOTAL_KEY_PREFIX}:${userId ?? 'guest'}`;
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? Number(raw) : 0;
    const nextSeenTotal = Number.isFinite(parsed) ? parsed : 0;
    setSeenTotal((current) => (current === nextSeenTotal ? current : nextSeenTotal));
  }, [isAuthed, userId]);

  React.useEffect(() => {
    if (!isAuthed || typeof window === 'undefined') return;
    if (seenTotal > total) {
      const storageKey = `${WORKSPACE_PUBLIC_REQUESTS_SEEN_TOTAL_KEY_PREFIX}:${userId ?? 'guest'}`;
      window.localStorage.setItem(storageKey, String(total));
      setSeenTotal((current) => (current === total ? current : total));
    }
  }, [isAuthed, seenTotal, total, userId]);

  const markPublicRequestsSeen = React.useCallback(() => {
    if (typeof window === 'undefined' || !isAuthed) return;
    const storageKey = `${WORKSPACE_PUBLIC_REQUESTS_SEEN_TOTAL_KEY_PREFIX}:${userId ?? 'guest'}`;
    window.localStorage.setItem(storageKey, String(total));
    setSeenTotal((current) => (current === total ? current : total));
  }, [isAuthed, total, userId]);

  React.useEffect(() => {
    if (!autoMarkSeen || !isAuthed) return;
    if (seenTotal >= total) return;
    markPublicRequestsSeen();
  }, [autoMarkSeen, isAuthed, markPublicRequestsSeen, seenTotal, total]);

  return {
    seenTotal,
    markPublicRequestsSeen,
  };
}
