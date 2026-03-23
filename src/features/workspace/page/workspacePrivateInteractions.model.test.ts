import { describe, expect, it, vi } from 'vitest';

import { WORKSPACE_PATH } from '@/features/workspace/page/workspacePage.constants';

import {
  buildWorkspacePrivateActionsArgs,
  buildWorkspacePrivateFavoriteToggleArgs,
  buildWorkspacePrivateNavigationArgs,
  buildWorkspacePrivateSeenTotalArgs,
  buildWorkspacePrivateTabPersistenceArgs,
  resolveWorkspacePrivateInteractionsResult,
} from './workspacePrivateInteractions.model';

describe('workspacePrivateInteractions.model', () => {
  it('builds favorite toggle, actions, seen-total and navigation args', () => {
    const router = { push: vi.fn() } as never;
    const qc = {} as never;
    const t = (key: string) => key;

    const favoriteToggleArgs = buildWorkspacePrivateFavoriteToggleArgs({
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
      isAuthed: true,
      myOffers: [{ id: 'offer-1', requestId: 'req-1' }] as never,
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

    expect(favoriteToggleArgs.nextPath).toBe('/workspace?tab=favorites');
    expect(actionsArgs.myOffers).toHaveLength(1);
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
