import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { WorkspaceDecisionPanel } from './WorkspaceDecisionPanel';

const panel = {
  summary: {
    totalNeedsAction: 7,
    highPriorityCount: 2,
    newOffersCount: 3,
    replyRequiredCount: 0,
    confirmCompletionCount: 0,
    overdueCount: 4,
  },
  primaryAction: {
    label: 'Markt prüfen',
    mode: 'decision' as const,
    targetFilter: 'needs_action' as const,
  },
  queue: [],
  overview: {
    highUrgency: 8,
    inProgress: 2,
    completedThisPeriod: 0,
  },
};

describe('WorkspaceDecisionPanel', () => {
  it('renders market-specific workload copy for the public workspace rail', () => {
    const html = renderToStaticMarkup(
      <WorkspaceDecisionPanel
        locale="de"
        panel={panel}
        isDecisionMode={false}
        activeRequestId={null}
        onStartDecisionMode={vi.fn()}
        onOpenQueueItem={vi.fn()}
        variant="market"
      />,
    );

    expect(html).toContain('Decision Panel');
    expect(html).toContain('Action Queue');
    expect(html).toContain('Marktlage');
    expect(html).toContain('Hohe Nachfrage');
    expect(html).toContain('In Ausführung');
    expect(html).toContain('Abgeschlossen');
  });
});
