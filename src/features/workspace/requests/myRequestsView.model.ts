'use client';

import type {
  WorkspaceMyRequestCardDto,
  WorkspaceRequestsResponseDto,
  WorkspaceRequestsSidePanelDto,
} from '@/lib/api/dto/workspace';

export type MyRequestsViewCard = WorkspaceMyRequestCardDto;
export type MyRequestsSummaryItem = NonNullable<WorkspaceRequestsResponseDto['summary']>['items'][number];
export type MyRequestsRailModel = WorkspaceRequestsSidePanelDto;

export type MyRequestsViewModel = {
  response: WorkspaceRequestsResponseDto;
  cards: MyRequestsViewCard[];
  emptyMode: 'none' | 'empty' | 'filtered';
};

function resolveEmptyMode(response: WorkspaceRequestsResponseDto): MyRequestsViewModel['emptyMode'] {
  const allCount = response.summary?.items.find((item) => item.key === 'all')?.value ?? response.list.total;
  if (allCount === 0) return 'empty';
  return response.list.items.length === 0 ? 'filtered' : 'none';
}

export function buildMyRequestsViewModelFromResponse(response: WorkspaceRequestsResponseDto): MyRequestsViewModel {
  return {
    response,
    cards: response.list.items,
    emptyMode: resolveEmptyMode(response),
  };
}
