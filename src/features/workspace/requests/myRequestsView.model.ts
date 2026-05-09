'use client';

import type {
  WorkspaceMyRequestCardDto,
  WorkspaceRequestsResponseDto,
} from '@/lib/api/dto/workspace';

export type MyRequestsViewCard = WorkspaceMyRequestCardDto;
export type MyRequestsSummaryItem = NonNullable<WorkspaceRequestsResponseDto['summary']>['items'][number];

export type MyRequestsViewModel = {
  response: WorkspaceRequestsResponseDto | null;
  cards: MyRequestsViewCard[];
  emptyMode: 'none' | 'empty' | 'filtered';
};

function resolveEmptyMode(response: WorkspaceRequestsResponseDto | null): MyRequestsViewModel['emptyMode'] {
  if (!response) return 'none';
  const allCount = response.summary.items.find((item) => item.key === 'all')?.value ?? response.list.total;
  if (allCount === 0) return 'empty';
  return response.list.items.length === 0 ? 'filtered' : 'none';
}

export function buildMyRequestsViewModelFromResponse(
  response: WorkspaceRequestsResponseDto | null | undefined,
): MyRequestsViewModel {
  return {
    response: response ?? null,
    cards: response?.list.items ?? [],
    emptyMode: resolveEmptyMode(response ?? null),
  };
}
