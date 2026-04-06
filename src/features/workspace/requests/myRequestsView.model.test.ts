import { describe, expect, it } from 'vitest';

import { buildMyRequestsViewModel } from '@/features/workspace/requests/myRequestsView.model';

describe('myRequestsView.model', () => {
  it('builds customer and provider cards with role-aware state mapping', () => {
    const model = buildMyRequestsViewModel({
      locale: 'de',
      role: 'all',
      state: 'all',
      period: '30d',
      sort: 'activity',
      now: Date.parse('2026-04-06T10:00:00.000Z'),
      myRequests: [
        {
          id: 'r1',
          serviceKey: 'cleaning-basic',
          cityId: 'berlin',
          categoryKey: 'cleaning',
          categoryName: 'Reinigung',
          propertyType: 'apartment',
          area: 80,
          price: 140,
          preferredDate: '2026-04-07T10:00:00.000Z',
          isRecurring: false,
          status: 'published',
          createdAt: '2026-04-05T08:00:00.000Z',
          title: 'Wohnung reinigen',
        },
      ],
      myOffers: [
        {
          id: 'o1',
          requestId: 'r2',
          providerUserId: 'p1',
          clientUserId: 'c1',
          status: 'accepted',
          amount: 220,
          createdAt: '2026-04-05T09:00:00.000Z',
          updatedAt: '2026-04-06T07:00:00.000Z',
        },
      ],
      myClientOffers: [
        {
          id: 'co1',
          requestId: 'r1',
          providerUserId: 'p2',
          clientUserId: 'c1',
          status: 'sent',
          amount: 150,
          createdAt: '2026-04-06T06:00:00.000Z',
          updatedAt: '2026-04-06T06:00:00.000Z',
        },
      ],
      myOfferRequestsById: new Map([
        ['r2', {
          id: 'r2',
          serviceKey: 'cleaning-basic',
          cityId: 'berlin',
          categoryKey: 'cleaning',
          categoryName: 'Reinigung',
          propertyType: 'apartment',
          area: 50,
          price: 220,
          preferredDate: '2026-04-08T12:00:00.000Z',
          isRecurring: false,
          status: 'matched',
          createdAt: '2026-04-04T08:00:00.000Z',
          title: 'Büro reinigen',
        }],
      ]),
      myProviderContracts: [
        {
          id: 'ct1',
          requestId: 'r2',
          offerId: 'o1',
          clientId: 'c1',
          providerUserId: 'p1',
          status: 'confirmed',
          priceAmount: 220,
          priceType: 'fixed',
          priceDetails: null,
          confirmedAt: '2026-04-07T12:00:00.000Z',
          completedAt: null,
          cancelledAt: null,
          cancelReason: null,
          createdAt: '2026-04-06T07:00:00.000Z',
          updatedAt: '2026-04-06T07:30:00.000Z',
        },
      ],
      myClientContracts: [],
      cityById: new Map([
        ['berlin', { id: 'berlin', i18n: { de: 'Berlin', en: 'Berlin' } }],
      ]),
      categoryByKey: new Map([
        ['cleaning', { key: 'cleaning', i18n: { de: 'Reinigung', en: 'Cleaning' } }],
      ]),
      serviceByKey: new Map([
        ['cleaning-basic', { key: 'cleaning-basic', categoryKey: 'cleaning', i18n: { de: 'Grundreinigung', en: 'Basic cleaning' } }],
      ]),
      formatDate: (value) => String(value).slice(0, 10),
      formatPrice: (value) => `${value} EUR`,
    });

    expect(model.summary.find((item) => item.key === 'clarifying')?.value).toBe(1);
    expect(model.summary.find((item) => item.key === 'active')?.value).toBe(1);
    expect(model.cards).toHaveLength(2);
    expect(model.cards.find((card) => card.role === 'customer')?.state).toBe('clarifying');
    expect(model.cards.find((card) => card.role === 'provider')?.state).toBe('active');
    expect(model.rail.nextSteps.length).toBeGreaterThan(0);
  });
});
