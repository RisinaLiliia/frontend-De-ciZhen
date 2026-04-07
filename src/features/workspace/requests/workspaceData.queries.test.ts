import { describe, expect, it, vi } from 'vitest';

import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/requests/workspace.constants';
import { ApiError } from '@/lib/api/http-error';
import { getWorkspaceRequests } from '@/lib/api/workspace';

vi.mock('@/lib/api/workspace', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/workspace')>('@/lib/api/workspace');
  return {
    ...actual,
    getWorkspaceRequests: vi.fn(actual.getWorkspaceRequests),
  };
});

import { resolveWorkspaceDataPlan } from './workspaceData.model';
import {
  buildWorkspaceDataQueries,
  buildWorkspaceOfferRequestsQuery,
} from './workspaceData.queries';

const getWorkspaceRequestsMock = vi.mocked(getWorkspaceRequests);

describe('workspaceData.queries', () => {
  it('builds public overview and summary query options from filter state', () => {
    const loadPlan = resolveWorkspaceDataPlan({
      isAuthed: false,
      isWorkspaceAuthed: false,
      isWorkspacePublicSection: true,
      shouldLoadPrivateData: false,
      activeWorkspaceTab: 'my-requests',
      hasAccessToken: false,
    });

    const queries = buildWorkspaceDataQueries({
      filter: {
        cityId: 'berlin',
        categoryKey: 'design',
        subcategoryKey: 'logo',
        sort: 'price_desc',
        page: 3,
        limit: 24,
      },
      loadPlan,
      hasAccessToken: false,
      requestsScope: 'market',
      activeRequestsRole: 'all',
      activeRequestsState: 'all',
      activeRequestsPeriod: '30d',
      activeRequestsSort: null,
    });

    expect(queries.publicOverview.enabled).toBe(true);
    expect(queries.publicOverview.queryKey).toEqual([
      'workspace-public-overview',
      'berlin',
      'design',
      'logo',
      'price_desc',
      3,
      24,
      undefined,
      undefined,
    ]);
    expect(queries.publicSummary.queryKey).toEqual([
      'workspace-public-summary',
      WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
    ]);
    expect(queries.workspaceRequests.enabled).toBe(false);
  });

  it('keeps private overview query inert without an access token', async () => {
    const loadPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      hasAccessToken: false,
    });

    const queries = buildWorkspaceDataQueries({
      filter: {},
      loadPlan,
      hasAccessToken: false,
      requestsScope: 'my',
      activeRequestsRole: 'all',
      activeRequestsState: 'attention',
      activeRequestsPeriod: '30d',
      activeRequestsSort: 'activity',
    });

    expect(queries.privateOverview.enabled).toBe(false);
    await expect(queries.privateOverview.queryFn()).resolves.toBeNull();
    await expect(queries.workspaceRequests.queryFn()).resolves.toBeNull();
  });

  it('builds workspace requests query from private scope filters', () => {
    const loadPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      requestsScope: 'my',
      hasAccessToken: true,
    });

    const queries = buildWorkspaceDataQueries({
      filter: {},
      loadPlan,
      hasAccessToken: true,
      requestsScope: 'my',
      activeRequestsRole: 'provider',
      activeRequestsState: 'execution',
      activeRequestsPeriod: '7d',
      activeRequestsSort: 'deadline',
    });

    expect(queries.workspaceRequests.enabled).toBe(true);
    expect(queries.workspaceRequests.queryKey).toEqual([
      'workspace-requests',
      'my',
      'provider',
      'execution',
      '7d',
      'deadline',
    ]);
  });

  it('falls back to null when workspace requests endpoint is not available yet', async () => {
    getWorkspaceRequestsMock.mockRejectedValueOnce(new ApiError('Not Found', 404));

    const loadPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      requestsScope: 'my',
      hasAccessToken: true,
    });

    const queries = buildWorkspaceDataQueries({
      filter: {},
      loadPlan,
      hasAccessToken: true,
      requestsScope: 'my',
      activeRequestsRole: 'customer',
      activeRequestsState: 'attention',
      activeRequestsPeriod: '30d',
      activeRequestsSort: null,
    });

    await expect(queries.workspaceRequests.queryFn()).resolves.toBeNull();
  });

  it('builds offer request batch query only when ids exist', () => {
    const disabledQuery = buildWorkspaceOfferRequestsQuery({
      locale: 'ru',
      requestIds: [],
      enabled: true,
    });
    const enabledQuery = buildWorkspaceOfferRequestsQuery({
      locale: 'ru',
      requestIds: ['req-2', 'req-1'],
      enabled: true,
    });

    expect(disabledQuery.enabled).toBe(false);
    expect(enabledQuery.enabled).toBe(true);
    expect(enabledQuery.queryKey).toEqual(['requests-by-my-offer-ids', 'ru', 'req-2', 'req-1']);
  });
});
