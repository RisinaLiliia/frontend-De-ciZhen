import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

export type WorkspacePublicRequestsResponse = {
  items: RequestResponseDto[];
  total: number;
};

export type WorkspacePublicRequestsSummary = {
  totalPublishedRequests: number;
  totalActiveProviders: number;
};

export type WorkspacePublicRequestsStateArgs = {
  publicRequests: WorkspacePublicRequestsResponse | undefined;
  allRequestsSummary: WorkspacePublicRequestsSummary | undefined;
  limit: number;
  page?: number;
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

type ResolveWorkspacePublicRequestsStateArgs = Pick<
  WorkspacePublicRequestsStateArgs,
  'publicRequests' | 'allRequestsSummary' | 'limit'
>;

type ResolveWorkspacePublicEmptyResultPayloadArgs = Pick<
  WorkspacePublicRequestsStateArgs,
  | 'isWorkspacePublicSection'
  | 'activePublicSection'
  | 'isLoading'
  | 'isError'
  | 'hasActivePublicFilter'
  | 'cityId'
  | 'categoryKey'
  | 'subcategoryKey'
  | 'sortBy'
> & {
  requestsCount: number;
};

export function resolveWorkspacePublicRequestsState({
  publicRequests,
  allRequestsSummary,
  limit,
}: ResolveWorkspacePublicRequestsStateArgs) {
  const requests = publicRequests?.items ?? [];
  const totalResults = publicRequests?.total ?? requests.length;
  const platformRequestsTotal = allRequestsSummary?.totalPublishedRequests ?? 0;
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.max(1, Math.ceil(totalResults / safeLimit));

  return {
    requests,
    totalResults,
    platformRequestsTotal,
    totalPages,
  };
}

export function resolveWorkspacePublicRequestsPageClamp(page: number | undefined, totalPages: number) {
  if (typeof page !== 'number') return null;
  return page > totalPages ? totalPages : null;
}

export function resolveWorkspacePublicEmptyResultPayload({
  isWorkspacePublicSection,
  activePublicSection,
  isLoading,
  isError,
  hasActivePublicFilter,
  cityId,
  categoryKey,
  subcategoryKey,
  sortBy,
  requestsCount,
}: ResolveWorkspacePublicEmptyResultPayloadArgs) {
  const isPublicRequestsContext = isWorkspacePublicSection && activePublicSection === 'requests';
  if (!isPublicRequestsContext || isLoading || isError || requestsCount > 0) {
    return null;
  }

  return {
    tab: 'public-requests',
    hasFilters: hasActivePublicFilter,
    cityId: cityId === ALL_OPTION_KEY ? null : cityId,
    categoryKey: categoryKey === ALL_OPTION_KEY ? null : categoryKey,
    subcategoryKey: subcategoryKey === ALL_OPTION_KEY ? null : subcategoryKey,
    sortBy,
  };
}
