/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useQueries } from '@tanstack/react-query';

import { useWorkspaceLegacyOfferData } from './useWorkspaceLegacyOfferData';

vi.mock('@tanstack/react-query', () => ({
  useQueries: vi.fn(),
}));

const useQueriesMock = vi.mocked(useQueries);

function DisabledProbe() {
  const result = useWorkspaceLegacyOfferData({
    workspaceDataQueries: {
      myOffers: {
        queryKey: ['offers-my'],
        enabled: false,
        queryFn: vi.fn(),
      },
    } as never,
    locale: 'de',
    shouldLoadOfferRequests: false,
  });

  return (
    <div
      data-testid="legacy-offer-disabled"
      data-offers-count={String(result.myOffers.length)}
      data-requests-count={String(result.myOfferRequestsById.size)}
    />
  );
}

function EnabledProbe() {
  const result = useWorkspaceLegacyOfferData({
    workspaceDataQueries: {
      myOffers: {
        queryKey: ['offers-my'],
        enabled: true,
        queryFn: vi.fn(),
      },
    } as never,
    locale: 'de',
    shouldLoadOfferRequests: true,
  });

  return (
    <div
      data-testid="legacy-offer-enabled"
      data-offers-count={String(result.myOffers.length)}
      data-requests-count={String(result.myOfferRequestsById.size)}
    />
  );
}

describe('useWorkspaceLegacyOfferData', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('does not subscribe to disabled legacy offer queries', () => {
    useQueriesMock
      .mockReturnValueOnce([] as never)
      .mockReturnValueOnce([] as never);

    render(<DisabledProbe />);

    const firstCall = useQueriesMock.mock.calls[0]?.[0] as { queries: unknown[] };
    const secondCall = useQueriesMock.mock.calls[1]?.[0] as { queries: unknown[] };

    expect(firstCall.queries).toEqual([]);
    expect(secondCall.queries).toEqual([]);

    const node = screen.getByTestId('legacy-offer-disabled');
    expect(node.getAttribute('data-offers-count')).toBe('0');
    expect(node.getAttribute('data-requests-count')).toBe('0');
  });

  it('subscribes only to enabled offer queries and derived request batch', () => {
    useQueriesMock
      .mockReturnValueOnce([{ data: [{ id: 'offer-1', requestId: 'req-1' }], isLoading: false }] as never)
      .mockReturnValueOnce([{ data: new Map([['req-1', { id: 'req-1' }]]), isLoading: false }] as never);

    render(<EnabledProbe />);

    const firstCall = useQueriesMock.mock.calls[0]?.[0] as {
      queries: Array<{ queryKey: readonly unknown[] }>;
    };
    const secondCall = useQueriesMock.mock.calls[1]?.[0] as {
      queries: Array<{ queryKey: readonly unknown[] }>;
    };

    expect(firstCall.queries.map((query) => query.queryKey)).toEqual([
      ['offers-my'],
    ]);
    expect(secondCall.queries.map((query) => query.queryKey)).toEqual([
      ['requests-by-my-offer-ids', 'de', 'req-1'],
    ]);

    const node = screen.getByTestId('legacy-offer-enabled');
    expect(node.getAttribute('data-offers-count')).toBe('1');
    expect(node.getAttribute('data-requests-count')).toBe('1');
  });
});
