import { describe, expect, it } from 'vitest';

import { buildEmptyWorkspaceMarketRequestsResponse } from './workspacePublicRequests.model';
import { resolveWorkspacePublicRequestsData } from './workspacePublicRequests.data';

describe('workspacePublicRequests.data', () => {
  it('keeps the market decision rail available on the fallback response path', () => {
    const marketResponse = buildEmptyWorkspaceMarketRequestsResponse({
      locale: 'de',
      state: 'all',
      period: '30d',
      sort: 'date_desc',
      page: 1,
      limit: 20,
    });

    const result = resolveWorkspacePublicRequestsData({
      marketResponse,
      publicRequestsItems: [],
      publicRequestsTotalValue: 0,
      publicRequestsPage: 1,
      publicRequestsLimit: 20,
      filtersPage: 1,
      filtersLimit: 20,
    });

    expect(result.decisionPanel).toEqual(
      expect.objectContaining({
        primaryAction: expect.objectContaining({ label: 'Markt prüfen' }),
        queue: [],
        overview: {
          highUrgency: 0,
          inProgress: 0,
          completedThisPeriod: 0,
        },
      }),
    );
    expect(result.summaryItems).toEqual([
      expect.objectContaining({ key: 'all', value: 0 }),
      expect.objectContaining({ key: 'attention', value: 0 }),
      expect.objectContaining({ key: 'execution', value: 0 }),
      expect.objectContaining({ key: 'completed', value: 0 }),
    ]);
  });

  it('keeps public KPI state owned by the market contract instead of deriving it from fallback list data', () => {
    const marketResponse = buildEmptyWorkspaceMarketRequestsResponse({
      locale: 'de',
      state: 'all',
      period: '30d',
      sort: 'date_desc',
      page: 1,
      limit: 20,
    });

    const result = resolveWorkspacePublicRequestsData({
      marketResponse,
      publicRequestsItems: [
        { id: 'req-1', status: 'published' },
        { id: 'req-2', status: 'matched' },
        { id: 'req-3', status: 'closed' },
      ] as never,
      publicRequestsTotalValue: 3,
      publicRequestsPage: 1,
      publicRequestsLimit: 20,
      filtersPage: 1,
      filtersLimit: 20,
    });

    expect(result.publicRequestsListItems).toHaveLength(3);
    expect(result.summaryItems).toEqual([
      expect.objectContaining({ key: 'all', value: 0 }),
      expect.objectContaining({ key: 'attention', value: 0 }),
      expect.objectContaining({ key: 'execution', value: 0 }),
      expect.objectContaining({ key: 'completed', value: 0 }),
    ]);
  });
});
