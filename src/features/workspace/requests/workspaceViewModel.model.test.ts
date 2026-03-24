import { describe, expect, it, vi } from 'vitest';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { I18nKey } from '@/lib/i18n/keys';

import {
  buildWorkspacePrivateViewModel,
  buildWorkspacePublicViewModel,
} from './workspaceViewModel.model';
import type {
  BaseInput,
  FilterChip,
  FilterOption,
  PrivateInput,
  PublicInput,
} from './workspaceViewModel.types';
import type { WorkspaceStatusFilter } from './workspace.types';

function createBaseInput(): BaseInput {
  return {
    t: (key: I18nKey) => String(key),
    locale: 'en',
    statusFilters: [{ key: 'all' as WorkspaceStatusFilter, label: 'All' }],
    activeStatusFilter: 'all' as WorkspaceStatusFilter,
    setStatusFilter: vi.fn(),
    isPersonalized: false,
    offersByRequest: new Map<string, OfferDto>(),
    favoriteRequestIds: new Set<string>(['req-1']),
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
  };
}

describe('workspaceViewModel.model', () => {
  it('builds private workspace content props with combined section state', () => {
    const privateInput: PrivateInput = {
      ...createBaseInput(),
      isWorkspaceAuthed: true,
      activeWorkspaceTab: 'my-requests',
      showWorkspaceHeader: true,
      showWorkspaceHeading: true,
      primaryAction: { href: '/request/create', label: 'Create' },
      onPrimaryActionClick: vi.fn(),
      isMyRequestsLoading: false,
      filteredMyRequests: [],
      ownerRequestActions: {},
      isMyOffersLoading: true,
      filteredMyOffers: [],
      myOfferRequests: [],
      isProviderContractsLoading: true,
      isClientContractsLoading: false,
      filteredContracts: [],
      contractRequests: [],
      contractOffersByRequest: new Map(),
      isFavoritesLoading: false,
      favoritesItems: [{ id: 'fav-1' }],
      hasFavoriteRequests: true,
      hasFavoriteProviders: false,
      resolvedFavoritesView: 'requests',
      setFavoritesView: vi.fn(),
      favoriteRequests: [],
      isFavoriteRequestsLoading: false,
      favoriteProviderCards: null,
      isMyReviewsLoading: false,
      myReviews: [],
    };

    const { workspaceContentProps } = buildWorkspacePrivateViewModel(privateInput);

    expect(workspaceContentProps.myRequestsState).toEqual({ isLoading: false, isEmpty: true });
    expect(workspaceContentProps.myOffersState).toEqual({ isLoading: true, isEmpty: true });
    expect(workspaceContentProps.contractsState).toEqual({ isLoading: true, isEmpty: true });
    expect(workspaceContentProps.favoritesState.resolvedView).toBe('requests');
  });

  it('builds public workspace content props with pagination and status handlers', () => {
    const setPage = vi.fn();
    const setLimit = vi.fn();
    const setStatusFilter = vi.fn();
    const publicInput: PublicInput = {
      ...createBaseInput(),
      setStatusFilter,
      categoryOptions: [{ value: 'design', label: 'Design' }] satisfies FilterOption[],
      serviceOptions: [{ value: 'logo', label: 'Logo' }] satisfies FilterOption[],
      cityOptions: [{ value: 'berlin', label: 'Berlin' }] satisfies FilterOption[],
      sortOptions: [{ value: 'price_desc', label: 'Price' }] satisfies FilterOption[],
      categoryKey: 'design',
      subcategoryKey: 'logo',
      cityId: 'berlin',
      sortBy: 'price_desc',
      totalResultsLabel: '24',
      isCategoriesLoading: false,
      isServicesLoading: false,
      isFiltersPending: false,
      appliedFilterChips: [{ key: 'city', label: 'Berlin', onRemove: vi.fn() }] satisfies FilterChip[],
      onCategoryChangeTracked: vi.fn(),
      onSubcategoryChangeTracked: vi.fn(),
      onCityChangeTracked: vi.fn(),
      onSortChangeTracked: vi.fn(),
      onResetTracked: vi.fn(),
      hasActivePublicFilter: true,
      isLoading: false,
      isError: false,
      requestsCount: 2,
      requests: [{ id: 'req-1' }, { id: 'req-2' }] as never[],
      page: 3,
      limit: 20,
      totalPages: 5,
      setPage,
      setLimit,
    };

    const { publicContentProps } = buildWorkspacePublicViewModel(publicInput);

    publicContentProps.onPrevPage();
    publicContentProps.onNextPage();
    publicContentProps.onStatusFilterChange('open');

    expect(setPage).toHaveBeenNthCalledWith(1, 2);
    expect(setPage).toHaveBeenNthCalledWith(2, 4);
    expect(setStatusFilter).toHaveBeenCalledWith('open');
    expect(publicContentProps.filtersProps.totalResults).toBe('24');
    expect(publicContentProps.hasActivePublicFilter).toBe(true);
  });
});
