/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import { useWorkspaceContractData } from './useWorkspaceContractData';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const useQueryMock = vi.mocked(useQuery);

function Probe({ includePublicSummary = true }: { includePublicSummary?: boolean }) {
  const result = useWorkspaceContractData({
    includePublicSummary,
    workspaceDataQueries: {
      publicOverview: {
        queryKey: ['workspace-public-overview'],
        enabled: true,
        queryFn: vi.fn(),
      },
      publicSummary: {
        queryKey: ['workspace-public-summary', 1],
        enabled: true,
        queryFn: vi.fn(),
      },
      privateOverview: {
        queryKey: ['workspace-private-overview'],
        enabled: false,
        queryFn: vi.fn(),
      },
      workspaceRequests: {
        queryKey: ['workspace-requests'],
        enabled: false,
        queryFn: vi.fn(),
      },
    } as never,
  });

  return (
    <div
      data-testid="contract-data"
      data-has-summary={String(Boolean(result.allRequestsSummary))}
      data-summary-loading={String(result.isPublicSummaryLoading)}
    />
  );
}

describe('useWorkspaceContractData', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('disables the public summary query when explicitly excluded', () => {
    useQueryMock
      .mockReturnValueOnce({ data: undefined, isLoading: false, isError: false } as never)
      .mockReturnValueOnce({ data: undefined, isLoading: false, isError: false } as never)
      .mockReturnValueOnce({ data: null, isLoading: false } as never)
      .mockReturnValueOnce({ data: null, isLoading: false, isError: false } as never);

    render(<Probe includePublicSummary={false} />);

    const summaryQueryArgs = useQueryMock.mock.calls[1]?.[0] as unknown as {
      enabled?: boolean;
      queryFn: () => Promise<null>;
    };
    expect(summaryQueryArgs.enabled).toBe(false);
    expect(screen.getByTestId('contract-data').getAttribute('data-has-summary')).toBe('false');
  });
});
