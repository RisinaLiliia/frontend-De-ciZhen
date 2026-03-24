import { describe, expect, it } from 'vitest';

import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace';

import {
  EMPTY_PLATFORM_REVIEWS_OVERVIEW,
  buildWorkspacePublicExploreWithSeed,
  buildWorkspacePublicIntroProps,
  buildWorkspacePublicReviewsQuery,
  buildWorkspacePublicSnapshotQuery,
  resolveWorkspacePublicBranchSnapshot,
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
      1,
      10,
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
        isPersonalized: false,
      },
      activePublicSection: 'stats',
      activeWorkspaceTab: 'my-requests',
      state: {
        personalNavItems: [],
        insightText: 'ignored',
        activityProgress: 68,
      },
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
    expect(introProps.insightText).toBe('');
    expect(introProps.activePublicSection).toBe('stats');
    expect(introProps.activeWorkspaceTab).toBe('my-requests');
    expect(introProps.hideDemandMapOnMobile).toBe(false);
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
});
