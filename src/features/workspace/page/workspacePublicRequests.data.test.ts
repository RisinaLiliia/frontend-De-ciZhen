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
      locale: 'de',
      activeRequestsState: 'all',
      hasMarketContract: false,
      marketResponse,
      publicRequestsItems: [],
      publicRequestsTotalValue: 0,
      publicRequestsPage: 1,
      publicRequestsLimit: 20,
      filtersPage: 1,
      filtersLimit: 20,
      platformRequestsTotal: 0,
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
  });
});
