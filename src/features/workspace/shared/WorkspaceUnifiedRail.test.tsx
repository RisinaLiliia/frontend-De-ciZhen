import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { WorkspaceUnifiedRail } from './WorkspaceUnifiedRail';

describe('WorkspaceUnifiedRail', () => {
  it('renders overview metrics without a chart when visualization is none', () => {
    const html = renderToStaticMarkup(
      <WorkspaceUnifiedRail
        model={{
          decisionPanel: {
            eyebrow: 'Decision panel',
            value: 3,
            contextLabel: 'Conversations in focus',
            title: 'No replies pending',
            visualization: 'none',
            metrics: [
              { key: 'unread', label: 'Unread', value: 0 },
              { key: 'active', label: 'Active', value: 3 },
            ],
          },
          actionQueue: {
            eyebrow: 'Action queue',
            title: '0 tasks',
            items: [],
            emptyText: 'Inbox is clear.',
          },
          recommendations: {
            eyebrow: 'Recommendations',
            title: 'Recommended',
            items: [],
            emptyText: 'No recommendations.',
          },
        }}
      />,
    );

    expect(html).toContain('Conversations in focus');
    expect(html).not.toContain('No replies pending');
    expect(html).toContain('Unread');
    expect(html).toContain('Active');
    expect(html).not.toContain('workspace-unified-rail__chart');
  });

  it('renders decision panel metrics with semantic tones instead of index tones', () => {
    const html = renderToStaticMarkup(
      <WorkspaceUnifiedRail
        model={{
          decisionPanel: {
            eyebrow: 'Decision panel',
            value: 12,
            contextLabel: 'Market',
            title: 'Market state',
            visualization: 'donut',
            metrics: [
              { key: 'requests', label: 'Anfragen', value: 12, icon: 'requests', tone: 'demand' },
              { key: 'providers', label: 'Anbieter', value: 7, icon: 'providers', tone: 'supply' },
              { key: 'completed', label: 'Abgeschlossen', value: 4, icon: 'responseRate', tone: 'opportunity' },
            ],
          },
          actionQueue: {
            eyebrow: 'Market Opportunities',
            title: '0 Chancen',
            items: [],
            emptyText: 'No opportunities.',
          },
          recommendations: {
            eyebrow: 'Empfehlungen',
            title: 'Recommended',
            items: [],
            emptyText: 'No recommendations.',
          },
        }}
      />,
    );

    expect(html).toContain('is-demand');
    expect(html).toContain('is-supply');
    expect(html).toContain('is-opportunity');
    expect(html).toContain('--workspace-rail-tone-demand');
    expect(html).toContain('--workspace-rail-tone-supply');
    expect(html).toContain('--workspace-rail-tone-opportunity');
    expect(html).not.toContain('is-tone-1');
    expect(html).not.toContain('is-tone-2');
    expect(html).not.toContain('is-tone-3');
  });
});
