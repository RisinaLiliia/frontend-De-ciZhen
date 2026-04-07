import { describe, expect, it } from 'vitest';

import {
  buildMyRequestsViewModel,
  buildMyRequestsViewModelFromResponse,
} from '@/features/workspace/requests/myRequestsView.model';

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
    });

    expect(model.response.summary?.items.find((item) => item.key === 'attention')?.value).toBe(1);
    expect(model.response.summary?.items.find((item) => item.key === 'execution')?.value).toBe(1);
    expect(model.cards).toHaveLength(2);
    expect(model.cards.find((card) => card.role === 'customer')?.workflowState).toBe('clarifying');
    expect(model.cards.find((card) => card.role === 'provider')?.workflowState).toBe('active');
    expect(model.response.sidePanel?.nextSteps?.length ?? 0).toBeGreaterThan(0);
  });

  it('adapts server-driven workspace requests response when request entities are available', () => {
    const model = buildMyRequestsViewModelFromResponse({
      response: {
        section: 'requests',
        scope: 'my',
        header: { title: 'Meine Vorgänge' },
        filters: {
          role: 'all',
          state: 'attention',
          period: '30d',
        },
        summary: {
          items: [
            { key: 'all', label: 'Alle', value: 1 },
            { key: 'attention', label: 'Aktiv', value: 1, isHighlighted: true },
          ],
        },
        list: {
          total: 1,
          page: 1,
          limit: 20,
          hasMore: false,
          items: [
            {
              id: 'customer:r1',
              requestId: 'r1',
              role: 'customer',
              title: 'Wohnung reinigen',
              category: 'Reinigung',
              city: 'Berlin',
              state: 'open',
              stateLabel: 'Offen',
              activity: null,
              progress: {
                currentStep: 'request',
                steps: [
                  { key: 'request', label: 'Anfrage', status: 'current' },
                  { key: 'offers', label: 'Angebote', status: 'upcoming' },
                  { key: 'selection', label: 'Auswahl', status: 'upcoming' },
                  { key: 'contract', label: 'Vertrag', status: 'upcoming' },
                  { key: 'done', label: 'Abschluss', status: 'upcoming' },
                ],
              },
              quickActions: [],
            },
          ],
        },
        sidePanel: null,
      },
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
      myOfferRequestsById: new Map(),
    });

    expect(model).not.toBeNull();
    expect(model?.cards).toHaveLength(1);
    expect(model?.cards[0]?.request.id).toBe('r1');
    expect(model?.emptyMode).toBe('none');
  });

  it('keeps provider cards renderable when request entity lookup is missing', () => {
    const model = buildMyRequestsViewModelFromResponse({
      response: {
        section: 'requests',
        scope: 'my',
        header: { title: 'Meine Vorgänge' },
        filters: {
          role: 'provider',
          state: 'all',
          period: '30d',
        },
        summary: {
          items: [
            { key: 'all', label: 'Alle', value: 1, isHighlighted: true },
            { key: 'execution', label: 'In Ausführung', value: 1 },
          ],
        },
        list: {
          total: 1,
          page: 1,
          limit: 20,
          hasMore: false,
          items: [
            {
              id: 'provider:r2',
              requestId: 'r2',
              role: 'provider',
              title: 'Büro reinigen',
              category: 'Reinigung',
              city: 'Berlin',
              state: 'active',
              stateLabel: 'In Arbeit',
              activity: { label: 'Warte auf Vertragsbestätigung', tone: 'warning' },
              progress: {
                currentStep: 'contract',
                steps: [
                  { key: 'request', label: 'Anfrage', status: 'done' },
                  { key: 'offers', label: 'Angebote', status: 'done' },
                  { key: 'selection', label: 'Auswahl', status: 'done' },
                  { key: 'contract', label: 'Vertrag', status: 'current' },
                  { key: 'done', label: 'Abschluss', status: 'upcoming' },
                ],
              },
              quickActions: [],
            },
          ],
        },
        sidePanel: null,
      },
      myRequests: [],
      myOfferRequestsById: new Map(),
    });

    expect(model).not.toBeNull();
    expect(model?.cards).toHaveLength(1);
    expect(model?.cards[0]?.role).toBe('provider');
    expect(model?.cards[0]?.request.id).toBe('r2');
    expect(model?.cards[0]?.request.title).toBe('Büro reinigen');
    expect(model?.emptyMode).toBe('none');
  });

  it('keeps provider cards in the selected period when the next work event is upcoming', () => {
    const model = buildMyRequestsViewModel({
      locale: 'de',
      role: 'provider',
      state: 'all',
      period: '30d',
      sort: 'activity',
      now: Date.parse('2026-04-07T10:00:00.000Z'),
      myRequests: [],
      myOffers: [
        {
          id: 'o-provider',
          requestId: 'r-provider',
          providerUserId: 'p1',
          clientUserId: 'c1',
          status: 'accepted',
          amount: 220,
          createdAt: '2026-02-01T09:00:00.000Z',
          updatedAt: '2026-02-01T09:00:00.000Z',
          availableAt: '2026-04-20T10:00:00.000Z',
          requestPreferredDate: '2026-04-21T10:00:00.000Z',
          requestStatus: 'matched',
        },
      ],
      myClientOffers: [],
      myOfferRequestsById: new Map([
        ['r-provider', {
          id: 'r-provider',
          serviceKey: 'cleaning-basic',
          cityId: 'berlin',
          categoryKey: 'cleaning',
          categoryName: 'Reinigung',
          propertyType: 'apartment',
          area: 50,
          price: 220,
          preferredDate: '2026-04-21T10:00:00.000Z',
          isRecurring: false,
          status: 'matched',
          createdAt: '2026-01-20T08:00:00.000Z',
          title: 'Büro reinigen',
        }],
      ]),
      myProviderContracts: [],
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
    });

    expect(model.cards).toHaveLength(1);
    expect(model.cards[0]?.role).toBe('provider');
    expect(model.response.list.items).toHaveLength(1);
  });
});
