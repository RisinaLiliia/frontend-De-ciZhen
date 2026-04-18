/** @vitest-environment happy-dom */
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRequestDetailsPageData } from '@/features/requests/details/useRequestDetailsPageData';
import { getMyRequestById, getPublicRequestById } from '@/lib/api/requests';
import { useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';

vi.mock('@/lib/api/requests', () => ({
  getMyRequestById: vi.fn(),
  getPublicRequestById: vi.fn(),
}));

vi.mock('@/lib/api/offers', () => ({
  listMyProviderOffers: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/api/favorites', () => ({
  listFavorites: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/api/providers', () => ({
  getMyProviderProfile: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/api/withStatusFallback', () => ({
  withStatusFallback: (fn: () => Promise<unknown>) => fn(),
}));

vi.mock('@/hooks/useFavoriteToggles', () => ({
  useRequestFavoriteToggle: vi.fn(),
}));

const getMyRequestByIdMock = vi.mocked(getMyRequestById);
const getPublicRequestByIdMock = vi.mocked(getPublicRequestById);
const useRequestFavoriteToggleMock = vi.mocked(useRequestFavoriteToggle);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function Probe() {
  const result = useRequestDetailsPageData({
    t: (key) => String(key),
    locale: 'de',
    requestId: 'req-1',
    isHydrated: true,
    authStatus: 'authenticated',
    isAuthed: true,
    pathname: '/requests/req-1',
    searchParams: null,
    router: { push: vi.fn() },
    qc: createQueryClient(),
  });

  return (
    <div
      data-testid="state"
      data-loading={String(result.isLoading)}
      data-request-status={result.request?.status ?? ''}
    />
  );
}

describe('useRequestDetailsPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRequestFavoriteToggleMock.mockReturnValue({
      pendingFavoriteRequestIds: new Set(),
      toggleRequestFavorite: vi.fn(),
    } as never);
    getMyRequestByIdMock.mockResolvedValue({
      id: 'req-1',
      title: 'Draft request',
      serviceKey: 'home_cleaning',
      cityId: 'c1',
      propertyType: 'apartment',
      area: 55,
      preferredDate: '2026-04-22T10:00:00.000Z',
      isRecurring: false,
      status: 'draft',
      createdAt: '2026-04-17T10:00:00.000Z',
      clientId: 'u1',
    } as never);
    getPublicRequestByIdMock.mockResolvedValue({
      id: 'req-1',
      title: 'Published request',
      serviceKey: 'home_cleaning',
      cityId: 'c1',
      propertyType: 'apartment',
      area: 55,
      preferredDate: '2026-04-22T10:00:00.000Z',
      isRecurring: false,
      status: 'published',
      createdAt: '2026-04-17T10:00:00.000Z',
    } as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('loads owner drafts from my-request endpoint before falling back to public', async () => {
    const queryClient = createQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Probe />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('state').getAttribute('data-request-status')).toBe('draft');
    });

    expect(getMyRequestByIdMock).toHaveBeenCalledWith('req-1');
    expect(getPublicRequestByIdMock).not.toHaveBeenCalled();
  });
});
