/** @vitest-environment happy-dom */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ActivityTrendChart } from './ActivityTrendChart';

afterEach(() => {
  cleanup();
});

describe('ActivityTrendChart', () => {
  it('renders cumulative market totals from the latest point in the legend', () => {
    const { container } = render(
      <ActivityTrendChart
        points={[
          {
            timestamp: '2026-06-03T12:00:00.000Z',
            label: '03. Juni',
            requests: 42,
            offers: 25,
          },
          {
            timestamp: '2026-06-04T12:00:00.000Z',
            label: '04. Juni',
            requests: 78,
            offers: 61,
          },
          {
            timestamp: '2026-06-05T12:00:00.000Z',
            label: '05. Juni',
            requests: 108,
            offers: 82,
          },
        ]}
        range="30d"
        locale="de"
        requestsLabel="Anfragen"
        offersLabel="Angebote"
        clientActivityLabel="Du als Auftraggeber"
        providerActivityLabel="Du als Anbieter"
        emptyLabel="Keine Aktivität"
      />,
    );

    expect(container.querySelector('.home-activity__metric.is-requests strong')?.textContent).toBe('108');
    expect(container.querySelector('.home-activity__metric.is-offers strong')?.textContent).toBe('82');
  });
});
