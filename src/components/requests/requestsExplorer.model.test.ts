import { describe, expect, it } from 'vitest';

import type { OfferDto } from '@/lib/api/dto/offers';
import {
  buildRequestsExplorerNextPath,
  buildRequestsExplorerProvidersContentProps,
  buildRequestsExplorerRequestsContentProps,
  buildOffersByRequestMap,
  hasDefaultPublicFilter,
  pickRequestsExplorerSharedFilters,
  resolveTotalPages,
} from '@/components/requests/requestsExplorer.model';
import type { RequestsExplorerSharedFilters } from '@/components/requests/requestsExplorer.types';

describe('requestsExplorer.model', () => {
  it('detects default public filter state', () => {
    expect(hasDefaultPublicFilter({ sort: 'date_desc', page: 1, limit: 20 })).toBe(true);
    expect(hasDefaultPublicFilter({ cityId: 'berlin', sort: 'date_desc', page: 1, limit: 20 })).toBe(false);
    expect(hasDefaultPublicFilter({ sort: 'price_desc', page: 1, limit: 20 })).toBe(false);
  });

  it('keeps latest offer per request in offers map', () => {
    const older = {
      id: 'offer-old',
      requestId: 'req-1',
      updatedAt: '2026-03-01T10:00:00.000Z',
    } as OfferDto;
    const newer = {
      id: 'offer-new',
      requestId: 'req-1',
      updatedAt: '2026-03-03T10:00:00.000Z',
    } as OfferDto;
    const otherRequest = {
      id: 'offer-2',
      requestId: 'req-2',
      updatedAt: '2026-03-02T10:00:00.000Z',
    } as OfferDto;

    const byRequest = buildOffersByRequestMap([older, newer, otherRequest]);

    expect(byRequest.size).toBe(2);
    expect(byRequest.get('req-1')?.id).toBe('offer-new');
    expect(byRequest.get('req-2')?.id).toBe('offer-2');
  });

  it('resolves total pages safely', () => {
    expect(resolveTotalPages(0, 10)).toBe(1);
    expect(resolveTotalPages(21, 10)).toBe(3);
    expect(resolveTotalPages(21, 0)).toBe(21);
  });

  it('builds next path with an optional query string', () => {
    expect(buildRequestsExplorerNextPath('/workspace', null)).toBe('/workspace');
    expect(buildRequestsExplorerNextPath('/workspace', new URLSearchParams('tab=requests&page=2'))).toBe(
      '/workspace?tab=requests&page=2',
    );
  });

  it('projects shared explorer filters and builds providers content props', () => {
    const sharedFilters = pickRequestsExplorerSharedFilters({
      categoryOptions: [{ value: 'all', label: 'All categories' }],
      serviceOptions: [{ value: 'design', label: 'Design' }],
      cityOptions: [{ value: 'berlin', label: 'Berlin' }],
      sortOptions: [{ value: 'date_desc', label: 'Newest' }],
      categoryKey: 'all',
      subcategoryKey: 'design',
      cityId: 'berlin',
      sortBy: 'date_desc',
      page: 2,
      isCategoriesLoading: false,
      isServicesLoading: false,
      isPending: false,
      appliedFilterChips: [{ key: 'city', label: 'Berlin', onRemove: () => {} }],
      onCategoryChange: () => {},
      onSubcategoryChange: () => {},
      onCityChange: () => {},
      onSortChange: () => {},
      onReset: () => {},
      setPage: () => {},
    } satisfies RequestsExplorerSharedFilters);

    const providersContent = buildRequestsExplorerProvidersContentProps({
      t: (key) => key,
      locale: 'de',
      sharedFilters,
      providersData: {
        totalProvidersLabel: '12',
        totalProviderPages: 3,
        providersListDensity: 'double',
        setProvidersListDensity: () => {},
        isProvidersLoading: false,
        isProvidersError: false,
        filteredProvidersCount: 12,
        pagedProviders: [],
        favoriteProviderIds: new Set(['provider-1']),
        pendingFavoriteProviderIds: new Set(['provider-2']),
        toggleProviderFavorite: () => {},
      },
      showFilterControls: false,
    });

    expect(sharedFilters.page).toBe(2);
    expect(providersContent.onSetPage).toBe(sharedFilters.setPage);
    expect(providersContent.providersListDensity).toBe('double');
    expect(providersContent.showFilterControls).toBe(false);
  });

  it('builds requests content props from shared filter and request state', () => {
    const setPage = () => {};
    const sharedFilters: RequestsExplorerSharedFilters = {
      categoryOptions: [],
      serviceOptions: [],
      cityOptions: [],
      sortOptions: [],
      categoryKey: 'all',
      subcategoryKey: 'all',
      cityId: 'all',
      sortBy: 'date_desc',
      page: 1,
      isCategoriesLoading: false,
      isServicesLoading: false,
      isPending: false,
      appliedFilterChips: [],
      onCategoryChange: () => {},
      onSubcategoryChange: () => {},
      onCityChange: () => {},
      onSortChange: () => {},
      onReset: () => {},
      setPage,
    };

    const requestsContent = buildRequestsExplorerRequestsContentProps({
      t: (key) => key,
      locale: 'de',
      emptyCtaHref: '/workspace?section=requests',
      sharedFilters,
      requestsData: {
        totalResultsLabel: '4',
        requests: [],
        isLoading: false,
        isError: false,
        offersByRequest: new Map(),
        favoriteRequestIds: new Set(['request-1']),
        pendingFavoriteRequestIds: new Set(['request-2']),
        pendingOfferRequestId: 'request-3',
        totalPages: 6,
        openOfferSheet: () => {},
        onWithdrawOffer: () => {},
        toggleRequestFavorite: () => {},
      },
      catalogIndex: {
        serviceByKey: new Map(),
        categoryByKey: new Map(),
        cityById: new Map(),
      },
      formatDate: new Intl.DateTimeFormat('de-DE'),
      formatPrice: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      onListDensityChange: () => {},
      showTopFilters: true,
    });

    expect(requestsContent.setPage).toBe(setPage);
    expect(requestsContent.totalPages).toBe(6);
    expect(requestsContent.emptyCtaHref).toBe('/workspace?section=requests');
    expect(requestsContent.showTopFilters).toBe(true);
  });
});
