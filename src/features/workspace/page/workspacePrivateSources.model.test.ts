import { describe, expect, it, vi } from 'vitest';

import {
  buildWorkspacePrivateCatalogIndexArgs,
  buildWorkspacePrivateSourcesCollectionsArgs,
  buildWorkspacePrivateSourcesIdleRequestsStateArgs,
  shouldLoadWorkspacePrivatePublicRequestsState,
  shouldLoadWorkspacePrivateCatalog,
  shouldBuildWorkspacePrivateFavoriteProviderBackfill,
  shouldBuildWorkspacePrivateFavoriteProviderPresentation,
  shouldBuildWorkspacePrivateRequestCollections,
  resolveWorkspacePrivatePublicSummaryCityActivityLimit,
  buildWorkspacePrivateSourcesDataArgs,
  buildWorkspacePrivateSourcesRequestsStateArgs,
  resolveWorkspacePrivateSourcesResult,
} from './workspacePrivateSources.model';
import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/requests/workspace.constants';

describe('workspacePrivateSources.model', () => {
  it('disables private catalog loading for actions and unified private requests', () => {
    expect(
      shouldLoadWorkspacePrivateCatalog({
        activePublicSection: 'actions',
        activeWorkspaceTab: 'my-requests',
      }),
    ).toBe(false);

    expect(
      shouldLoadWorkspacePrivateCatalog({
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
        requestsScope: 'my',
      }),
    ).toBe(false);

    expect(
      shouldLoadWorkspacePrivateCatalog({
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
      }),
    ).toBe(true);
  });

  it('loads private public-requests state only for overview my-requests mode', () => {
    expect(
      shouldLoadWorkspacePrivatePublicRequestsState({
        activePublicSection: null,
        activeWorkspaceTab: 'my-requests',
      }),
    ).toBe(true);

    expect(
      shouldLoadWorkspacePrivatePublicRequestsState({
        activePublicSection: 'actions',
        activeWorkspaceTab: 'my-requests',
      }),
    ).toBe(false);

    expect(
      shouldLoadWorkspacePrivatePublicRequestsState({
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
      }),
    ).toBe(false);

    expect(
      shouldBuildWorkspacePrivateRequestCollections({
        activePublicSection: 'actions',
        activeWorkspaceTab: 'profile',
      }),
    ).toBe(false);

    expect(
      shouldBuildWorkspacePrivateRequestCollections({
        activePublicSection: null,
        activeWorkspaceTab: 'my-offers',
      }),
    ).toBe(true);

    expect(
      shouldBuildWorkspacePrivateRequestCollections({
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
      }),
    ).toBe(false);

    expect(
      shouldBuildWorkspacePrivateRequestCollections({
        activePublicSection: 'providers',
        activeWorkspaceTab: 'my-requests',
      }),
    ).toBe(false);

    expect(shouldBuildWorkspacePrivateFavoriteProviderBackfill()).toBe(true);
    expect(shouldBuildWorkspacePrivateFavoriteProviderPresentation()).toBe(false);
  });

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
      page: 1,
      limit: 20,
      locale: 'de',
      isAuthed: true,
      isWorkspaceAuthed: true,
      activeWorkspaceTab: 'my-requests',
      activeRequestsRole: 'provider',
      activeRequestsState: 'execution',
      activeRequestsSort: 'deadline',
    });

    expect(args).toMatchObject({
      locale: 'de',
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      activeRequestsRole: 'provider',
      activeRequestsState: 'execution',
      activeRequestsPeriod: '30d',
      activeRequestsSort: 'deadline',
      publicSummaryCityActivityLimit: WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
    });
  });

  it('drops public filter coupling from private data args when catalog is disabled', () => {
    const args = buildWorkspacePrivateSourcesDataArgs({
      filter: {
        cityId: 'berlin',
        categoryKey: 'design',
        subcategoryKey: 'logo',
        sort: 'date_desc',
        page: 3,
        limit: 24,
      },
      page: 3,
      limit: 24,
      shouldLoadCatalog: false,
      locale: 'de',
      isAuthed: true,
      isWorkspaceAuthed: true,
      activePublicSection: 'requests',
      activeWorkspaceTab: 'my-requests',
      requestsScope: 'my',
    });

    expect(args.filter).toEqual({ page: 3, limit: 24 });
    expect(args.requestsScope).toBe('my');
    expect(args.activePublicSection).toBe('requests');
  });

  it('uses minimal public summary city-activity payload outside private overview my-requests mode', () => {
    expect(
      resolveWorkspacePrivatePublicSummaryCityActivityLimit({
        activePublicSection: null,
        activeWorkspaceTab: 'my-requests',
      }),
    ).toBe(WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT);

    expect(
      resolveWorkspacePrivatePublicSummaryCityActivityLimit({
        activePublicSection: null,
        activeWorkspaceTab: 'profile',
      }),
    ).toBe(1);

    expect(
      resolveWorkspacePrivatePublicSummaryCityActivityLimit({
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
      }),
    ).toBe(1);
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
      contractData: {
        allRequestsSummary: { totalPublishedRequests: 12, totalActiveProviders: 5 },
      } as never,
      legacyPublicOverviewData: {
        overviewRequests: { items: [{ id: 'req-1' }], total: 1 },
        isLoading: false,
        isError: false,
      } as never,
      activePublicSection: 'requests',
    });

    const collectionsArgs = buildWorkspacePrivateSourcesCollectionsArgs({
      activePublicSection: null,
      activeWorkspaceTab: 'my-requests',
      requestsScope: 'market',
      requests: [{ id: 'req-1' }] as never,
      requestUserStateData: {
        favoriteRequests: [{ id: 'req-1' }],
        myOffers: [{ id: 'offer-1', requestId: 'req-1' }],
      } as never,
      providerSupportData: {
        providers: [{ id: 'provider-1' }],
        favoriteProviders: [{ id: 'provider-1' }],
      } as never,
      catalogIndex: {
        cityById: new Map([['city-1', { id: 'city-1', i18n: { de: 'Berlin' } }]]),
        serviceByKey: new Map([['svc-1', { key: 'svc-1', categoryKey: 'cat-1', i18n: { de: 'Painter' } }]]),
      },
      locale: 'de',
    });

    expect(requestsStateArgs.isWorkspacePublicSection).toBe(false);
    expect(requestsStateArgs.categoryKey).toBe('cat-1');
    expect(collectionsArgs.includeRequestCollections).toBe(true);
    expect(collectionsArgs.includeFavoriteProviderBackfill).toBe(true);
    expect(collectionsArgs.includeFavoriteProviderPresentation).toBe(false);
    expect(collectionsArgs.locale).toBe('de');
    expect(collectionsArgs.requests).toEqual([{ id: 'req-1' }]);
  });

  it('builds catalog index args for enabled and disabled private catalog paths', () => {
    const args = buildWorkspacePrivateCatalogIndexArgs({
      enabled: false,
      services: [{ key: 'svc-1' }] as never,
      categories: [{ key: 'cat-1' }] as never,
      cities: [{ id: 'city-1' }] as never,
    });

    expect(args).toMatchObject({
      enabled: false,
      services: [{ key: 'svc-1' }],
      categories: [{ key: 'cat-1' }],
      cities: [{ id: 'city-1' }],
    });
  });

  it('builds idle requests-state args for private tabs without overview market state', () => {
    const args = buildWorkspacePrivateSourcesIdleRequestsStateArgs({
      allRequestsSummary: { totalPublishedRequests: 12, totalActiveProviders: 5 },
      limit: 20,
      page: 2,
      setPage: vi.fn(),
      activePublicSection: null,
    });

    expect(args.publicRequests).toBeUndefined();
    expect(args.allRequestsSummary?.totalPublishedRequests).toBe(12);
    expect(args.hasActivePublicFilter).toBe(false);
    expect(args.cityId).toBe('all');
  });

  it('passes idle request-side collections for private tabs that do not render request data', () => {
    const args = buildWorkspacePrivateSourcesCollectionsArgs({
      activePublicSection: 'actions',
      activeWorkspaceTab: 'my-requests',
      requestsScope: 'market',
      requests: [{ id: 'req-1' }] as never,
      requestUserStateData: {
        favoriteRequests: [{ id: 'req-1' }],
        myOffers: [{ id: 'offer-1', requestId: 'req-1' }],
      } as never,
      providerSupportData: {
        providers: [{ id: 'provider-1' }],
        favoriteProviders: [{ id: 'provider-1' }],
      } as never,
      catalogIndex: {
        cityById: new Map(),
        serviceByKey: new Map(),
      },
      locale: 'de',
    });

    expect(args.includeRequestCollections).toBe(false);
    expect(args.requests).toEqual([]);
    expect(args.favoriteRequests).toEqual([]);
    expect(args.myOffers).toEqual([]);
    expect(args.myProviderContracts).toEqual([]);
    expect(args.myClientContracts).toEqual([]);
    expect(args.providers).toEqual([{ id: 'provider-1' }]);
    expect(args.favoriteProviders).toEqual([{ id: 'provider-1' }]);
  });

  it('passes idle request-side collections for unified private requests flow', () => {
    const args = buildWorkspacePrivateSourcesCollectionsArgs({
      activePublicSection: 'requests',
      activeWorkspaceTab: 'my-requests',
      requestsScope: 'my',
      requests: [{ id: 'req-1' }] as never,
      requestUserStateData: {
        favoriteRequests: [{ id: 'req-1' }],
        myOffers: [{ id: 'offer-1', requestId: 'req-1' }],
      } as never,
      providerSupportData: {
        providers: [{ id: 'provider-1' }],
        favoriteProviders: [{ id: 'provider-1' }],
      } as never,
      catalogIndex: {
        cityById: new Map(),
        serviceByKey: new Map(),
      },
      locale: 'de',
    });

    expect(args.includeRequestCollections).toBe(false);
    expect(args.requests).toEqual([]);
    expect(args.favoriteRequests).toEqual([]);
    expect(args.myOffers).toEqual([]);
  });

  it('resolves final private sources payload from hook results', () => {
    const result = resolveWorkspacePrivateSourcesResult({
      contractData: {
        allRequestsSummary: { totalPublishedRequests: 12, totalActiveProviders: 5 },
        publicCityActivity: { totalActiveCities: 0, totalActiveRequests: 0, items: [] },
        isPublicSummaryLoading: false,
        isPublicSummaryError: false,
        privateOverviewState: {
          activityProgress: 0,
          navRatingValue: '0.0',
          navReviewsCount: 0,
          preferredRequestsRole: 'customer',
          myRequestsTotal: 0,
          sentCount: 0,
          completedJobsCount: 0,
          favoriteRequestCount: 0,
        },
        workspaceRequests: null,
        isWorkspaceRequestsLoading: false,
        isWorkspaceRequestsError: false,
        isWorkspacePrivateRequestsFallbackLoading: false,
      } as never,
      legacyPublicOverviewData: {
        overviewRequests: { items: [{ id: 'req-1' }], total: 1 },
        isLoading: true,
        isError: false,
      } as never,
      requestUserStateData: {
        myOffers: [{ id: 'offer-1', requestId: 'req-1' }],
        myOfferRequestsById: new Map([['req-1', { id: 'req-1' }]]),
        isMyOfferRequestsLoading: false,
        favoriteRequests: [{ id: 'req-1' }],
        isFavoriteRequestsLoading: false,
        isMyOffersLoading: false,
      } as never,
      providerSupportData: {
        providers: [{ id: 'provider-1' }],
        isProvidersLoading: false,
        isProvidersError: false,
        favoriteProviders: [{ id: 'provider-1' }],
        isFavoriteProvidersLoading: false,
      } as never,
      catalogIndex: {
        serviceByKey: new Map([['svc-1', { i18n: { de: 'Painter' } }]]),
        categoryByKey: new Map([['cat-1', { i18n: { de: 'Category' } }]]),
        cityById: new Map([['city-1', { i18n: { de: 'Berlin' } }]]),
      } as never,
      collections: {
        allMyContracts: [],
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
      filters: {
        page: 3,
        limit: 10,
        setPage: vi.fn(),
      },
    });

    expect(result.platformRequestsTotal).toBe(12);
    expect(result.overviewRequestsListState).toEqual({
      requests: [{ id: 'req-1' }, { id: 'req-2' }],
      isLoading: true,
      isError: false,
    });
    expect(result.overviewRequestsCount).toBe(2);
    expect(result.providerDirectoryState).toEqual({
      items: [{ id: 'provider-1' }],
      isLoading: false,
      isError: false,
      byId: new Map([['provider-1', { id: 'provider-1' }]]),
    });
    expect(result.favoriteProvidersState).toEqual({
      items: [{ id: 'provider-1' }],
      isLoading: false,
      ids: new Set(['provider-1']),
      lookup: new Set(['provider-1']),
      roleLabelsById: new Map([['provider-1', 'Painter']]),
      cityLabelsById: new Map([['provider-1', 'Berlin']]),
    });
    expect(result.privateOverviewState).toEqual({
      activityProgress: 0,
      navRatingValue: '0.0',
      navReviewsCount: 0,
      preferredRequestsRole: 'customer',
      myRequestsTotal: 0,
      sentCount: 0,
      completedJobsCount: 0,
      favoriteRequestCount: 0,
    });
    expect(result.workspaceRequests).toBeNull();
    expect(result.requestsPage).toBe(3);
    expect(result.requestsLimit).toBe(10);
  });
});
