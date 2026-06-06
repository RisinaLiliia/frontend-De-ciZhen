'use client';

import { usePublicRequestsSeenTotal } from './usePublicRequestsSeenTotal';

type LegacyArgs = {
  isAuthed: boolean;
  userId: string | null | undefined;
  platformOrdersTotal?: number;
  platformRequestsTotal?: number;
  autoMarkSeen?: boolean;
};

export function usePublicOrdersSeenTotal({
  isAuthed,
  userId,
  platformOrdersTotal,
  platformRequestsTotal,
  autoMarkSeen = false,
}: LegacyArgs) {
  const total = platformRequestsTotal ?? platformOrdersTotal ?? 0;
  const { seenTotal, markPublicRequestsSeen } = usePublicRequestsSeenTotal({
    isAuthed,
    userId,
    platformRequestsTotal: total,
    autoMarkSeen,
  });
  return {
    seenTotal,
    markPublicOrdersSeen: markPublicRequestsSeen,
  };
}
