/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useQueries } from '@tanstack/react-query';

import { useWorkspaceLegacyProviderSupportData } from './useWorkspaceLegacyProviderSupportData';

vi.mock('@tanstack/react-query', () => ({
  useQueries: vi.fn(),
}));

const useQueriesMock = vi.mocked(useQueries);

function Probe() {
  const result = useWorkspaceLegacyProviderSupportData({
    workspaceDataQueries: {
      favoriteProviders: {
        queryKey: ['favorite-providers'],
        enabled: false,
        queryFn: vi.fn(),
      },
      providers: {
        queryKey: ['providers-public'],
        enabled: true,
        queryFn: vi.fn(),
        staleTime: 30_000,
        gcTime: 300_000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      },
    } as never,
  });

  return (
    <div
      data-testid="legacy-provider-support"
      data-providers-count={String(result.providers.length)}
      data-favorite-providers-count={String(result.favoriteProviders.length)}
      data-providers-error={String(result.isProvidersError)}
    />
  );
}

describe('useWorkspaceLegacyProviderSupportData', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('subscribes only to enabled legacy provider queries', () => {
    useQueriesMock.mockReturnValue([
      { data: [{ id: 'provider-1' }], isLoading: false, isError: false },
    ] as never);

    render(<Probe />);

    const queryArgs = useQueriesMock.mock.calls[0]?.[0] as {
      queries: Array<{ queryKey: readonly unknown[] }>;
    };

    expect(queryArgs.queries.map((query) => query.queryKey)).toEqual([
      ['providers-public'],
    ]);

    const node = screen.getByTestId('legacy-provider-support');
    expect(node.getAttribute('data-providers-count')).toBe('1');
    expect(node.getAttribute('data-favorite-providers-count')).toBe('0');
    expect(node.getAttribute('data-providers-error')).toBe('false');
  });
});
