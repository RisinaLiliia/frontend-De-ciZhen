import { describe, expect, it } from 'vitest';

import {
  buildFallbackDecisionPanel,
  resolveWorkspacePublicRequestsData,
} from './workspacePublicRequests.data';

describe('workspacePublicRequests.data', () => {
  it('builds a market decision panel fallback from public requests', () => {
    const panel = buildFallbackDecisionPanel({
      locale: 'de',
      nowMs: Date.parse('2026-04-30T12:00:00.000Z'),
      requests: [
        {
          id: 'req-1',
          serviceKey: 'plumbing',
          cityId: 'berlin',
          propertyType: 'apartment',
          area: 10,
          isRecurring: false,
          title: 'WC reparieren',
          status: 'matched',
          createdAt: '2026-04-28T10:00:00.000Z',
          preferredDate: '2026-05-02T10:00:00.000Z',
        },
        {
          id: 'req-2',
          serviceKey: 'repair',
          cityId: 'berlin',
          propertyType: 'apartment',
          area: 20,
          isRecurring: false,
          title: 'Kleine Reparaturen zuhause',
          status: 'published',
          createdAt: '2026-04-28T09:00:00.000Z',
          preferredDate: '2026-05-03T10:00:00.000Z',
        },
        {
          id: 'req-3',
          serviceKey: 'cleaning',
          cityId: 'hamburg',
          propertyType: 'house',
          area: 30,
          isRecurring: false,
          title: 'Terrasse reinigen',
          status: 'published',
          createdAt: '2026-04-30T08:00:00.000Z',
          preferredDate: '2026-05-04T10:00:00.000Z',
        },
        {
          id: 'req-4',
          serviceKey: 'cleaning',
          cityId: 'hamburg',
          propertyType: 'house',
          area: 30,
          isRecurring: false,
          title: 'Büroreinigung',
          status: 'closed',
          createdAt: '2026-04-20T08:00:00.000Z',
          preferredDate: '2026-04-21T10:00:00.000Z',
        },
      ],
    });

    expect(panel.summary).toMatchObject({
      totalNeedsAction: 3,
      highPriorityCount: 1,
      newOffersCount: 1,
      overdueCount: 1,
    });
    expect(panel.queue.map((item) => item.actionLabel)).toEqual([
      'Vertrag ansehen',
      'Seit 24h ohne Aktion',
      'Neu im Markt',
    ]);
    expect(panel.overview).toMatchObject({
      highUrgency: 2,
      inProgress: 1,
      completedThisPeriod: 1,
    });
  });

  it('uses fallback decision panel when market contract is unavailable', () => {
    const result = resolveWorkspacePublicRequestsData({
      locale: 'de',
      activeRequestsState: 'all',
      hasMarketContract: false,
      marketResponse: {
        section: 'requests',
        scope: 'market',
        header: { title: 'Market' },
        filters: {},
        summary: null,
        list: {
          total: 0,
          page: 1,
          limit: 20,
          hasMore: false,
          items: [],
        },
        decisionPanel: null,
        sidePanel: null,
      },
      marketRequests: [],
      publicRequestsItems: [
        {
          id: 'req-1',
          serviceKey: 'plumbing',
          cityId: 'berlin',
          propertyType: 'apartment',
          area: 10,
          isRecurring: false,
          title: 'WC reparieren',
          status: 'matched',
          createdAt: '2026-04-28T10:00:00.000Z',
          preferredDate: '2026-05-02T10:00:00.000Z',
        },
      ],
      publicRequestsTotalValue: 1,
      publicRequestsPage: 1,
      publicRequestsLimit: 20,
      filtersPage: 1,
      filtersLimit: 20,
      platformRequestsTotal: 99,
    });

    expect(result.decisionPanel.primaryAction.label).toBe('Markt prüfen');
    expect(result.decisionPanel.queue).toHaveLength(1);
    expect(result.summaryItems[0]?.value).toBe(99);
  });
});
