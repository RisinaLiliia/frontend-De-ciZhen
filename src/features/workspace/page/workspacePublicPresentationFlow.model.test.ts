import { describe, expect, it } from 'vitest';

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
        cityActivity: [{ cityId: 'berlin', requests: 3 }],
        platformSummary: { totalPublishedRequests: 24, totalActiveProviders: 9 },
        isSummaryLoading: false,
        isSummaryError: true,
      } as never,
    });

    expect(args.activePublicSection).toBe('stats');
    expect(args.cityActivity).toEqual([{ cityId: 'berlin', requests: 3 }]);
    expect(args.isSummaryError).toBe(true);
  });

  it('assembles public presentation layout props and render metric payload', () => {
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
        exploreWithSeed: null,
      } as never,
      workspaceIntroNode: 'intro',
      publicRequestsMain: 'main',
      publicRequestsAside: 'aside',
    });

    expect(result.workspaceLayoutProps.intro).toBe('intro');
    expect(result.workspaceLayoutProps.explore).toBeNull();
    expect(result.workspaceLayoutProps.isWorkspacePublicSection).toBe(true);
    expect(result.workspaceLayoutProps.publicMain).toBe('main');
    expect(result.workspaceLayoutProps.publicAside).toBe('aside');
    expect(result.renderMetricPayload).toEqual({
      isAuthed: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      platformRequestsTotal: 24,
      localeTag: 'de-DE',
    });
  });
});
