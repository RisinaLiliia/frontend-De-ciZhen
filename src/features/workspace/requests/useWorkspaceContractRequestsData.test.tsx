/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import { useWorkspaceContractRequestsData } from './useWorkspaceContractRequestsData';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const useQueryMock = vi.mocked(useQuery);

function Probe() {
  const result = useWorkspaceContractRequestsData({
    enabled: true,
    isWorkspaceAuthed: true,
    locale: 'de',
    filteredContracts: [
      {
        id: 'contract-1',
        requestId: 'req-1',
        offerId: 'offer-1',
        providerUserId: 'provider-1',
        clientId: 'client-1',
        status: 'active',
        priceAmount: 120,
        priceType: 'fixed',
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-02T10:00:00.000Z',
      },
    ] as never,
  });

  return (
    <div
      data-testid="contract-requests"
      data-requests-count={String(result.contractRequests.length)}
      data-offers-count={String(result.contractOffersByRequest.size)}
    />
  );
}

describe('useWorkspaceContractRequestsData', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('does not synthesize fallback request cards when the backend batch does not return a matching request', () => {
    useQueryMock.mockReturnValue({
      data: new Map(),
    } as never);

    render(<Probe />);

    const node = screen.getByTestId('contract-requests');
    expect(node.getAttribute('data-requests-count')).toBe('0');
    expect(node.getAttribute('data-offers-count')).toBe('1');
  });
});
