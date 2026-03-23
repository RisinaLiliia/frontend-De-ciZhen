import { describe, expect, it, vi } from 'vitest';

import type { I18nKey } from '@/lib/i18n/keys';

import {
  buildWorkspacePrivateContentDataArgs,
  buildWorkspacePrivateStateArgs,
  buildWorkspacePrivateViewModelInput,
  buildWorkspacePublicIntroProps,
} from './workspacePrivatePresentation.model';

function createBranch() {
  return {
    t: (key: I18nKey) => String(key),
    locale: 'en',
    auth: { user: { name: 'Liliya' } },
    isAuthed: true,
    isWorkspaceAuthed: true,
    isPersonalized: true,
    routeState: {} as never,
  };
}

function createData() {
  return {
    activePublicSection: 'requests',
    activeWorkspaceTab: 'my-offers',
    activeStatusFilter: 'all',
    activeFavoritesView: 'requests',
    myRequests: [{ id: 'req-1' }],
    myOffers: [{ id: 'offer-1', requestId: 'req-1' }],
    myOfferRequestsById: new Map([['req-1', { id: 'req-1' }]]),
    allMyContracts: [],
    favoriteRequests: [{ id: 'fav-req-1' }],
    favoriteProviders: [{ id: 'provider-1' }],
    isFavoriteRequestsLoading: false,
    isFavoriteProvidersLoading: false,
    favoriteProviderLookup: new Set(['provider-1']),
    pendingFavoriteProviderIds: new Set(['provider-2']),
    onToggleProviderFavorite: vi.fn(),
    favoriteProviderRoleLabelById: new Map([['provider-1', 'Role']]),
    favoriteProviderCityLabelById: new Map([['provider-1', 'Berlin']]),
    providers: [{ id: 'provider-1' }],
    platformRequestsTotal: 12,
    allRequestsSummary: undefined,
    workspacePrivateOverview: { profileCompletion: 75 },
    setWorkspaceTab: vi.fn(),
    markPublicRequestsSeen: vi.fn(),
    guestLoginHref: '/auth/login',
    onGuestLockedAction: vi.fn(),
    formatNumber: new Intl.NumberFormat('en'),
    chartMonthLabel: 'March',
    publicCityActivity: [],
    isPublicSummaryLoading: false,
    isPublicSummaryError: false,
    offersByRequest: new Map(),
    favoriteRequestIds: new Set(['req-1']),
    onToggleRequestFavorite: vi.fn(),
    onOpenOfferSheet: vi.fn(),
    onWithdrawOffer: vi.fn(),
    onOpenChatThread: vi.fn(),
    pendingOfferRequestId: null,
    pendingFavoriteRequestIds: new Set<string>(),
    serviceByKey: new Map(),
    categoryByKey: new Map(),
    cityById: new Map(),
    formatDate: new Intl.DateTimeFormat('en'),
    formatPrice: new Intl.NumberFormat('en'),
    isMyRequestsLoading: false,
    ownerRequestActions: {},
    isMyOffersLoading: false,
    isProviderContractsLoading: false,
    isClientContractsLoading: true,
    setFavoritesView: vi.fn(),
    isMyReviewsLoading: false,
    myReviews: [],
    isProvidersLoading: false,
    isProvidersError: true,
    favoriteProviderIds: new Set(['provider-1']),
    setStatusFilter: vi.fn(),
    isLoading: false,
    requestsCount: 12,
  };
}

describe('workspacePrivatePresentation.model', () => {
  it('builds content data args for derived, contract and cards hooks', () => {
    const args = buildWorkspacePrivateContentDataArgs({
      branch: createBranch() as never,
      data: createData() as never,
    });

    expect(args.derivedArgs.activeWorkspaceTab).toBe('my-offers');
    expect(args.contractArgs.locale).toBe('en');
    expect(args.cardsArgs.pendingFavoriteProviderIds).toEqual(new Set(['provider-2']));
  });

  it('builds private state args with provider-count fallback and public intro props', () => {
    const branch = createBranch();
    const data = createData();

    const privateStateArgs = buildWorkspacePrivateStateArgs({
      branch: branch as never,
      data: data as never,
    });
    const publicIntroProps = buildWorkspacePublicIntroProps({
      branch: branch as never,
      data: data as never,
      personalNavItems: [],
    });

    expect(privateStateArgs.publicProvidersCount).toBe(1);
    expect(privateStateArgs.userName).toBe('Liliya');
    expect(publicIntroProps.quickActionHref).toBe('/request/create');
    expect(publicIntroProps.hideDemandMapOnMobile).toBe(true);
  });

  it('builds private view model input by merging flow data with patch', () => {
    const onPrimaryActionClick = vi.fn();
    const input = buildWorkspacePrivateViewModelInput({
      branch: createBranch() as never,
      data: createData() as never,
      viewModelPatch: {
        showWorkspaceHeader: true,
        showWorkspaceHeading: true,
        primaryAction: { href: '/request/create', label: 'Create' },
        statusFilters: [],
        filteredMyRequests: [],
        filteredMyOffers: [],
        myOfferRequests: [],
        filteredContracts: [],
        hasFavoriteRequests: true,
        hasFavoriteProviders: false,
        resolvedFavoritesView: 'requests',
        favoritesItems: [],
        isFavoritesLoading: false,
        contractRequests: [],
        contractOffersByRequest: new Map(),
        favoriteProviderCards: [],
      },
      onPrimaryActionClick,
    });

    expect(input.onPrimaryActionClick).toBe(onPrimaryActionClick);
    expect(input.activeWorkspaceTab).toBe('my-offers');
    expect(input.isClientContractsLoading).toBe(true);
    expect(input.primaryAction.href).toBe('/request/create');
  });
});
