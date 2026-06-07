import { describe, expect, it, vi } from 'vitest';

import {
  buildRequestsWorkspaceDecisionRailProps,
} from './requestsWorkspaceSurface.model';

describe('requestsWorkspaceSurface.model', () => {
  it('builds shared decision rail props for market and private variants', () => {
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

    expect(
      buildRequestsWorkspaceDecisionRailProps({
        locale: 'de',
        panel,
        mode: 'default',
        activeRequestId: null,
        onStartDecisionMode: vi.fn(),
        onOpenQueueItem: vi.fn(),
      }).variant,
    ).toBe('private');

    expect(
      buildRequestsWorkspaceDecisionRailProps({
        locale: 'de',
        panel,
        mode: 'default',
        activeRequestId: null,
        onStartDecisionMode: vi.fn(),
        onOpenQueueItem: vi.fn(),
        variant: 'market',
      }).variant,
    ).toBe('market');
  });
});
