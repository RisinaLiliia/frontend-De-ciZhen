import { describe, expect, it } from 'vitest';

import { buildMyRequestsViewModelFromResponse } from '@/features/workspace/requests/myRequestsView.model';

describe('myRequestsView.model', () => {
  it('maps a server-driven response into a render model', () => {
    const model = buildMyRequestsViewModelFromResponse({
      section: 'requests',
      scope: 'my',
      header: { title: 'Meine Vorgänge' },
      filters: {
        role: 'provider',
        state: 'execution',
        period: '30d',
        sort: 'activity',
      },
      summary: {
        items: [
          { key: 'all', label: 'Alle', value: 1 },
          { key: 'execution', label: 'In Ausführung', value: 1, isHighlighted: true },
        ],
      },
      list: {
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
        items: [
          {
            id: 'provider:r1',
            requestId: 'r1',
            role: 'provider',
            title: 'Büro reinigen',
            category: 'Reinigung',
            city: 'Berlin',
            createdAt: '07.04.2026',
            nextEventAt: '12.04.2026',
            budget: 220,
            agreedPrice: 220,
            state: 'active',
            stateLabel: 'In Arbeit',
            activity: { label: 'Auftrag beginnt 12.04.2026', tone: 'info' },
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
            requestPreview: {
              href: '/requests/r1',
              imageUrl: null,
              imageCategoryKey: 'cleaning',
              badgeLabel: 'Einmalig',
              categoryLabel: 'Reinigung',
              title: 'Büro reinigen',
              excerpt: 'Fenster und Böden.',
              cityLabel: 'Berlin',
              dateLabel: '12.04.2026',
              priceLabel: '220 €',
              priceTrend: null,
              priceTrendLabel: null,
              tags: ['Reinigung', 'Grundreinigung'],
            },
            status: {
              badgeLabel: 'Angenommen',
              badgeTone: 'success',
              actions: [
                {
                  key: 'contract',
                  kind: 'link',
                  tone: 'primary',
                  icon: 'briefcase',
                  label: 'Vertrag',
                  href: '/workspace?tab=completed-jobs',
                  requestId: 'r1',
                  offerId: 'o1',
                },
              ],
            },
            decision: {
              needsAction: false,
              actionType: 'none',
              actionPriority: 0,
              actionPriorityLevel: 'none',
              actionLabel: null,
              actionReason: null,
              lastRelevantActivityAt: null,
              primaryAction: null,
            },
          },
        ],
      },
      decisionPanel: {
        summary: {
          totalNeedsAction: 0,
          highPriorityCount: 0,
          newOffersCount: 0,
          replyRequiredCount: 0,
          confirmCompletionCount: 0,
          overdueCount: 0,
        },
        primaryAction: {
          label: 'Jetzt handeln',
          mode: 'decision',
          targetFilter: 'needs_action',
        },
        queue: [],
        overview: {
          highUrgency: 0,
          inProgress: 1,
          completedThisPeriod: 0,
        },
      },
      sidePanel: null,
    });

    expect(model.cards).toHaveLength(1);
    expect(model.cards[0]?.requestPreview.title).toBe('Büro reinigen');
    expect(model.cards[0]?.status.badgeLabel).toBe('Angenommen');
    expect(model.emptyMode).toBe('none');
  });

  it('marks the model as empty when the all counter is zero', () => {
    const model = buildMyRequestsViewModelFromResponse({
      section: 'requests',
      scope: 'my',
      header: { title: 'Meine Vorgänge' },
      filters: {
        role: 'all',
        state: 'all',
        period: '30d',
      },
      summary: {
        items: [{ key: 'all', label: 'Alle', value: 0, isHighlighted: true }],
      },
      list: {
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
        items: [],
      },
      decisionPanel: {
        summary: {
          totalNeedsAction: 0,
          highPriorityCount: 0,
          newOffersCount: 0,
          replyRequiredCount: 0,
          confirmCompletionCount: 0,
          overdueCount: 0,
        },
        primaryAction: {
          label: 'Jetzt handeln',
          mode: 'decision',
          targetFilter: 'needs_action',
        },
        queue: [],
        overview: {
          highUrgency: 0,
          inProgress: 0,
          completedThisPeriod: 0,
        },
      },
      sidePanel: null,
    });

    expect(model.cards).toHaveLength(0);
    expect(model.emptyMode).toBe('empty');
  });
});
