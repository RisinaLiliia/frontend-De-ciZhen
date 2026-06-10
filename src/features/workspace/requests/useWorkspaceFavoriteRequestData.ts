'use client';

import * as React from 'react';
import { useQueries } from '@tanstack/react-query';

import type { buildWorkspaceRequestUserStateQueries } from '@/features/workspace/requests/workspaceRequestUserState.queries';

type WorkspaceRequestUserStateQueries = ReturnType<typeof buildWorkspaceRequestUserStateQueries>;

type Args = {
  workspaceRequestUserStateQueries: WorkspaceRequestUserStateQueries;
};

export function useWorkspaceFavoriteRequestData({ workspaceRequestUserStateQueries }: Args) {
  const queryEntries = React.useMemo(
    () =>
      workspaceRequestUserStateQueries.favoriteRequests.enabled
        ? [
            {
              key: 'favoriteRequests' as const,
              query: workspaceRequestUserStateQueries.favoriteRequests,
            },
          ]
        : [],
    [workspaceRequestUserStateQueries.favoriteRequests],
  );

  const queryResults = useQueries({
    queries: queryEntries.map((entry) => entry.query),
  });

  const favoriteRequests =
    (queryResults[0]?.data as ReturnType<
      typeof workspaceRequestUserStateQueries.favoriteRequests.queryFn
    > extends Promise<infer TResult>
      ? TResult
      : never) ?? [];
  const isFavoriteRequestsLoading = queryResults[0]?.isLoading ?? false;

  return {
    favoriteRequests,
    isFavoriteRequestsLoading,
  };
}
