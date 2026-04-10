'use client';

import type {
  WorkspaceMyRequestCardDto,
  WorkspaceRequestsResponseDto,
} from '@/lib/api/dto/workspace';

export type MyRequestsViewCard = WorkspaceMyRequestCardDto;
export type MyRequestsSummaryItem = NonNullable<WorkspaceRequestsResponseDto['summary']>['items'][number];

export type MyRequestsViewModel = {
  response: WorkspaceRequestsResponseDto;
  cards: MyRequestsViewCard[];
  emptyMode: 'none' | 'empty' | 'filtered';
};

export function createEmptyMyRequestsResponse(params: {
  locale: 'de' | 'en';
  role: NonNullable<WorkspaceRequestsResponseDto['filters']['role']>;
  state: NonNullable<WorkspaceRequestsResponseDto['filters']['state']>;
  period: NonNullable<WorkspaceRequestsResponseDto['filters']['period']>;
  sort: NonNullable<WorkspaceRequestsResponseDto['filters']['sort']>;
}): WorkspaceRequestsResponseDto {
  const isDe = params.locale === 'de';

  return {
    section: 'requests',
    scope: 'my',
    header: {
      title: isDe ? 'Meine Vorgänge' : 'My workflows',
    },
    filters: {
      role: params.role,
      state: params.state,
      period: params.period,
      sort: params.sort,
    },
    summary: {
      items: [
        {
          key: 'all',
          label: isDe ? 'Alle' : 'All',
          value: 0,
          isHighlighted: params.state === 'all',
        },
        {
          key: 'attention',
          label: isDe ? 'Aktiv' : 'Active',
          value: 0,
          isHighlighted: params.state === 'attention',
        },
        {
          key: 'execution',
          label: isDe ? 'In Ausführung' : 'In execution',
          value: 0,
          isHighlighted: params.state === 'execution',
        },
        {
          key: 'completed',
          label: isDe ? 'Abgeschlossen' : 'Completed',
          value: 0,
          isHighlighted: params.state === 'completed',
        },
      ],
    },
    list: {
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
      items: [],
    },
    decisionPanel: {
      summary: {
        totalNeedsAction: 0,
        highPriorityCount: 0,
        newOffersCount: 0,
        replyRequiredCount: 0,
        confirmCompletionCount: 0,
        overdueCount: 0,
      },
      primaryAction: {
        label: isDe ? 'Jetzt handeln' : 'Act now',
        mode: 'decision',
        targetFilter: 'needs_action',
      },
      queue: [],
      overview: {
        highUrgency: 0,
        inProgress: 0,
        completedThisPeriod: 0,
      },
    },
    sidePanel: null,
  };
}

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
