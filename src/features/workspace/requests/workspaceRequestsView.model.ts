'use client';

import type {
  WorkspaceMyRequestCardDto,
  WorkspaceRequestsResponseDto,
} from '@/lib/api/dto/workspace';

export type WorkspaceRequestsViewCard = WorkspaceMyRequestCardDto;
export type WorkspaceRequestsSummaryItem = NonNullable<WorkspaceRequestsResponseDto['summary']>['items'][number];

export type WorkspaceRequestsViewModel = {
  response: WorkspaceRequestsResponseDto | null;
  cards: WorkspaceRequestsViewCard[];
  emptyMode: 'none' | 'empty' | 'filtered';
};

function resolveEmptyMode(response: WorkspaceRequestsResponseDto | null): WorkspaceRequestsViewModel['emptyMode'] {
  if (!response) return 'none';
  const allCount = response.summary.items.find((item) => item.key === 'all')?.value ?? response.list.total;
  if (allCount === 0) return 'empty';
  return response.list.items.length === 0 ? 'filtered' : 'none';
}

export function buildWorkspaceRequestsViewModelFromResponse(
  response: WorkspaceRequestsResponseDto | null | undefined,
): WorkspaceRequestsViewModel {
  return {
    response: response ?? null,
    cards: response?.list.items ?? [],
    emptyMode: resolveEmptyMode(response ?? null),
  };
}
