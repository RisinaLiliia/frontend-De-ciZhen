import { describe, expect, it } from 'vitest';

import {
  resolveWorkspacePublicEmptyResultPayload,
  resolveWorkspacePublicRequestsPageClamp,
  resolveWorkspacePublicRequestsState,
} from '@/features/workspace/public/workspacePublicRequestsState.model';

describe('workspacePublicRequestsState.model', () => {
  it('resolves public requests state with safe total pages', () => {
    expect(
      resolveWorkspacePublicRequestsState({
        publicRequests: {
          items: [{ id: 'request-1' } as never],
          total: 12,
        },
        allRequestsSummary: {
          totalPublishedRequests: 24,
          totalActiveProviders: 8,
        },
        limit: 0,
      }),
    ).toEqual({
      requests: [{ id: 'request-1' }],
      totalResults: 12,
      platformRequestsTotal: 24,
      totalPages: 12,
    });
  });

  it('returns a clamped page only when current page exceeds total pages', () => {
    expect(resolveWorkspacePublicRequestsPageClamp(undefined, 3)).toBeNull();
    expect(resolveWorkspacePublicRequestsPageClamp(2, 3)).toBeNull();
    expect(resolveWorkspacePublicRequestsPageClamp(4, 3)).toBe(3);
  });

  it('builds empty-result analytics payload only in public requests empty state', () => {
    expect(
      resolveWorkspacePublicEmptyResultPayload({
        isWorkspacePublicSection: true,
        activePublicSection: 'requests',
        isLoading: false,
        isError: false,
        hasActivePublicFilter: true,
        cityId: 'all',
        categoryKey: 'design',
        subcategoryKey: 'all',
        sortBy: 'date_desc',
        requestsCount: 0,
      }),
    ).toEqual({
      tab: 'public-requests',
      hasFilters: true,
      cityId: null,
      categoryKey: 'design',
      subcategoryKey: null,
      sortBy: 'date_desc',
    });

    expect(
      resolveWorkspacePublicEmptyResultPayload({
        isWorkspacePublicSection: true,
        activePublicSection: 'requests',
        isLoading: true,
        isError: false,
        hasActivePublicFilter: true,
        cityId: 'all',
        categoryKey: 'design',
        subcategoryKey: 'all',
        sortBy: 'date_desc',
        requestsCount: 0,
      }),
    ).toBeNull();
  });
});
