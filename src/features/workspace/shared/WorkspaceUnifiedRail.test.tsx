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
});
