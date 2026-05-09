'use client';

import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type {
  WorkspaceRequestsResponseDto,
} from '@/lib/api/dto/workspace';
import { mapWorkspaceRequestCardToPublicRequest } from '@/features/workspace/page/workspacePublicRequests.model';

export type ResolvedWorkspacePublicRequestsData = {
  requests: RequestResponseDto[];
  publicRequestsListItems: RequestResponseDto[];
  publicRequestsTotal: number;
  resolvedTotalResults: number;
  summaryItems: NonNullable<WorkspaceRequestsResponseDto['summary']>['items'];
  decisionPanel: WorkspaceRequestsResponseDto['decisionPanel'] | null;
  publicListPage: number;
  publicListLimit: number;
  publicListTotalPages: number;
};

export function resolveWorkspacePublicRequestsData(params: {
  marketResponse?: WorkspaceRequestsResponseDto | null;
  filtersPage: number;
  filtersLimit: number;
}) : ResolvedWorkspacePublicRequestsData {
  const {
    marketResponse,
    filtersPage,
    filtersLimit,
  } = params;

  const marketListItems = marketResponse?.list.items?.map(mapWorkspaceRequestCardToPublicRequest) ?? [];
  const requests = marketListItems;
  const publicRequestsTotal = marketResponse?.list.total ?? 0;
  const publicRequestsListItems = requests;
  const resolvedTotalResults = publicRequestsTotal;
  const summaryItems = marketResponse?.summary.items ?? [];
  const publicListPage = marketResponse?.list.page ?? filtersPage;
  const publicListLimit = marketResponse?.list.limit ?? filtersLimit;
  const publicListTotalPages = Math.max(1, Math.ceil(publicRequestsTotal / Math.max(1, publicListLimit)));
  const decisionPanel = marketResponse ? marketResponse.decisionPanel : null;

  return {
    requests,
    publicRequestsListItems,
    publicRequestsTotal,
    resolvedTotalResults,
    summaryItems,
    decisionPanel,
    publicListPage,
    publicListLimit,
    publicListTotalPages,
  };
}
