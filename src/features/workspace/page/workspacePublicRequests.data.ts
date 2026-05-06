'use client';

import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type {
  WorkspaceRequestsResponseDto,
} from '@/lib/api/dto/workspace';

export type ResolvedWorkspacePublicRequestsData = {
  requests: RequestResponseDto[];
  publicRequestsListItems: RequestResponseDto[];
  publicRequestsTotal: number;
  resolvedTotalResults: number;
  summaryItems: NonNullable<WorkspaceRequestsResponseDto['summary']>['items'];
  decisionPanel: WorkspaceRequestsResponseDto['decisionPanel'];
  publicListPage: number;
  publicListLimit: number;
  publicListTotalPages: number;
};

export function resolveWorkspacePublicRequestsData(params: {
  marketResponse: WorkspaceRequestsResponseDto;
  publicRequestsItems?: RequestResponseDto[];
  publicRequestsTotalValue?: number;
  publicRequestsPage?: number;
  publicRequestsLimit?: number;
  filtersPage: number;
  filtersLimit: number;
}) : ResolvedWorkspacePublicRequestsData {
  const {
    marketResponse,
    publicRequestsItems,
    publicRequestsTotalValue,
    publicRequestsPage,
    publicRequestsLimit,
    filtersPage,
    filtersLimit,
  } = params;

  const requests = publicRequestsItems ?? [];
  const publicRequestsTotal = publicRequestsTotalValue ?? requests.length;
  const publicRequestsListItems = requests;
  const resolvedTotalResults = publicRequestsTotal;
  const summaryItems = marketResponse.summary?.items ?? [];
  const publicListPage = publicRequestsPage ?? filtersPage;
  const publicListLimit = publicRequestsLimit ?? filtersLimit;
  const publicListTotalPages = Math.max(1, Math.ceil(publicRequestsTotal / Math.max(1, publicListLimit)));
  const decisionPanel = marketResponse.decisionPanel ?? null;

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
