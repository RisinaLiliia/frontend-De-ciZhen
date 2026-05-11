/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import {
  useWorkspaceCollections,
  useWorkspacePublicFilters,
  useWorkspacePublicRequestsState,
} from '@/features/workspace';
import { useWorkspacePrivateSources } from '@/features/workspace/page/useWorkspacePrivateSources';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspaceData } from '@/features/workspace/requests';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/requests/workspace.constants';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

vi.mock('@/hooks/useCatalogIndex', () => ({
  useCatalogIndex: vi.fn(),
}));

vi.mock('@/features/workspace/requests', () => ({
  useWorkspaceData: vi.fn(),
}));

vi.mock('@/features/workspace', () => ({
  useWorkspaceCollections: vi.fn(),
  useWorkspacePublicFilters: vi.fn(),
  useWorkspacePublicRequestsState: vi.fn(),
}));

const useWorkspacePublicFiltersMock = vi.mocked(useWorkspacePublicFilters);
const useCatalogIndexMock = vi.mocked(useCatalogIndex);
const useWorkspaceDataMock = vi.mocked(useWorkspaceData);
const useWorkspacePublicRequestsStateMock = vi.mocked(useWorkspacePublicRequestsState);
const useWorkspaceCollectionsMock = vi.mocked(useWorkspaceCollections);

type SourcesArgs = Parameters<typeof useWorkspacePrivateSources>[0];

function SourcesProbe(props: SourcesArgs) {
  const result = useWorkspacePrivateSources(props);
  return (
    <div
      data-testid="sources"
      data-platform-total={String(result.platformRequestsTotal)}
      data-requests-count={String(result.overviewRequestsCount)}
      data-favorite-provider-count={String(result.favoriteProvidersState.ids.size)}
    />
  );
}

afterEach(() => {
  cleanup();
});

describe('useWorkspacePrivateSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const filter = { categoryKey: 'cat-1', cityId: 'all' };
    const setPage = vi.fn();

    useWorkspacePublicFiltersMock.mockReturnValue({
      cities: [{ id: 'city-1' }],
      categories: [{ key: 'cat-1' }],
      services: [{ key: 'svc-1' }],
      categoryKey: 'cat-1',
      subcategoryKey: 'all',
      cityId: 'all',
      sortBy: 'date_desc',
      page: 2,
      limit: 20,
      filter,
      setPage,
      hasActivePublicFilter: true,
    } as never);

    useCatalogIndexMock.mockReturnValue({
      serviceByKey: new Map([['svc-1', { i18n: { de: 'Service' } }]]),
      categoryByKey: new Map([['cat-1', { i18n: { de: 'Category' } }]]),
      cityById: new Map([['city-1', { i18n: { de: 'Berlin' } }]]),
    } as never);

    const request = { id: 'req-1' } as RequestResponseDto;
    const offer = { id: 'offer-1', requestId: 'req-1' } as OfferDto;
    const provider = { id: 'provider-1' } as ProviderPublicDto;
    const contract = { id: 'contract-1' } as ContractDto;

    useWorkspaceDataMock.mockReturnValue({
      contractData: {
        allRequestsSummary: { totalPublishedRequests: 12, totalActiveProviders: 5 },
        workspaceRequests: null,
        isWorkspaceRequestsLoading: false,
        isWorkspaceRequestsError: false,
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
        isWorkspacePrivateRequestsFallbackLoading: false,
        publicCityActivity: null,
        isPublicSummaryLoading: false,
        isPublicSummaryError: false,
      },
      legacyPublicOverviewData: {
        overviewRequests: { items: [request], total: 1 },
        isLoading: false,
        isError: false,
      },
      requestUserStateData: {
        myOffers: [offer],
        isMyOffersLoading: false,
        myOfferRequestsById: new Map([['req-1', request]]),
        isMyOfferRequestsLoading: false,
        favoriteRequests: [request],
        isFavoriteRequestsLoading: false,
      },
      legacyMyRequestsData: {
        myRequests: [request],
        isMyRequestsLoading: false,
      },
      legacyContractSupportData: {
        myProviderContracts: [contract],
        isProviderContractsLoading: false,
        myClientContracts: [contract],
        isClientContractsLoading: false,
      },
      legacyReviewSupportData: {
        myReviews: [],
        isMyReviewsLoading: false,
      },
      legacyProviderSupportData: {
        favoriteProviders: [provider],
        isFavoriteProvidersLoading: false,
        providers: [provider],
        isProvidersLoading: false,
        isProvidersError: false,
      },
    } as never);

    useWorkspacePublicRequestsStateMock.mockReturnValue({
      requests: [request, { id: 'req-2' } as RequestResponseDto],
      platformRequestsTotal: 12,
    } as never);

    useWorkspaceCollectionsMock.mockReturnValue({
      favoriteRequestIds: new Set(['req-1']),
      requestById: new Map([['req-1', request]]),
      providerById: new Map([['provider-1', provider]]),
      favoriteProviderLookup: new Set(['provider-1']),
      favoriteProviderIds: new Set(['provider-1']),
      offersByRequest: new Map([['req-1', offer]]),
      allMyContracts: [contract],
      favoriteProviderCityLabelById: new Map([['provider-1', 'Berlin']]),
      favoriteProviderRoleLabelById: new Map([['provider-1', 'Painter']]),
    } as never);
  });

  it('wires public filters/data/collections and exposes aggregated source payload', () => {
    const t: WorkspaceBranchProps['t'] = (key) => String(key);

    render(
      <SourcesProbe
        t={t}
        locale="de"
        isAuthed
        isWorkspaceAuthed
        activePublicSection={null}
        activeWorkspaceTab="my-requests"
        activeRequestsRole="provider"
        activeRequestsState="execution"
        activeRequestsSort="deadline"
      />,
    );

    const node = screen.getByTestId('sources');
    expect(node.getAttribute('data-platform-total')).toBe('12');
    expect(node.getAttribute('data-requests-count')).toBe('2');
    expect(node.getAttribute('data-favorite-provider-count')).toBe('1');

    expect(useWorkspacePublicFiltersMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'de',
        shouldLoadCatalog: true,
      }),
    );

    expect(useWorkspaceDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isWorkspacePublicSection: false,
        shouldLoadPrivateData: true,
        activeWorkspaceTab: 'my-requests',
        activeRequestsRole: 'provider',
        activeRequestsState: 'execution',
        activeRequestsPeriod: '30d',
        activeRequestsSort: 'deadline',
        publicSummaryCityActivityLimit: WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
      }),
    );

    expect(useWorkspacePublicRequestsStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        activePublicSection: null,
        enablePageClamp: true,
        enableEmptyStateTracking: true,
        isWorkspacePublicSection: false,
        categoryKey: 'cat-1',
      }),
    );

    expect(useWorkspaceCollectionsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'de',
      }),
    );
  });

  it('disables catalog loading for private actions/profile flow', () => {
    const t: WorkspaceBranchProps['t'] = (key) => String(key);

    render(
      <SourcesProbe
        t={t}
        locale="de"
        isAuthed
        isWorkspaceAuthed
        activePublicSection={null}
        activeWorkspaceTab="profile"
      />,
    );

    expect(useWorkspacePublicFiltersMock).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldLoadCatalog: false,
      }),
    );

    expect(useCatalogIndexMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );

    expect(useWorkspaceDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {},
        activeWorkspaceTab: 'profile',
        publicSummaryCityActivityLimit: 1,
      }),
    );

    expect(useWorkspacePublicRequestsStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enablePageClamp: false,
        enableEmptyStateTracking: false,
        publicRequests: undefined,
        hasActivePublicFilter: false,
      }),
    );
  });

  it('disables private catalog loading for unified private requests flow', () => {
    const t: WorkspaceBranchProps['t'] = (key) => String(key);

    render(
      <SourcesProbe
        t={t}
        locale="de"
        isAuthed
        isWorkspaceAuthed
        activePublicSection="requests"
        activeWorkspaceTab="my-requests"
        requestsScope="my"
      />,
    );

    expect(useWorkspacePublicFiltersMock).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldLoadCatalog: false,
      }),
    );

    expect(useWorkspaceDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {},
        activePublicSection: 'requests',
        requestsScope: 'my',
        activeWorkspaceTab: 'my-requests',
        publicSummaryCityActivityLimit: 1,
      }),
    );

    expect(useCatalogIndexMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });
});
