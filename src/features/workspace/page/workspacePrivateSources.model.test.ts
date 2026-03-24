import { describe, expect, it, vi } from 'vitest';

import {
  buildWorkspacePrivateSourcesCollectionsArgs,
  buildWorkspacePrivateSourcesDataArgs,
  buildWorkspacePrivateSourcesRequestsStateArgs,
  resolveWorkspacePrivateSourcesResult,
} from './workspacePrivateSources.model';

describe('workspacePrivateSources.model', () => {
  it('builds workspace data args for private sources flow', () => {
    const args = buildWorkspacePrivateSourcesDataArgs({
      filter: {
        cityId: 'berlin',
        categoryKey: 'design',
        subcategoryKey: undefined,
        sort: 'date_desc',
        page: 1,
        limit: 20,
      },
      locale: 'de',
      isAuthed: true,
      isWorkspaceAuthed: true,
      activeWorkspaceTab: 'my-requests',
    });

    expect(args).toMatchObject({
      locale: 'de',
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
    });
  });

  it('builds requests-state and collections args from filters/data/index', () => {
    const requestsStateArgs = buildWorkspacePrivateSourcesRequestsStateArgs({
      filters: {
        limit: 20,
        page: 2,
        setPage: vi.fn(),
        hasActivePublicFilter: true,
        cityId: 'all',
        categoryKey: 'cat-1',
        subcategoryKey: 'all',
        sortBy: 'date_desc',
      },
      data: {
        publicRequests: { items: [{ id: 'req-1' }], total: 1 },
        allRequestsSummary: { totalPublishedRequests: 12, totalActiveProviders: 5 },
        isLoading: false,
        isError: false,
      } as never,
      activePublicSection: 'requests',
    });

    const collectionsArgs = buildWorkspacePrivateSourcesCollectionsArgs({
      requests: [{ id: 'req-1' }] as never,
      data: {
        favoriteRequests: [{ id: 'req-1' }],
        providers: [{ id: 'provider-1' }],
        favoriteProviders: [{ id: 'provider-1' }],
        myOffers: [{ id: 'offer-1', requestId: 'req-1' }],
        myProviderContracts: [{ id: 'contract-1' }],
        myClientContracts: [{ id: 'contract-2' }],
      } as never,
      catalogIndex: {
        cityById: new Map([['city-1', { id: 'city-1', i18n: { de: 'Berlin' } }]]),
        serviceByKey: new Map([['svc-1', { key: 'svc-1', categoryKey: 'cat-1', i18n: { de: 'Painter' } }]]),
      },
      locale: 'de',
    });

    expect(requestsStateArgs.isWorkspacePublicSection).toBe(false);
    expect(requestsStateArgs.categoryKey).toBe('cat-1');
    expect(collectionsArgs.locale).toBe('de');
    expect(collectionsArgs.requests).toEqual([{ id: 'req-1' }]);
  });

  it('resolves final private sources payload from hook results', () => {
    const result = resolveWorkspacePrivateSourcesResult({
      data: {
        allRequestsSummary: { totalPublishedRequests: 12, totalActiveProviders: 5 },
        publicCityActivity: { totalActiveCities: 0, totalActiveRequests: 0, items: [] },
        isPublicSummaryLoading: false,
        isPublicSummaryError: false,
        providers: [{ id: 'provider-1' }],
        isProvidersLoading: false,
        isProvidersError: false,
        workspacePrivateOverview: null,
        myOffers: [{ id: 'offer-1', requestId: 'req-1' }],
        myRequests: [{ id: 'req-1' }],
        myOfferRequestsById: new Map([['req-1', { id: 'req-1' }]]),
        favoriteRequests: [{ id: 'req-1' }],
        favoriteProviders: [{ id: 'provider-1' }],
        myReviews: [],
        isFavoriteRequestsLoading: false,
        isFavoriteProvidersLoading: false,
        isMyRequestsLoading: false,
        isMyOffersLoading: false,
        isProviderContractsLoading: true,
        isClientContractsLoading: false,
        isMyReviewsLoading: false,
        isLoading: true,
      } as never,
      catalogIndex: {
        serviceByKey: new Map([['svc-1', { i18n: { de: 'Painter' } }]]),
        categoryByKey: new Map([['cat-1', { i18n: { de: 'Category' } }]]),
        cityById: new Map([['city-1', { i18n: { de: 'Berlin' } }]]),
      } as never,
      collections: {
        allMyContracts: [{ id: 'contract-1' }],
        favoriteProviderIds: new Set(['provider-1']),
        offersByRequest: new Map([['req-1', { id: 'offer-1' }]]),
        favoriteRequestIds: new Set(['req-1']),
        favoriteProviderLookup: new Set(['provider-1']),
        requestById: new Map([['req-1', { id: 'req-1' }]]),
        providerById: new Map([['provider-1', { id: 'provider-1' }]]),
        favoriteProviderRoleLabelById: new Map([['provider-1', 'Painter']]),
        favoriteProviderCityLabelById: new Map([['provider-1', 'Berlin']]),
      } as never,
      publicRequestsState: {
        platformRequestsTotal: 12,
        requests: [{ id: 'req-1' }, { id: 'req-2' }],
      } as never,
    });

    expect(result.platformRequestsTotal).toBe(12);
    expect(result.publicRequests).toEqual([{ id: 'req-1' }, { id: 'req-2' }]);
    expect(result.isPublicRequestsError).toBeUndefined();
    expect(result.requestsCount).toBe(2);
    expect(result.isProviderContractsLoading).toBe(true);
    expect(result.favoriteProviderIds).toEqual(new Set(['provider-1']));
  });
});
