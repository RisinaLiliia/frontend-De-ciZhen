import { describe, expect, it, vi } from 'vitest';

import { WORKSPACE_PATH } from '@/features/workspace/orchestration/workspacePage.constants';

import {
  buildWorkspacePrivateActionsArgs,
  buildWorkspacePrivateFavoriteToggleArgs,
  buildWorkspacePrivateNavigationArgs,
  buildWorkspacePrivateSeenTotalArgs,
  buildWorkspacePrivateTabPersistenceArgs,
  resolveWorkspacePrivateInteractionsResult,
  shouldBuildWorkspacePrivateProviderInteractions,
  shouldBuildWorkspacePrivateRequestFavoriteInteractions,
  shouldBuildWorkspacePrivateRequestInteractions,
} from './workspacePrivateInteractions.model';

describe('workspacePrivateInteractions.model', () => {
  it('builds favorite toggle, actions, seen-total and navigation args', () => {
    const router = { push: vi.fn() } as never;
    const qc = {} as never;
    const t = (key: string) => key;

    const favoriteToggleArgs = buildWorkspacePrivateFavoriteToggleArgs({
      includeRequestToggle: false,
      includeProviderToggle: false,
      isAuthed: true,
      nextPath: '/workspace?tab=favorites',
      router,
      t: t as never,
      qc,
      favoriteRequestIds: new Set(['req-1']),
      requestById: new Map([['req-1', { id: 'req-1' }]]) as never,
      favoriteProviderLookup: new Set(['provider-1']),
      providerById: new Map([['provider-1', { id: 'provider-1' }]]) as never,
    });
    const actionsArgs = buildWorkspacePrivateActionsArgs({
      enabled: false,
      isAuthed: true,
      t: t as never,
      qc,
      router,
    });
    const seenArgs = buildWorkspacePrivateSeenTotalArgs({
      isAuthed: true,
      authUserId: 'user-1',
      platformRequestsTotal: 21,
    });
    const persistenceArgs = buildWorkspacePrivateTabPersistenceArgs({
      isWorkspaceAuthed: true,
      activeWorkspaceTab: 'favorites',
    });
    const navigationArgs = buildWorkspacePrivateNavigationArgs({
      activeWorkspaceTab: 'favorites',
    });

    expect(shouldBuildWorkspacePrivateRequestInteractions('profile')).toBe(false);
    expect(shouldBuildWorkspacePrivateRequestInteractions('reviews')).toBe(false);
    expect(shouldBuildWorkspacePrivateRequestInteractions('favorites')).toBe(true);
    expect(
      shouldBuildWorkspacePrivateRequestFavoriteInteractions({
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
        requestsScope: 'my',
      }),
    ).toBe(false);
    expect(
      shouldBuildWorkspacePrivateRequestFavoriteInteractions({
        activePublicSection: null,
        activeWorkspaceTab: 'favorites',
        requestsScope: 'market',
      }),
    ).toBe(true);
    expect(
      shouldBuildWorkspacePrivateProviderInteractions({
        activePublicSection: 'requests',
        requestsScope: 'my',
      }),
    ).toBe(false);
    expect(
      shouldBuildWorkspacePrivateProviderInteractions({
        activePublicSection: null,
        requestsScope: 'market',
      }),
    ).toBe(true);
    expect(favoriteToggleArgs.nextPath).toBe('/workspace?tab=favorites');
    expect(favoriteToggleArgs.includeRequestToggle).toBe(false);
    expect(favoriteToggleArgs.includeProviderToggle).toBe(false);
    expect(actionsArgs.enabled).toBe(false);
    expect(seenArgs).toEqual({
      isAuthed: true,
      userId: 'user-1',
      platformRequestsTotal: 21,
      autoMarkSeen: false,
    });
    expect(persistenceArgs.isWorkspacePublicSection).toBe(false);
    expect(navigationArgs.workspacePath).toBe(WORKSPACE_PATH);
  });

  it('resolves final interactions payload from hook results', () => {
    const result = resolveWorkspacePrivateInteractionsResult({
      favoriteToggles: {
        pendingFavoriteRequestIds: new Set(['req-1']),
        pendingFavoriteProviderIds: new Set(['provider-1']),
        onToggleRequestFavorite: vi.fn(),
        onToggleProviderFavorite: vi.fn(),
      } as never,
      actions: {
        pendingOfferRequestId: 'req-1',
        ownerRequestActions: {},
        onOpenOfferSheet: vi.fn(),
        onWithdrawOffer: vi.fn(),
        onOpenChatThread: vi.fn(),
        onOpenChatConversation: vi.fn(),
      } as never,
      formatters: {
        localeTag: 'de-DE',
        formatNumber: new Intl.NumberFormat('de-DE'),
        formatDate: new Intl.DateTimeFormat('de-DE'),
        formatPrice: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
        chartMonthLabel: new Intl.DateTimeFormat('de-DE', { month: 'short' }),
      } as never,
      markPublicRequestsSeen: vi.fn(),
      navigation: {
        setWorkspaceTab: vi.fn(),
        setStatusFilter: vi.fn(),
        setFavoritesView: vi.fn(),
      } as never,
    });

    expect(result.pendingOfferRequestId).toBe('req-1');
    expect(result.pendingFavoriteProviderIds).toEqual(new Set(['provider-1']));
    expect(result.localeTag).toBe('de-DE');
    expect(typeof result.markPublicRequestsSeen).toBe('function');
    expect(typeof result.setWorkspaceTab).toBe('function');
  });
});
