import { describe, expect, it, vi } from 'vitest';

import {
  buildWorkspacePublicIntroArgs,
  resolveWorkspacePublicPresentationFlowResult,
} from './workspacePublicPresentationFlow.model';

describe('workspacePublicPresentationFlow.model', () => {
  it('builds public intro args from branch and public data-flow state', () => {
    const args = buildWorkspacePublicIntroArgs({
      branch: {
        t: (key: string) => key,
        locale: 'de',
        isPersonalized: true,
      } as never,
      data: {
        activePublicSection: 'stats',
        activityProgress: 72,
        personalNavItems: [{ key: 'requests', href: '/workspace', label: 'Requests', icon: null }],
        insightText: 'Insight',
        cityActivity: [{ cityId: 'berlin', requests: 3 }],
        platformSummary: { totalPublishedRequests: 24, totalActiveProviders: 9 },
        isSummaryLoading: false,
        isSummaryError: true,
      } as never,
    });

    expect(args.activePublicSection).toBe('stats');
    expect(args.state.activityProgress).toBe(72);
    expect(args.state.personalNavItems).toHaveLength(1);
    expect(args.cityActivity).toEqual([{ cityId: 'berlin', requests: 3 }]);
    expect(args.isSummaryError).toBe(true);
  });

  it('assembles public presentation layout props and render metric payload', () => {
    const exploreWithSeed = {
      setExploreListDensity: vi.fn(),
      sidebarNearbyLimit: 5,
      sidebarTopProvidersLimit: 3,
      sidebarProofCases: [],
      proofIndex: 1,
    };

    const result = resolveWorkspacePublicPresentationFlowResult({
      branch: {
        t: (key: string) => key,
        locale: 'de',
        isWorkspaceAuthed: false,
        isAuthed: true,
      } as never,
      data: {
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
        platformRequestsTotal: 24,
        localeTag: 'de-DE',
        exploreWithSeed,
      } as never,
      workspaceIntroNode: 'intro',
    });

    expect(result.workspaceLayoutProps.intro).toBe('intro');
    expect(result.workspaceLayoutProps.explore).toBe(exploreWithSeed);
    expect(result.workspaceLayoutProps.isWorkspacePublicSection).toBe(true);
    expect(result.renderMetricPayload).toEqual({
      isAuthed: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      platformRequestsTotal: 24,
      localeTag: 'de-DE',
    });
  });
});
