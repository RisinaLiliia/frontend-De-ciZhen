/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRequestsExplorerRequestsData } from './useRequestsExplorerRequestsData';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useQueries: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/useFavoriteToggles', () => ({
  useRequestFavoriteToggle: () => ({
    pendingFavoriteRequestIds: new Set<string>(),
    toggleRequestFavorite: vi.fn(),
  }),
}));

const useQueryMock = vi.mocked(useQuery);
const useQueriesMock = vi.mocked(useQueries);
const useQueryClientMock = vi.mocked(useQueryClient);

function Probe({ isProvidersView, isAuthed }: { isProvidersView: boolean; isAuthed: boolean }) {
  const result = useRequestsExplorerRequestsData({
    t: (key) => String(key),
    locale: 'de',
    isAuthed,
    isProvidersView,
    filter: { sort: 'date_desc', page: 1, limit: 20 },
    page: 1,
    limit: 20,
    setPage: vi.fn(),
    searchParams: null,
    pathname: '/workspace',
    initialPublicRequests: undefined,
    preferInitialPublicRequests: false,
    initialPublicRequestsLoading: false,
    initialPublicRequestsError: false,
  });

  return (
    <div
      data-testid="requests-explorer-data"
      data-requests-count={String(result.requests.length)}
      data-favorites-count={String(result.favoriteRequestIds.size)}
      data-offers-count={String(result.offersByRequest.size)}
    />
  );
}

describe('useRequestsExplorerRequestsData', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('skips auth-only private subscriptions in providers view', () => {
    useQueryClientMock.mockReturnValue({} as never);
    useQueryMock.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      isError: false,
    } as never);
    useQueriesMock.mockReturnValue([] as never);

    render(<Probe isProvidersView isAuthed />);

    const privateQueryArgs = useQueriesMock.mock.calls[0]?.[0] as { queries: unknown[] };
    expect(privateQueryArgs.queries).toEqual([]);
  });

  it('subscribes to my offers and favorite requests in requests view for authed users', () => {
    useQueryClientMock.mockReturnValue({} as never);
    useQueryMock.mockReturnValue({
      data: { items: [{ id: 'req-1' }], total: 1 },
      isLoading: false,
      isError: false,
    } as never);
    useQueriesMock.mockReturnValue([
      { data: [{ id: 'offer-1', requestId: 'req-1' }], isLoading: false },
      { data: [{ id: 'req-1' }], isLoading: false },
    ] as never);

    render(<Probe isProvidersView={false} isAuthed />);

    const privateQueryArgs = useQueriesMock.mock.calls[0]?.[0] as {
      queries: Array<{ queryKey: readonly unknown[] }>;
    };

    expect(privateQueryArgs.queries.map((query) => query.queryKey)).toEqual([
      ['offers-my'],
      ['favorite-requests'],
    ]);

    const node = screen.getByTestId('requests-explorer-data');
    expect(node.getAttribute('data-requests-count')).toBe('1');
    expect(node.getAttribute('data-favorites-count')).toBe('1');
    expect(node.getAttribute('data-offers-count')).toBe('1');
  });
});
