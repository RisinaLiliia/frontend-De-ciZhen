import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { RequestsWorkspaceSummary } from './RequestsWorkspaceSummary';

describe('RequestsWorkspaceSummary', () => {
  it('renders a summary skeleton when loading without resolved strip props', () => {
    const html = renderToStaticMarkup(
      <RequestsWorkspaceSummary isLoading />,
    );

    expect(html).toContain('skeleton');
    expect(html).toContain('my-requests-summary');
  });

  it('renders the shared summary strip when props are available', () => {
    const html = renderToStaticMarkup(
      <RequestsWorkspaceSummary
        summaryStripProps={{
          locale: 'de',
          items: [{ key: 'all', label: 'Alle', value: 8, isHighlighted: true }],
          onSelect: vi.fn(),
          variant: 'market',
        }}
      />,
    );

    expect(html).toContain('Alle');
    expect(html).toContain('Gesamter Markt');
  });
});
