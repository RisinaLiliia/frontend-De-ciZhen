import { describe, expect, it } from 'vitest';

import { resolveWorkspacePublicRequestsData } from './workspacePublicRequests.data';

describe('workspacePublicRequests.data', () => {
  it('keeps market KPI and rail absent when the backend contract is not available', () => {
    const result = resolveWorkspacePublicRequestsData({
      marketResponse: null,
      publicRequestsItems: [],
      publicRequestsTotalValue: 0,
      publicRequestsPage: 1,
      publicRequestsLimit: 20,
      filtersPage: 1,
      filtersLimit: 20,
    });

    expect(result.decisionPanel).toBeNull();
    expect(result.summaryItems).toEqual([]);
  });

  it('keeps public KPI state owned by the market contract instead of deriving it from fallback list data', () => {
    const result = resolveWorkspacePublicRequestsData({
      marketResponse: null,
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
    expect(result.summaryItems).toEqual([]);
  });
});
