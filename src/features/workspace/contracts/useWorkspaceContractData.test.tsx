/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import { useWorkspaceContractData } from './useWorkspaceContractData';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const useQueryMock = vi.mocked(useQuery);

function Probe({ summaryEnabled = true }: { summaryEnabled?: boolean }) {
  const result = useWorkspaceContractData({
    workspaceDataQueries: {
      publicSummary: {
        queryKey: ['workspace-public-summary', 1],
        enabled: summaryEnabled,
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
      data-has-workspace-requests={String(Boolean(result.workspaceRequests))}
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
      .mockReturnValueOnce({ data: null, isLoading: false } as never)
      .mockReturnValueOnce({ data: null, isLoading: false, isError: false } as never);

    render(<Probe summaryEnabled={false} />);

    const summaryQueryArgs = useQueryMock.mock.calls[0]?.[0] as unknown as {
      enabled?: boolean;
    };
    expect(summaryQueryArgs.enabled).toBe(false);
    expect(screen.getByTestId('contract-data').getAttribute('data-has-summary')).toBe('false');
  });

  it('returns workspace requests data without a private fallback layer', () => {
    useQueryMock
      .mockReturnValueOnce({ data: undefined, isLoading: false, isError: false } as never)
      .mockReturnValueOnce({ data: null, isLoading: true } as never)
      .mockReturnValueOnce({ data: { list: { items: [] } }, isLoading: false, isError: false } as never);

    render(<Probe />);

    expect(screen.getByTestId('contract-data').getAttribute('data-has-workspace-requests')).toBe('true');
  });
});
