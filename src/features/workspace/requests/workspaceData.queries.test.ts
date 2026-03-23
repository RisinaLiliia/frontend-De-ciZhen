import { describe, expect, it } from 'vitest';

import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/requests/workspace.constants';

import { resolveWorkspaceDataPlan } from './workspaceData.model';
import {
  buildWorkspaceDataQueries,
  buildWorkspaceOfferRequestsQuery,
} from './workspaceData.queries';

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
    });

    expect(queries.privateOverview.enabled).toBe(false);
    await expect(queries.privateOverview.queryFn()).resolves.toBeNull();
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
