/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useQueries } from '@tanstack/react-query';

import { useWorkspaceLegacyRequestSupportData } from './useWorkspaceLegacyRequestSupportData';

vi.mock('@tanstack/react-query', () => ({
  useQueries: vi.fn(),
}));

const useQueriesMock = vi.mocked(useQueries);

function Probe() {
  const result = useWorkspaceLegacyRequestSupportData({
    workspaceDataQueries: {
      favoriteRequests: {
        queryKey: ['favorite-requests'],
        enabled: false,
        queryFn: vi.fn(),
      },
      myReviews: {
        queryKey: ['reviews-my', 'all'],
        enabled: true,
        queryFn: vi.fn(),
      },
      myRequests: {
        queryKey: ['requests-my'],
        enabled: false,
        queryFn: vi.fn(),
      },
      myProviderContracts: {
        queryKey: ['contracts-provider'],
        enabled: true,
        queryFn: vi.fn(),
      },
      myClientContracts: {
        queryKey: ['contracts-client'],
        enabled: false,
        queryFn: vi.fn(),
      },
    } as never,
  });

  return (
    <div
      data-testid="legacy-request-support"
      data-reviews-count={String(result.myReviews.length)}
      data-provider-contracts-count={String(result.myProviderContracts.length)}
      data-favorites-count={String(result.favoriteRequests.length)}
      data-client-contracts-count={String(result.myClientContracts.length)}
    />
  );
}

describe('useWorkspaceLegacyRequestSupportData', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('subscribes only to enabled legacy request queries', () => {
    useQueriesMock.mockReturnValue([
      { data: [{ id: 'review-1' }], isLoading: false },
      { data: [{ id: 'contract-1' }], isLoading: false },
    ] as never);

    render(<Probe />);

    const queryArgs = useQueriesMock.mock.calls[0]?.[0] as {
      queries: Array<{ queryKey: readonly unknown[] }>;
    };

    expect(queryArgs.queries.map((query) => query.queryKey)).toEqual([
      ['reviews-my', 'all'],
      ['contracts-provider'],
    ]);

    const node = screen.getByTestId('legacy-request-support');
    expect(node.getAttribute('data-reviews-count')).toBe('1');
    expect(node.getAttribute('data-provider-contracts-count')).toBe('1');
    expect(node.getAttribute('data-favorites-count')).toBe('0');
    expect(node.getAttribute('data-client-contracts-count')).toBe('0');
  });
});
