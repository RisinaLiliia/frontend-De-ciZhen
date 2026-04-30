import { describe, expect, it } from 'vitest';

import {
  buildEmptyWorkspaceMarketRequestsResponse,
  mapWorkspaceRequestCardToPublicRequest,
} from '@/features/workspace/page/workspacePublicRequests.model';

describe('workspacePublicRequests.model', () => {
  it('maps workspace market cards into the public request card shape', () => {
    const result = mapWorkspaceRequestCardToPublicRequest({
      id: 'market:req-1',
      requestId: 'req-1',
      role: 'provider',
      title: 'Rohr reinigen',
      category: 'plumbing',
      subcategory: 'drain-cleaning',
      city: 'Berlin',
      createdAt: '2026-04-20T09:00:00.000Z',
      nextEventAt: '2026-04-22T10:00:00.000Z',
      budget: 140,
      agreedPrice: null,
      state: 'active',
      stateLabel: 'In Ausführung',
      progress: {
        currentStep: 'contract',
        steps: [],
      },
      quickActions: [],
      requestPreview: {
        href: '/requests/req-1',
        imageUrl: '/img.jpg',
        categoryLabel: 'Rohrreinigung',
        title: 'Rohr reinigen',
        excerpt: 'Küche und Bad prüfen.',
        cityLabel: 'Berlin',
        dateLabel: '22.04.',
        priceLabel: '140 €',
        priceTrend: 'up',
        priceTrendLabel: 'Steigend',
        tags: ['Sanitär', 'Rohr'],
      },
      status: { actions: [] },
      decision: {
        needsAction: true,
        actionType: 'review_offers',
        actionPriority: 80,
        actionPriorityLevel: 'high',
      },
    });

    expect(result).toMatchObject({
      id: 'req-1',
      serviceKey: 'drain-cleaning',
      cityName: 'Berlin',
      categoryKey: 'plumbing',
      categoryName: 'Rohrreinigung',
      subcategoryName: 'drain-cleaning',
      price: 140,
      preferredDate: '2026-04-22T10:00:00.000Z',
      title: 'Rohr reinigen',
      description: 'Küche und Bad prüfen.',
      imageUrl: '/img.jpg',
      status: 'matched',
      tags: ['Sanitär', 'Rohr'],
    });
  });

  it('builds a stable empty market response for loading and empty states', () => {
    const result = buildEmptyWorkspaceMarketRequestsResponse({
      locale: 'de',
      state: 'attention',
      period: '30d',
      sort: 'date_desc',
      page: 2,
      limit: 20,
    });

    expect(result.scope).toBe('market');
    expect(result.summary?.items.map((item) => item.label)).toEqual([
      'Alle',
      'Aktiv',
      'In Ausführung',
      'Abgeschlossen',
    ]);
    expect(result.list).toMatchObject({
      total: 0,
      page: 2,
      limit: 20,
    });
    expect(result.decisionPanel?.primaryAction.label).toBe('Markt prüfen');
  });
});
