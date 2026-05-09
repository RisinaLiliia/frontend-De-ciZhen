import { describe, expect, it } from 'vitest';

import { resolveWorkspacePublicRequestsData } from './workspacePublicRequests.data';

describe('workspacePublicRequests.data', () => {
  it('keeps market KPI and rail absent when the backend contract is not available', () => {
    const result = resolveWorkspacePublicRequestsData({
      marketResponse: null,
      filtersPage: 1,
      filtersLimit: 20,
    });

    expect(result.decisionPanel).toBeNull();
    expect(result.summaryItems).toEqual([]);
    expect(result.publicRequestsListItems).toEqual([]);
  });

  it('keeps public KPI state owned by the market contract instead of deriving it from client-side fallback data', () => {
    const result = resolveWorkspacePublicRequestsData({
      marketResponse: null,
      filtersPage: 1,
      filtersLimit: 20,
    });

    expect(result.publicRequestsListItems).toHaveLength(0);
    expect(result.summaryItems).toEqual([]);
  });

  it('resolves public requests list pagination and KPI data from the market contract only', () => {
    const result = resolveWorkspacePublicRequestsData({
      marketResponse: {
        list: {
          total: 42,
          page: 2,
          limit: 10,
          hasMore: true,
          items: [
            {
              id: 'market:req-1',
              requestId: 'req-1',
              role: 'provider',
              title: 'Rohr reinigen',
              category: 'plumbing',
              subcategory: 'drain-cleaning',
              city: 'Berlin',
              createdAtIso: '2026-04-20T09:00:00.000Z',
              nextEventAtIso: '2026-04-22T10:00:00.000Z',
              budget: 140,
              agreedPrice: null,
              state: 'active',
              stateLabel: 'In Ausführung',
              progress: { currentStep: 'contract', steps: [] },
              quickActions: [],
              requestPreview: {
                href: '/requests/req-1',
                categoryLabel: 'Rohrreinigung',
                title: 'Rohr reinigen',
                excerpt: 'Küche und Bad prüfen.',
                cityLabel: 'Berlin',
                priceLabel: '140 €',
                tags: ['Sanitär'],
              },
              status: { actions: [] },
              decision: {
                needsAction: false,
                actionType: 'none',
                actionPriority: 0,
                actionPriorityLevel: 'none',
              },
            },
          ],
        },
        summary: {
          items: [{ key: 'all', label: 'Alle', value: 42 }],
        },
        decisionPanel: null,
      } as never,
      filtersPage: 1,
      filtersLimit: 20,
    });

    expect(result.publicRequestsListItems).toHaveLength(1);
    expect(result.publicRequestsListItems[0]?.id).toBe('req-1');
    expect(result.publicRequestsTotal).toBe(42);
    expect(result.publicListPage).toBe(2);
    expect(result.publicListLimit).toBe(10);
  });
});
