'use client';

import * as React from 'react';
import { useQueries } from '@tanstack/react-query';

import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;
type WorkspaceLegacyProviderQuery =
  | WorkspaceDataQueries['favoriteProviders']
  | WorkspaceDataQueries['providers'];

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
};

export function useWorkspaceLegacyProviderSupportData({ workspaceDataQueries }: Args) {
  const queryEntries = React.useMemo(
    (): Array<{ key: string; query: WorkspaceLegacyProviderQuery }> =>
      [
        { key: 'favoriteProviders', query: workspaceDataQueries.favoriteProviders },
        { key: 'providers', query: workspaceDataQueries.providers },
      ].filter((entry) => entry.query.enabled),
    [workspaceDataQueries],
  );

  const queryResults = useQueries({
    queries: queryEntries.map((entry) => entry.query),
  });

  const queryResultByKey = React.useMemo(
    () => new Map(queryEntries.map((entry, index) => [entry.key, queryResults[index]])),
    [queryEntries, queryResults],
  );

  const favoriteProviders =
    (queryResultByKey.get('favoriteProviders')?.data as ReturnType<typeof workspaceDataQueries.favoriteProviders.queryFn> extends Promise<infer TResult> ? TResult : never) ?? [];
  const isFavoriteProvidersLoading = queryResultByKey.get('favoriteProviders')?.isLoading ?? false;
  const providers =
    (queryResultByKey.get('providers')?.data as ReturnType<typeof workspaceDataQueries.providers.queryFn> extends Promise<infer TResult> ? TResult : never) ?? [];
  const isProvidersLoading = queryResultByKey.get('providers')?.isLoading ?? false;
  const isProvidersError = queryResultByKey.get('providers')?.isError ?? false;

  return {
    favoriteProviders,
    isFavoriteProvidersLoading,
    providers,
    isProvidersLoading,
    isProvidersError,
  };
}
