'use client';

import { useWorkspacePublicRequestsState } from './useWorkspacePublicRequestsState';

type Args = Parameters<typeof useWorkspacePublicRequestsState>[0];

export function useWorkspacePublicOrdersState(args: Args) {
  const result = useWorkspacePublicRequestsState(args);
  return {
    ...result,
    platformOrdersTotal: result.platformRequestsTotal,
  };
}
