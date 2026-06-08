/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { useWorkspaceRequestUserStateData } from './useWorkspaceRequestUserStateData';
import { useWorkspaceLegacyOfferData } from './useWorkspaceLegacyOfferData';
import { useWorkspaceFavoriteRequestData } from './useWorkspaceFavoriteRequestData';

vi.mock('./useWorkspaceLegacyOfferData', () => ({
  useWorkspaceLegacyOfferData: vi.fn(),
}));

vi.mock('./useWorkspaceFavoriteRequestData', () => ({
  useWorkspaceFavoriteRequestData: vi.fn(),
}));

const useWorkspaceLegacyOfferDataMock = vi.mocked(useWorkspaceLegacyOfferData);
const useWorkspaceFavoriteRequestDataMock = vi.mocked(useWorkspaceFavoriteRequestData);

function Probe() {
  const result = useWorkspaceRequestUserStateData({
    workspaceRequestUserStateQueries: {} as never,
    locale: 'de',
    shouldLoadOfferRequests: false,
  });

  return (
    <div
      data-testid="request-user-state"
      data-offers-count={String(result.myOffers.length)}
      data-favorites-count={String(result.favoriteRequests.length)}
    />
  );
}

describe('useWorkspaceRequestUserStateData', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('combines offer and favorite-request user state into a dedicated slice', () => {
    useWorkspaceLegacyOfferDataMock.mockReturnValue({
      myOffers: [{ id: 'offer-1', requestId: 'req-1' }],
      isMyOffersLoading: false,
      myOfferRequestsById: new Map(),
      isMyOfferRequestsLoading: false,
    } as never);
    useWorkspaceFavoriteRequestDataMock.mockReturnValue({
      favoriteRequests: [{ id: 'req-1' }],
      isFavoriteRequestsLoading: false,
    } as never);

    render(<Probe />);

    const node = screen.getByTestId('request-user-state');
    expect(node.getAttribute('data-offers-count')).toBe('1');
    expect(node.getAttribute('data-favorites-count')).toBe('1');
  });
});
