import { describe, expect, it } from 'vitest';

import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace';
import { REQUESTS_PAGE_SIZE } from '@/lib/requests/pagination';

import {
  EMPTY_PLATFORM_REVIEWS_OVERVIEW,
  buildWorkspacePublicExploreWithSeed,
  buildWorkspacePublicIntroProps,
  buildWorkspacePublicReviewsQuery,
  buildWorkspacePublicSnapshotQuery,
  resolveWorkspacePublicBranchSnapshot,
  shouldLoadWorkspacePublicShellSnapshot,
  shouldAutoMarkPublicRequestsSeen,
} from './workspacePublicBranch.model';

describe('workspacePublicBranch.model', () => {
  it('builds stable public branch queries', () => {
    const reviewsQuery = buildWorkspacePublicReviewsQuery();
    const snapshotQuery = buildWorkspacePublicSnapshotQuery();

    expect(reviewsQuery.queryKey).toEqual(['platform-reviews-overview', 'summary']);
    expect(snapshotQuery.queryKey).toEqual([
      'workspace-public-overview',
      undefined,
      undefined,
      undefined,
      'date_desc',
      undefined,
      undefined,
      1,
      REQUESTS_PAGE_SIZE,
      '30d',
      WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
    ]);
  });

  it('derives public branch metrics with safe numeric fallbacks', () => {
    const snapshot = resolveWorkspacePublicBranchSnapshot({
      platformSnapshot: {
        summary: {
          totalPublishedRequests: 24,
          totalActiveProviders: 9,
        },
        cityActivity: [{ cityId: 'berlin', requests: 3 }],
      } as never,
      platformReviewsOverview: {
        ...EMPTY_PLATFORM_REVIEWS_OVERVIEW,
        summary: {
          ...EMPTY_PLATFORM_REVIEWS_OVERVIEW.summary,
          averageRating: Number.NaN,
          total: -2.8,
        },
      },
    });

    expect(snapshot.platformRequestsTotal).toBe(24);
    expect(snapshot.platformProvidersTotal).toBe(9);
    expect(snapshot.platformRatingAvg).toBe(0);
    expect(snapshot.platformReviewsCount).toBe(0);
  });

  it('builds explore seed flags, intro props and auto-mark policy', () => {
    const exploreWithSeed = buildWorkspacePublicExploreWithSeed({
      explore: {
        exploreListDensity: 'single' as const,
        setExploreListDensity: () => undefined,
        sidebarNearbyLimit: 5,
        sidebarTopProvidersLimit: 5,
        sidebarProofCases: [],
        proofIndex: 0,
      },
      platformSnapshot: { requests: [{ id: 'req-1' }] } as never,
      isSummaryLoading: false,
      isSummaryError: true,
    });
    const introProps = buildWorkspacePublicIntroProps({
      branch: {
        t: (key) => String(key),
        locale: 'en',
      },
      activePublicSection: 'stats',
      activeWorkspaceTab: 'my-requests',
      cityActivity: {
        totalActiveCities: 0,
        totalActiveRequests: 0,
        items: [],
      },
      platformSummary: undefined,
      isSummaryLoading: false,
      isSummaryError: false,
    });

    expect(exploreWithSeed.preferInitialPublicRequests).toBe(true);
    expect(exploreWithSeed.initialPublicRequestsError).toBe(true);
    expect(introProps.activePublicSection).toBe('stats');
    expect(introProps.activeWorkspaceTab).toBe('my-requests');
    expect(introProps.showDemandMap).toBe(false);
    expect(introProps.hideDemandMapOnMobile).toBe(true);
    expect(introProps.showQuickAction).toBe(false);
    expect(
      shouldAutoMarkPublicRequestsSeen({
        isWorkspaceAuthed: true,
        activePublicSection: 'requests',
        isSummaryLoading: false,
        isSummaryError: false,
      }),
    ).toBe(true);
  });

  it('removes legacy public quick action from providers and profile intros', () => {
    const providersIntro = buildWorkspacePublicIntroProps({
      branch: {
        t: (key) => String(key),
        locale: 'de',
      },
      activePublicSection: 'providers',
      activeWorkspaceTab: 'my-requests',
      cityActivity: null,
      platformSummary: null,
      isSummaryLoading: false,
      isSummaryError: false,
    });
    const profileIntro = buildWorkspacePublicIntroProps({
      branch: {
        t: (key) => String(key),
        locale: 'de',
      },
      activePublicSection: 'profile',
      activeWorkspaceTab: 'my-requests',
      cityActivity: null,
      platformSummary: null,
      isSummaryLoading: false,
      isSummaryError: false,
    });

    expect(providersIntro.showQuickAction).toBe(false);
    expect(profileIntro.showQuickAction).toBe(false);
    expect(providersIntro.showDemandMap).toBe(false);
    expect(profileIntro.showDemandMap).toBe(false);
  });

  it('keeps requests intro free from legacy market-map payload and seed wiring', () => {
    const exploreWithoutSeed = buildWorkspacePublicExploreWithSeed({
      explore: {
        exploreListDensity: 'single' as const,
        setExploreListDensity: () => undefined,
        sidebarNearbyLimit: 5,
        sidebarTopProvidersLimit: 5,
        sidebarProofCases: [],
        proofIndex: 0,
      },
      platformSnapshot: { requests: [{ id: 'req-1' }] } as never,
      isSummaryLoading: true,
      isSummaryError: true,
      enableSeed: false,
    });
    const introProps = buildWorkspacePublicIntroProps({
      branch: {
        t: (key) => String(key),
        locale: 'de',
      },
      activePublicSection: 'requests',
      activeWorkspaceTab: 'my-requests',
      cityActivity: {
        totalActiveCities: 1,
        totalActiveRequests: 2,
        items: [],
      },
      platformSummary: {
        totalPublishedRequests: 10,
        totalActiveProviders: 3,
      } as never,
      isSummaryLoading: true,
      isSummaryError: true,
    });

    expect(exploreWithoutSeed.initialPublicRequests).toBeUndefined();
    expect(exploreWithoutSeed.preferInitialPublicRequests).toBeUndefined();
    expect(introProps.cityActivity).toBeNull();
    expect(introProps.summary).toBeNull();
    expect(introProps.isMapLoading).toBe(false);
    expect(introProps.isMapError).toBe(false);
    expect(introProps.showQuickAction).toBe(false);
    expect(shouldLoadWorkspacePublicShellSnapshot('requests')).toBe(false);
    expect(shouldLoadWorkspacePublicShellSnapshot('stats')).toBe(true);
  });
});
