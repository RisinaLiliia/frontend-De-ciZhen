import { describe, expect, it } from 'vitest';

import {
  buildDecisionPanelSummaryText,
  resolveDecisionActiveRequestId,
  sortCardsForDecisionMode,
} from '@/features/workspace/requests/requestsDecision.model';

describe('requestsDecision.model', () => {
  const panel = {
    summary: {
      totalNeedsAction: 3,
      highPriorityCount: 1,
      newOffersCount: 2,
      replyRequiredCount: 1,
      confirmCompletionCount: 0,
      overdueCount: 0,
    },
    primaryAction: {
      label: 'Jetzt handeln',
      mode: 'decision' as const,
      targetFilter: 'needs_action' as const,
    },
    queue: [
      {
        requestId: 'req-2',
        title: 'Second',
        actionType: 'confirm_contract' as const,
        actionLabel: 'Vertrag bestätigen',
        actionPriority: 90,
        actionPriorityLevel: 'high' as const,
      },
      {
        requestId: 'req-1',
        title: 'First',
        actionType: 'review_offers' as const,
        actionLabel: '2 Angebote prüfen',
        actionPriority: 70,
        actionPriorityLevel: 'medium' as const,
      },
    ],
    overview: {
      highUrgency: 1,
      inProgress: 2,
      completedThisPeriod: 1,
    },
  };

  it('keeps decision-mode cards in backend queue order', () => {
    const result = sortCardsForDecisionMode([
      {
        id: 'customer:req-1',
        requestId: 'req-1',
        role: 'customer',
        title: 'First',
        category: 'Design',
        state: 'clarifying',
        stateLabel: 'In Klärung',
        progress: { currentStep: 'selection', steps: [] },
        quickActions: [],
        requestPreview: {
          href: '/requests/req-1',
          categoryLabel: 'Design',
          title: 'First',
          priceLabel: '100 €',
          tags: [],
        },
        status: { actions: [] },
        decision: {
          needsAction: true,
          actionType: 'review_offers',
          actionPriority: 70,
          actionPriorityLevel: 'medium',
        },
      },
      {
        id: 'customer:req-2',
        requestId: 'req-2',
        role: 'customer',
        title: 'Second',
        category: 'Photo',
        state: 'active',
        stateLabel: 'In Arbeit',
        progress: { currentStep: 'contract', steps: [] },
        quickActions: [],
        requestPreview: {
          href: '/requests/req-2',
          categoryLabel: 'Photo',
          title: 'Second',
          priceLabel: '250 €',
          tags: [],
        },
        status: { actions: [] },
        decision: {
          needsAction: true,
          actionType: 'confirm_contract',
          actionPriority: 90,
          actionPriorityLevel: 'high',
        },
      },
    ], panel);

    expect(result.map((card) => card.requestId)).toEqual(['req-2', 'req-1']);
  });

  it('resolves the first actionable card when no active id is set', () => {
    expect(resolveDecisionActiveRequestId({
      mode: 'decision',
      queueIds: ['req-2', 'req-1'],
      activeRequestId: null,
    })).toBe('req-2');
  });

  it('builds concise summary copy from backend summary counts', () => {
    expect(buildDecisionPanelSummaryText({
      locale: 'de',
      panel,
    })).toBe('2 neue Angebote, 1 offene Rückmeldung');
  });
});
