'use client';

import * as React from 'react';
import { useQueries } from '@tanstack/react-query';

import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
};

export function useWorkspaceFavoriteRequestData({ workspaceDataQueries }: Args) {
  const queryEntries = React.useMemo(
    () =>
      workspaceDataQueries.favoriteRequests.enabled
        ? [{ key: 'favoriteRequests' as const, query: workspaceDataQueries.favoriteRequests }]
        : [],
    [workspaceDataQueries.favoriteRequests],
  );

  const queryResults = useQueries({
    queries: queryEntries.map((entry) => entry.query),
  });

  const favoriteRequests =
    (queryResults[0]?.data as ReturnType<typeof workspaceDataQueries.favoriteRequests.queryFn> extends Promise<infer TResult> ? TResult : never) ?? [];
  const isFavoriteRequestsLoading = queryResults[0]?.isLoading ?? false;

  return {
    favoriteRequests,
    isFavoriteRequestsLoading,
  };
}
