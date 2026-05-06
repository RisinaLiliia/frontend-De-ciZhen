'use client';

import * as React from 'react';
import { useQueries } from '@tanstack/react-query';

import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;
type WorkspaceLegacyRequestQuery =
  | WorkspaceDataQueries['favoriteRequests']
  | WorkspaceDataQueries['myReviews']
  | WorkspaceDataQueries['myRequests']
  | WorkspaceDataQueries['myProviderContracts']
  | WorkspaceDataQueries['myClientContracts'];

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
};

export function useWorkspaceLegacyRequestSupportData({ workspaceDataQueries }: Args) {
  const queryEntries = React.useMemo(
    (): Array<{ key: string; query: WorkspaceLegacyRequestQuery }> =>
      [
        { key: 'favoriteRequests', query: workspaceDataQueries.favoriteRequests },
        { key: 'myReviews', query: workspaceDataQueries.myReviews },
        { key: 'myRequests', query: workspaceDataQueries.myRequests },
        { key: 'myProviderContracts', query: workspaceDataQueries.myProviderContracts },
        { key: 'myClientContracts', query: workspaceDataQueries.myClientContracts },
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

  const favoriteRequests =
    (queryResultByKey.get('favoriteRequests')?.data as ReturnType<typeof workspaceDataQueries.favoriteRequests.queryFn> extends Promise<infer TResult> ? TResult : never) ?? [];
  const isFavoriteRequestsLoading = queryResultByKey.get('favoriteRequests')?.isLoading ?? false;
  const myReviews =
    (queryResultByKey.get('myReviews')?.data as ReturnType<typeof workspaceDataQueries.myReviews.queryFn> extends Promise<infer TResult> ? TResult : never) ?? [];
  const isMyReviewsLoading = queryResultByKey.get('myReviews')?.isLoading ?? false;
  const myRequests =
    (queryResultByKey.get('myRequests')?.data as ReturnType<typeof workspaceDataQueries.myRequests.queryFn> extends Promise<infer TResult> ? TResult : never) ?? [];
  const isMyRequestsLoading = queryResultByKey.get('myRequests')?.isLoading ?? false;
  const myProviderContracts =
    (queryResultByKey.get('myProviderContracts')?.data as ReturnType<typeof workspaceDataQueries.myProviderContracts.queryFn> extends Promise<infer TResult> ? TResult : never) ?? [];
  const isProviderContractsLoading = queryResultByKey.get('myProviderContracts')?.isLoading ?? false;
  const myClientContracts =
    (queryResultByKey.get('myClientContracts')?.data as ReturnType<typeof workspaceDataQueries.myClientContracts.queryFn> extends Promise<infer TResult> ? TResult : never) ?? [];
  const isClientContractsLoading = queryResultByKey.get('myClientContracts')?.isLoading ?? false;

  return {
    favoriteRequests,
    isFavoriteRequestsLoading,
    myReviews,
    isMyReviewsLoading,
    myRequests,
    isMyRequestsLoading,
    myProviderContracts,
    isProviderContractsLoading,
    myClientContracts,
    isClientContractsLoading,
  };
}
