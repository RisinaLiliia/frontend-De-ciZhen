/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  usePublicRequestsSeenTotal,
  useWorkspaceActions,
  useWorkspaceFavoriteToggles,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
  useWorkspaceTabPersistence,
} from '@/features/workspace';
import { useWorkspacePrivateInteractions } from '@/features/workspace/page/useWorkspacePrivateInteractions';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/features/workspace', () => ({
  usePublicRequestsSeenTotal: vi.fn(),
  useWorkspaceActions: vi.fn(),
  useWorkspaceFavoriteToggles: vi.fn(),
  useWorkspaceFormatters: vi.fn(),
  useWorkspaceNavigation: vi.fn(),
  useWorkspaceTabPersistence: vi.fn(),
}));

const useRouterMock = vi.mocked(useRouter);
const useQueryClientMock = vi.mocked(useQueryClient);
const useWorkspaceFavoriteTogglesMock = vi.mocked(useWorkspaceFavoriteToggles);
const useWorkspaceActionsMock = vi.mocked(useWorkspaceActions);
const useWorkspaceFormattersMock = vi.mocked(useWorkspaceFormatters);
const usePublicRequestsSeenTotalMock = vi.mocked(usePublicRequestsSeenTotal);
const useWorkspaceNavigationMock = vi.mocked(useWorkspaceNavigation);
const useWorkspaceTabPersistenceMock = vi.mocked(useWorkspaceTabPersistence);

type InteractionsArgs = Parameters<typeof useWorkspacePrivateInteractions>[0];

function InteractionsProbe(props: InteractionsArgs) {
  const result = useWorkspacePrivateInteractions(props);

  return (
    <div
      data-testid="interactions"
      data-locale-tag={result.localeTag}
      data-has-mark-seen={String(typeof result.markPublicRequestsSeen === 'function')}
      data-has-pending-provider={String(result.pendingFavoriteProviderIds.has('provider-1'))}
    />
  );
}

afterEach(() => {
  cleanup();
});

describe('useWorkspacePrivateInteractions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useRouterMock.mockReturnValue({ push: vi.fn() } as never);
    useQueryClientMock.mockReturnValue({} as never);

    useWorkspaceFavoriteTogglesMock.mockReturnValue({
      pendingFavoriteRequestIds: new Set(['req-1']),
      pendingFavoriteProviderIds: new Set(['provider-1']),
      onToggleRequestFavorite: vi.fn(),
      onToggleProviderFavorite: vi.fn(),
    } as never);

    useWorkspaceActionsMock.mockReturnValue({
      pendingOfferRequestId: null,
      ownerRequestActions: {},
      onOpenOfferSheet: vi.fn(),
      onWithdrawOffer: vi.fn(),
      onOpenChatThread: vi.fn(),
    } as never);

    useWorkspaceFormattersMock.mockReturnValue({
      localeTag: 'de-DE',
      formatNumber: new Intl.NumberFormat('de-DE'),
      formatDate: new Intl.DateTimeFormat('de-DE'),
      formatPrice: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      chartMonthLabel: new Intl.DateTimeFormat('de-DE', { month: 'short' }),
    } as never);

    usePublicRequestsSeenTotalMock.mockReturnValue({
      markPublicRequestsSeen: vi.fn(),
    } as never);

    useWorkspaceNavigationMock.mockReturnValue({
      setWorkspaceTab: vi.fn(),
      setStatusFilter: vi.fn(),
      setFavoritesView: vi.fn(),
      setReviewsView: vi.fn(),
    } as never);

    useWorkspaceTabPersistenceMock.mockImplementation(() => undefined);
  });

  it('wires toggles/actions/navigation side-effects and exposes interaction payload', () => {
    const t: WorkspaceBranchProps['t'] = (key) => String(key);

    const offer = { id: 'offer-1', requestId: 'req-1' } as OfferDto;
    const request = { id: 'req-1' } as RequestResponseDto;
    const provider = { id: 'provider-1' } as ProviderPublicDto;

    const args: InteractionsArgs = {
      t,
      locale: 'de',
      isAuthed: true,
      isWorkspaceAuthed: true,
      authUserId: 'user-1',
      activeWorkspaceTab: 'favorites',
      nextPath: '/workspace?tab=favorites',
      platformRequestsTotal: 21,
      myOffers: [offer],
      favoriteRequestIds: new Set(['req-1']),
      requestById: new Map([['req-1', request]]),
      favoriteProviderLookup: new Set(['provider-1']),
      providerById: new Map([['provider-1', provider]]),
    };

    render(<InteractionsProbe {...args} />);

    const node = screen.getByTestId('interactions');
    expect(node.getAttribute('data-locale-tag')).toBe('de-DE');
    expect(node.getAttribute('data-has-mark-seen')).toBe('true');
    expect(node.getAttribute('data-has-pending-provider')).toBe('true');

    expect(useWorkspaceFavoriteTogglesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nextPath: '/workspace?tab=favorites',
        favoriteRequestIds: args.favoriteRequestIds,
        requestById: args.requestById,
      }),
    );

    expect(useWorkspaceActionsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isAuthed: true,
        myOffers: args.myOffers,
      }),
    );

    expect(usePublicRequestsSeenTotalMock).toHaveBeenCalledWith({
      isAuthed: true,
      userId: 'user-1',
      platformRequestsTotal: 21,
      autoMarkSeen: false,
    });

    expect(useWorkspaceTabPersistenceMock).toHaveBeenCalledWith({
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      activeWorkspaceTab: 'favorites',
    });
  });
});
