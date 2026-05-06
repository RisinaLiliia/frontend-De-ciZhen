'use client';

import * as React from 'react';

import { trackUXEvent } from '@/lib/analytics';
import {
  resolveWorkspacePublicEmptyResultPayload,
  resolveWorkspacePublicRequestsPageClamp,
  resolveWorkspacePublicRequestsState,
  type WorkspacePublicRequestsStateArgs,
} from './workspacePublicRequestsState.model';

type Args = WorkspacePublicRequestsStateArgs & {
  setPage?: (page: number) => void;
};

export function useWorkspacePublicRequestsState({
  publicRequests,
  allRequestsSummary,
  limit,
  page,
  setPage,
  enablePageClamp = true,
  enableEmptyStateTracking = true,
  isWorkspacePublicSection,
  activePublicSection,
  isLoading,
  isError,
  hasActivePublicFilter,
  cityId,
  categoryKey,
  subcategoryKey,
  sortBy,
}: Args) {
  const { requests, totalResults, platformRequestsTotal, totalPages } = React.useMemo(
    () =>
      resolveWorkspacePublicRequestsState({
        publicRequests,
        allRequestsSummary,
        limit,
      }),
    [allRequestsSummary, limit, publicRequests],
  );

  React.useEffect(() => {
    if (!enablePageClamp) return;
    if (!setPage) return;
    const nextPage = resolveWorkspacePublicRequestsPageClamp(page, totalPages);
    if (nextPage !== null) setPage(nextPage);
  }, [enablePageClamp, page, setPage, totalPages]);

  React.useEffect(() => {
    if (!enableEmptyStateTracking) return;
    const payload = resolveWorkspacePublicEmptyResultPayload({
      isWorkspacePublicSection,
      activePublicSection,
      isLoading,
      isError,
      hasActivePublicFilter,
      cityId,
      categoryKey,
      subcategoryKey,
      sortBy,
      requestsCount: requests.length,
    });
    if (!payload) return;
    trackUXEvent('workspace_empty_result', payload);
  }, [
    activePublicSection,
    categoryKey,
    cityId,
    enableEmptyStateTracking,
    hasActivePublicFilter,
    isError,
    isLoading,
    isWorkspacePublicSection,
    requests.length,
    sortBy,
    subcategoryKey,
  ]);

  return {
    requests,
    totalResults,
    platformRequestsTotal,
    totalPages,
  };
}
