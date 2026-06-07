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
import { useWorkspaceRequestUserInteractions } from '@/features/workspace/orchestration/useWorkspaceRequestUserInteractions';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';

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

type InteractionsArgs = Parameters<typeof useWorkspaceRequestUserInteractions>[0];

function InteractionsProbe(props: InteractionsArgs) {
  const result = useWorkspaceRequestUserInteractions(props);

  return (
    <div
      data-testid="interactions"
      data-locale-tag={result.localeTag}
      data-has-pending-request={String(result.pendingFavoriteRequestIds.has('req-1'))}
      data-has-pending-provider={String(result.pendingFavoriteProviderIds.has('provider-1'))}
    />
  );
}

afterEach(() => {
  cleanup();
});

describe('useWorkspaceRequestUserInteractions', () => {
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
  });

  it('exposes request-user interactions without private navigation side effects', () => {
    const t: WorkspaceBranchProps['t'] = (key) => String(key);

    render(
      <InteractionsProbe
        t={t}
        locale="de"
        isAuthed={true}
        nextPath="/workspace?section=requests&scope=market"
        favoriteRequestIds={new Set(['req-1'])}
        requestById={new Map([['req-1', { id: 'req-1' }]]) as never}
        favoriteProviderLookup={new Set()}
        providerById={new Map()}
      />,
    );

    const node = screen.getByTestId('interactions');
    expect(node.getAttribute('data-locale-tag')).toBe('de-DE');
    expect(node.getAttribute('data-has-pending-request')).toBe('true');
    expect(node.getAttribute('data-has-pending-provider')).toBe('true');

    expect(useWorkspaceFavoriteTogglesMock).toHaveBeenCalledOnce();
    expect(useWorkspaceActionsMock).toHaveBeenCalledOnce();
    expect(useWorkspaceFormattersMock).toHaveBeenCalledWith('de');
    expect(usePublicRequestsSeenTotalMock).not.toHaveBeenCalled();
    expect(useWorkspaceNavigationMock).not.toHaveBeenCalled();
    expect(useWorkspaceTabPersistenceMock).not.toHaveBeenCalled();
  });
});
