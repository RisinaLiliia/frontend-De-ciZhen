import { describe, expect, it, vi } from 'vitest';

import {
  buildWorkspacePublicRequestsAsideProps,
} from './workspacePublicRequests.view-model';

describe('workspacePublicRequests.view-model', () => {
  it('builds a market decision rail contract for the shared requests surface', () => {
    const panel = {
      summary: {
        totalNeedsAction: 3,
        highPriorityCount: 1,
        newOffersCount: 2,
        replyRequiredCount: 0,
        confirmCompletionCount: 0,
        overdueCount: 1,
      },
      primaryAction: {
        label: 'Markt prüfen',
        mode: 'decision' as const,
        targetFilter: 'needs_action' as const,
      },
      queue: [],
      overview: {
        highUrgency: 4,
        inProgress: 2,
        completedThisPeriod: 1,
      },
    };

    expect(buildWorkspacePublicRequestsAsideProps({
      locale: 'de',
      panel,
      onStartDecisionMode: vi.fn(),
      onOpenQueueItem: vi.fn(),
    }).variant).toBe('market');
  });
});
