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
      onOpenChatConversation: vi.fn(),
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
    } as never);

    useWorkspaceTabPersistenceMock.mockImplementation(() => undefined);
  });

  it('wires toggles/actions/navigation side-effects and exposes interaction payload', () => {
    const t: WorkspaceBranchProps['t'] = (key) => String(key);

    const request = { id: 'req-1' } as RequestResponseDto;
    const provider = { id: 'provider-1' } as ProviderPublicDto;

    const args: InteractionsArgs = {
      t,
      locale: 'de',
      isAuthed: true,
      isWorkspaceAuthed: true,
      authUserId: 'user-1',
      activePublicSection: null,
      activeWorkspaceTab: 'favorites',
      requestsScope: 'market',
      nextPath: '/workspace?tab=favorites',
      platformRequestsTotal: 21,
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
        includeRequestToggle: true,
        includeProviderToggle: true,
        nextPath: '/workspace?tab=favorites',
        favoriteRequestIds: args.favoriteRequestIds,
        requestById: args.requestById,
      }),
    );

    expect(useWorkspaceActionsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        isAuthed: true,
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

  it('disables request-side favorite and action paths for profile tab', () => {
    const t: WorkspaceBranchProps['t'] = (key) => String(key);

    render(
      <InteractionsProbe
        t={t}
        locale="de"
        isAuthed
        isWorkspaceAuthed
        authUserId="user-1"
        activePublicSection={null}
        activeWorkspaceTab="profile"
        requestsScope="market"
        nextPath="/workspace?section=actions"
        platformRequestsTotal={21}
        favoriteRequestIds={new Set()}
        requestById={new Map()}
        favoriteProviderLookup={new Set(['provider-1'])}
        providerById={new Map([['provider-1', { id: 'provider-1' } as ProviderPublicDto]])}
      />,
    );

    expect(useWorkspaceFavoriteTogglesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        includeRequestToggle: false,
        includeProviderToggle: true,
      }),
    );

    expect(useWorkspaceActionsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });

  it('disables provider-side favorite path for unified private requests flow', () => {
    const t: WorkspaceBranchProps['t'] = (key) => String(key);

    render(
      <InteractionsProbe
        t={t}
        locale="de"
        isAuthed
        isWorkspaceAuthed
        authUserId="user-1"
        activePublicSection="requests"
        activeWorkspaceTab="my-requests"
        requestsScope="my"
        nextPath="/workspace?section=requests&scope=my"
        platformRequestsTotal={21}
        favoriteRequestIds={new Set()}
        requestById={new Map()}
        favoriteProviderLookup={new Set(['provider-1'])}
        providerById={new Map([['provider-1', { id: 'provider-1' } as ProviderPublicDto]])}
      />,
    );

    expect(useWorkspaceFavoriteTogglesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        includeProviderToggle: false,
      }),
    );
  });
});
