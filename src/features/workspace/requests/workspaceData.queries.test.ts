import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as workspaceApi from '@/lib/api/workspace';

import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/requests/workspace.constants';

import { resolveWorkspaceDataPlan } from './workspaceData.model';
import {
  buildWorkspaceDataQueries,
  buildWorkspaceOfferRequestsQuery,
} from './workspaceData.queries';

vi.mock('@/lib/api/workspace', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/workspace')>('@/lib/api/workspace');

  return {
    ...actual,
    getWorkspaceRequests: vi.fn(),
  };
});

const getWorkspaceRequestsMock = vi.mocked(workspaceApi.getWorkspaceRequests);

describe('workspaceData.queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds public overview and summary query options from filter state', () => {
    const loadPlan = resolveWorkspaceDataPlan({
      isAuthed: false,
      isWorkspaceAuthed: false,
      isWorkspacePublicSection: true,
      shouldLoadPrivateData: false,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      requestsScope: 'market',
      hasAccessToken: false,
    });

    const queries = buildWorkspaceDataQueries({
      filter: {
        cityId: 'berlin',
        categoryKey: 'design',
        subcategoryKey: 'logo',
        sort: 'price_desc',
        state: 'attention',
        period: '30d',
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
      'attention',
      '30d',
      3,
      24,
      undefined,
      undefined,
    ]);
    expect(queries.publicSummary.queryKey).toEqual([
      'workspace-public-summary',
      WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
    ]);
    expect(queries.workspaceRequests.enabled).toBe(true);
    expect(queries.workspaceRequests.queryKey).toEqual([
      'workspace-requests',
      'market',
      'all',
      'all',
      'berlin',
      'design',
      'logo',
      '30d',
      'default',
      3,
      24,
    ]);
  });

  it('allows a reduced city-activity payload for lightweight public summary consumers', () => {
    const loadPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'profile',
      hasAccessToken: true,
    });

    const queries = buildWorkspaceDataQueries({
      filter: {},
      loadPlan,
      hasAccessToken: true,
      publicSummaryCityActivityLimit: 1,
      requestsScope: 'market',
      activeRequestsRole: 'all',
      activeRequestsState: 'all',
      activeRequestsPeriod: '30d',
      activeRequestsSort: null,
    });

    expect(queries.publicSummary.queryKey).toEqual([
      'workspace-public-summary',
      1,
    ]);
  });

  it('builds market workspace requests from the unified server contract', async () => {
    const loadPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: true,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      requestsScope: 'market',
      hasAccessToken: true,
    });

    const queries = buildWorkspaceDataQueries({
      filter: {
        cityId: 'berlin',
        categoryKey: 'design',
        subcategoryKey: 'logo',
        state: 'execution',
        period: '30d',
        page: 3,
        limit: 24,
      },
      loadPlan,
      hasAccessToken: true,
      requestsScope: 'market',
      activeRequestsRole: 'provider',
      activeRequestsState: 'execution',
      activeRequestsPeriod: '30d',
      activeRequestsSort: 'date_desc',
    });

    expect(queries.workspaceRequests.enabled).toBe(true);
    await queries.workspaceRequests.queryFn();
    expect(getWorkspaceRequestsMock).toHaveBeenCalledWith({
      scope: 'market',
      state: 'execution',
      period: '30d',
      city: 'berlin',
      category: 'design',
      service: 'logo',
      sort: 'date_desc',
      page: 3,
      limit: 24,
    });
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
      'all-cities',
      'all-categories',
      'all-services',
      '7d',
      'deadline',
      1,
      20,
    ]);
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
