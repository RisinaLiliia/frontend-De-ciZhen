/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { I18nKey } from '@/lib/i18n/keys';

import { useWorkspacePrivateViewModel } from './useWorkspacePrivateViewModel';
import type { BaseInput, PrivateInput } from './workspaceViewModel.types';

const { buildWorkspacePrivateViewModelMock } = vi.hoisted(() => ({
  buildWorkspacePrivateViewModelMock: vi.fn(),
}));

vi.mock('@/features/workspace/view-model/workspaceViewModel.model', () => ({
  buildWorkspacePrivateViewModel: buildWorkspacePrivateViewModelMock,
}));

function createBaseInput(): BaseInput {
  return {
    t: (key: I18nKey) => String(key),
    locale: 'en',
    statusFilters: [{ key: 'all', label: 'All' }],
    activeStatusFilter: 'all',
    setStatusFilter: vi.fn(),
    isPersonalized: false,
    offersByRequest: new Map<string, OfferDto>(),
    favoriteRequestIds: new Set<string>(),
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

function createPrivateInput(): PrivateInput {
  return {
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
    isMyOffersLoading: false,
    filteredMyOffers: [],
    myOfferRequests: [],
    isProviderContractsLoading: false,
    isClientContractsLoading: false,
    filteredContracts: [],
    contractRequests: [],
    contractOffersByRequest: new Map(),
    isFavoritesLoading: false,
    favoritesItems: [],
    hasFavoriteRequests: false,
    hasFavoriteProviders: false,
    resolvedFavoritesView: 'requests',
    setFavoritesView: vi.fn(),
    favoriteRequests: [],
    isFavoriteRequestsLoading: false,
    favoriteProviderCards: null,
    isMyReviewsLoading: false,
    myReviews: [],
  };
}

function Harness({ enabled }: { enabled?: boolean }) {
  const { workspaceContentProps } = useWorkspacePrivateViewModel({
    ...createPrivateInput(),
    enabled,
  });

  return <div data-testid="workspace-content-state">{workspaceContentProps ? 'ready' : 'idle'}</div>;
}

describe('useWorkspacePrivateViewModel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('skips private workspace content view-model building when disabled', () => {
    render(<Harness enabled={false} />);

    expect(screen.getByTestId('workspace-content-state').textContent).toBe('idle');
    expect(buildWorkspacePrivateViewModelMock).not.toHaveBeenCalled();
  });

  it('builds private workspace content view-model when enabled', () => {
    buildWorkspacePrivateViewModelMock.mockReturnValue({
      workspaceContentProps: { activeWorkspaceTab: 'my-requests' },
    });

    render(<Harness enabled />);

    expect(screen.getByTestId('workspace-content-state').textContent).toBe('ready');
    expect(buildWorkspacePrivateViewModelMock).toHaveBeenCalledTimes(1);
  });
});
