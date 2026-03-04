'use client';

import * as React from 'react';

import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { trackUXEvent } from '@/lib/analytics';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';

type RequestsResponse = {
  items: RequestResponseDto[];
  total: number;
};

type SummaryResponse = {
  total: number;
};

type Args = {
  publicRequests: RequestsResponse | undefined;
  allRequestsSummary: SummaryResponse | undefined;
  limit: number;
  page?: number;
  setPage?: (page: number) => void;
  isWorkspacePublicSection: boolean;
  activePublicSection: PublicWorkspaceSection | null;
  isLoading: boolean;
  isError: boolean;
  hasActivePublicFilter: boolean;
  cityId: string;
  categoryKey: string;
  subcategoryKey: string;
  sortBy: string;
};

export function useWorkspacePublicRequestsState({
  publicRequests,
  allRequestsSummary,
  limit,
  page,
  setPage,
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
  const requests = React.useMemo(() => publicRequests?.items ?? [], [publicRequests]);
  const totalResults = publicRequests?.total ?? requests.length;
  const platformRequestsTotal = allRequestsSummary?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / limit));

  React.useEffect(() => {
    if (typeof page !== 'number' || !setPage) return;
    if (page > totalPages) setPage(totalPages);
  }, [page, setPage, totalPages]);

  React.useEffect(() => {
    const isPublicRequestsContext = isWorkspacePublicSection && activePublicSection === 'requests';
    if (!isPublicRequestsContext) return;
    if (isLoading || isError || requests.length > 0) return;
    trackUXEvent('workspace_empty_result', {
      tab: 'public-requests',
      hasFilters: hasActivePublicFilter,
      cityId: cityId === ALL_OPTION_KEY ? null : cityId,
      categoryKey: categoryKey === ALL_OPTION_KEY ? null : categoryKey,
      subcategoryKey: subcategoryKey === ALL_OPTION_KEY ? null : subcategoryKey,
      sortBy,
    });
  }, [
    activePublicSection,
    categoryKey,
    cityId,
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
