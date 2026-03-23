import { describe, expect, it, vi } from 'vitest';

import {
  buildWorkspacePublicLayoutProps,
  buildWorkspacePublicNavigationArgs,
  buildWorkspacePublicRenderMetricPayload,
  buildWorkspacePublicSeenArgs,
  buildWorkspacePublicStateArgs,
} from '@/features/workspace/page/workspacePublicPresentation.model';

describe('workspacePublicPresentation.model', () => {
  it('builds stable navigation args for the public workspace branch', () => {
    expect(
      buildWorkspacePublicNavigationArgs({
        activeWorkspaceTab: 'my-requests',
      }),
    ).toEqual({
      activeWorkspaceTab: 'my-requests',
      workspacePath: '/workspace',
    });
  });

  it('builds seen-total args with derived auto-mark policy', () => {
    expect(
      buildWorkspacePublicSeenArgs({
        auth: {
          user: {
            id: 'user-1',
          },
        } as never,
        isAuthed: true,
        isWorkspaceAuthed: true,
        activePublicSection: 'requests',
        platformRequestsTotal: 24,
        isSummaryLoading: false,
        isSummaryError: false,
      }),
    ).toEqual({
      isAuthed: true,
      userId: 'user-1',
      platformRequestsTotal: 24,
      autoMarkSeen: true,
    });
  });

  it('builds public state args from branch-level metrics and callbacks', () => {
    const setWorkspaceTab = vi.fn();
    const markPublicRequestsSeen = vi.fn();
    const onGuestLockedAction = vi.fn();
    const formatNumber = new Intl.NumberFormat('de-DE');

    expect(
      buildWorkspacePublicStateArgs({
        t: (key) => String(key),
        isPersonalized: true,
        activeWorkspaceTab: 'my-requests',
        activePublicSection: 'providers',
        userName: 'Anna',
        platformRequestsTotal: 24,
        platformProvidersTotal: 9,
        platformRatingAvg: 4.8,
        platformReviewsCount: 11,
        guestLoginHref: '/auth/login',
        onGuestLockedAction,
        setWorkspaceTab,
        markPublicRequestsSeen,
        formatNumber,
      }),
    ).toEqual({
      t: expect.any(Function),
      isPersonalized: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'providers',
      userName: 'Anna',
      publicRequestsCount: 24,
      publicProvidersCount: 9,
      publicStatsCount: 24,
      platformRatingAvg: 4.8,
      platformReviewsCount: 11,
      setWorkspaceTab,
      markPublicRequestsSeen,
      guestLoginHref: '/auth/login',
      onGuestLockedAction,
      formatNumber,
    });
  });

  it('builds layout props and render metric payload for the public branch shell', () => {
    const workspaceIntroNode = 'intro';
    const exploreWithSeed = {
      setExploreListDensity: () => undefined,
      sidebarNearbyLimit: 5,
      sidebarTopProvidersLimit: 5,
      sidebarProofCases: [],
      proofIndex: 0,
    };

    const layoutProps = buildWorkspacePublicLayoutProps({
      t: (key) => String(key),
      locale: 'de',
      isWorkspaceAuthed: false,
      activePublicSection: 'stats',
      activeWorkspaceTab: 'my-requests',
      exploreWithSeed,
      workspaceIntroNode,
    });

    expect(layoutProps.isWorkspacePublicSection).toBe(true);
    expect(layoutProps.intro).toBe(workspaceIntroNode);
    expect(layoutProps.explore).toBe(exploreWithSeed);
    expect(layoutProps.privateMain).toBeNull();
    expect(layoutProps.publicMain).toBeNull();
    expect(
      buildWorkspacePublicRenderMetricPayload({
        isAuthed: false,
        activeWorkspaceTab: 'my-requests',
        activePublicSection: 'stats',
        platformRequestsTotal: 24,
        localeTag: 'de-DE',
      }),
    ).toEqual({
      isAuthed: false,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'stats',
      platformRequestsTotal: 24,
      localeTag: 'de-DE',
    });
  });
});
