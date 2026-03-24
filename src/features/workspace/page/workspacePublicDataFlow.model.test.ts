import { describe, expect, it, vi } from 'vitest';

import { resolveWorkspacePublicDataFlowResult } from './workspacePublicDataFlow.model';

describe('workspacePublicDataFlow.model', () => {
  it('assembles final public data-flow payload from route state, snapshot, formatters, explore and public state', () => {
    const exploreWithSeed = {
      exploreListDensity: 'single' as const,
      setExploreListDensity: vi.fn(),
      sidebarNearbyLimit: 5,
      sidebarTopProvidersLimit: 3,
      sidebarProofCases: [],
      proofIndex: 1,
    } as const;
    const publicState = {
      personalNavItems: [{ key: 'requests', href: '/workspace', label: 'Requests', icon: null }],
      activityProgress: 72,
      insightText: 'Insight',
      publicNavItems: [],
      navHeader: null,
      reviewsMeta: null,
    };

    const result = resolveWorkspacePublicDataFlowResult({
      routeState: {
        activePublicSection: 'stats',
        activeWorkspaceTab: 'my-requests',
      },
      snapshot: {
        platformRequestsTotal: 24,
        platformProvidersTotal: 9,
        platformRatingAvg: 4.8,
        platformReviewsCount: 11,
        cityActivity: [{ cityId: 'berlin', requests: 3 }],
        platformSummary: { totalPublishedRequests: 24, totalActiveProviders: 9 },
      } as never,
      localeTag: 'de-DE',
      exploreWithSeed: exploreWithSeed as never,
      isSummaryLoading: false,
      isSummaryError: true,
      publicState: publicState as never,
    });

    expect(result.activePublicSection).toBe('stats');
    expect(result.activeWorkspaceTab).toBe('my-requests');
    expect(result.platformRequestsTotal).toBe(24);
    expect(result.localeTag).toBe('de-DE');
    expect(result.exploreWithSeed).toBe(exploreWithSeed);
    expect(result.cityActivity).toEqual([{ cityId: 'berlin', requests: 3 }]);
    expect(result.platformSummary).toEqual({ totalPublishedRequests: 24, totalActiveProviders: 9 });
    expect(result.isSummaryError).toBe(true);
    expect(result.activityProgress).toBe(72);
    expect(result.personalNavItems).toEqual(publicState.personalNavItems);
  });
});
