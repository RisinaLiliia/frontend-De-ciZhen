import { describe, expect, it, vi } from 'vitest';

import {
  buildWorkspacePublicRequestsAsideProps,
  buildWorkspacePublicRequestsListProps,
  buildWorkspacePublicRequestsSummaryStripProps,
} from './workspacePublicRequests.view-model';

describe('workspacePublicRequests.view-model', () => {
  it('builds a market summary strip contract for the shared requests surface', () => {
    const onSelect = vi.fn();

    expect(buildWorkspacePublicRequestsSummaryStripProps({
      locale: 'de',
      items: [{ key: 'all', label: 'Alle', value: 12, isHighlighted: true }],
      onSelect,
    })).toEqual({
      locale: 'de',
      items: [{ key: 'all', label: 'Alle', value: 12, isHighlighted: true }],
      onSelect,
      variant: 'market',
    });
  });

  it('keeps list content and summary strip within one shared public surface contract', () => {
    const summaryStripProps = buildWorkspacePublicRequestsSummaryStripProps({
      locale: 'de',
      items: [{ key: 'all', label: 'Alle', value: 12, isHighlighted: true }],
      onSelect: vi.fn(),
    });

    expect(buildWorkspacePublicRequestsListProps({
      t: vi.fn(),
      locale: 'de',
      emptyCtaHref: '/workspace?section=requests&scope=market',
      topBar: { kind: 'none' },
      totalResultsLabel: '12',
      requests: [],
      isLoading: false,
      isError: false,
      pendingOfferRequestId: null,
      totalPages: 1,
      openOfferSheet: vi.fn(),
      toggleRequestFavorite: vi.fn(),
      formatDate: new Intl.DateTimeFormat('de-DE'),
      formatPrice: new Intl.NumberFormat('de-DE'),
      categoryOptions: [],
      serviceOptions: [],
      cityOptions: [],
      sortOptions: [],
      categoryKey: '',
      subcategoryKey: '',
      cityId: '',
      sortBy: 'date_desc',
      page: 1,
      limit: 20,
      isCategoriesLoading: false,
      isServicesLoading: false,
      isPending: false,
      appliedFilterChips: [],
      onCategoryChange: vi.fn(),
      onSubcategoryChange: vi.fn(),
      onCityChange: vi.fn(),
      onSortChange: vi.fn(),
      onReset: vi.fn(),
      setPage: vi.fn(),
      serviceByKey: new Map(),
      categoryByKey: new Map(),
      cityById: new Map(),
      summaryStripProps,
      isSummaryStripLoading: true,
    }).summaryStripProps).toEqual(summaryStripProps);
  });

  it('builds a market decision rail contract for the shared requests surface', () => {
    const panel = {
      summary: {
        totalNeedsAction: 3,
        highPriorityCount: 1,
        newOffersCount: 2,
        replyRequiredCount: 0,
        confirmCompletionCount: 0,
        overdueCount: 1,
      },
      primaryAction: {
        label: 'Markt prüfen',
        mode: 'decision' as const,
        targetFilter: 'needs_action' as const,
      },
      queue: [],
      overview: {
        highUrgency: 4,
        inProgress: 2,
        completedThisPeriod: 1,
      },
    };

    expect(buildWorkspacePublicRequestsAsideProps({
      locale: 'de',
      panel,
      onStartDecisionMode: vi.fn(),
      onOpenQueueItem: vi.fn(),
    }).variant).toBe('market');
  });
});
