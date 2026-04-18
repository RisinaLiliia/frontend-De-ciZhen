/** @vitest-environment happy-dom */

import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import {
  useWorkspaceProviderOfferSheetData,
  useWorkspaceRequestDecisionData,
  useWorkspaceRequestOffersData,
} from '@/features/workspace/requests/useWorkspaceRequestOverlayData';

vi.mock('@/features/workspace/requests/useWorkspaceRequestOverlayActions', () => ({
  fetchWorkspaceManagedRequest: vi.fn(),
}));

vi.mock('@/lib/api/offers', () => ({
  listOffersByRequest: vi.fn(),
  listMyProviderOffers: vi.fn(),
}));

vi.mock('@/lib/api/contracts', () => ({
  listMyContracts: vi.fn(),
}));

vi.mock('@/lib/api/withStatusFallback', () => ({
  withStatusFallback: (fn: () => Promise<unknown>) => fn(),
}));

import { fetchWorkspaceManagedRequest } from '@/features/workspace/requests/useWorkspaceRequestOverlayActions';
import { listMyContracts } from '@/lib/api/contracts';
import { listMyProviderOffers, listOffersByRequest } from '@/lib/api/offers';

const fetchWorkspaceManagedRequestMock = vi.mocked(fetchWorkspaceManagedRequest);
const listOffersByRequestMock = vi.mocked(listOffersByRequest);
const listMyProviderOffersMock = vi.mocked(listMyProviderOffers);
const listMyContractsMock = vi.mocked(listMyContracts);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });
}

function renderWithQueryClient(node: React.ReactNode) {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      {node}
    </QueryClientProvider>,
  );
}

function OffersProbe() {
  const state = useWorkspaceRequestOffersData('req-1');

  return (
    <div
      data-testid="offers-state"
      data-loading={String(state.isLoading)}
      data-accepted-offer-id={state.acceptedOfferId ?? ''}
      data-actionable-count={String(state.actionableOffers.length)}
      data-first-actionable-id={state.actionableOffers[0]?.id ?? ''}
    />
  );
}

function DecisionProbe() {
  const card = {
    requestId: 'req-1',
    status: {
      actions: [],
    },
    decision: {
      primaryAction: {
        kind: 'open_chat',
        label: 'Zum Chat',
        chatInput: {
          participantUserId: 'provider-1',
          participantRole: 'provider',
          requestId: 'req-1',
        },
      },
    },
  } as unknown as MyRequestsViewCard;

  const state = useWorkspaceRequestDecisionData({
    card,
    locale: 'de',
  });

  return (
    <div
      data-testid="decision-state"
      data-contract-id={state.contract?.id ?? ''}
      data-contract-meta={state.contractMeta}
      data-chat-label={state.chatLabel}
      data-chat-user={state.chatInput?.participantUserId ?? ''}
    />
  );
}

function ProviderOfferSheetProbe() {
  const state = useWorkspaceProviderOfferSheetData({
    locale: 'de',
    requestId: 'req-1',
  });

  return (
    <div
      data-testid="provider-offer-state"
      data-loading={String(state.isLoading)}
      data-request-id={state.request?.id ?? ''}
      data-existing-offer-id={state.existingResponse?.id ?? ''}
    />
  );
}

describe('useWorkspaceRequestOverlayData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchWorkspaceManagedRequestMock.mockResolvedValue({
      request: {
        id: 'req-1',
        title: 'WC reparieren',
        cityName: 'Berlin',
        preferredDate: '2026-04-20T10:00:00.000Z',
        price: 120,
      },
      source: 'owner',
    } as never);
    listOffersByRequestMock.mockResolvedValue([
      {
        id: 'offer-accepted',
        requestId: 'req-1',
        status: 'accepted',
      },
      {
        id: 'offer-active',
        requestId: 'req-1',
        status: 'sent',
      },
      {
        id: 'offer-withdrawn',
        requestId: 'req-1',
        status: 'withdrawn',
      },
    ] as never);
    listMyContractsMock.mockResolvedValue([
      {
        id: 'contract-1',
        requestId: 'req-1',
        status: 'confirmed',
        priceAmount: 210,
      },
    ] as never);
    listMyProviderOffersMock.mockResolvedValue([
      {
        id: 'offer-mine',
        requestId: 'req-1',
        amount: 140,
        message: 'Ich kann morgen kommen',
      },
    ] as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('derives actionable request offers and accepted offer id from query data', async () => {
    renderWithQueryClient(<OffersProbe />);

    await waitFor(() => {
      const node = screen.getByTestId('offers-state');
      expect(node.getAttribute('data-accepted-offer-id')).toBe('offer-accepted');
      expect(node.getAttribute('data-actionable-count')).toBe('2');
      expect(node.getAttribute('data-first-actionable-id')).toBe('offer-accepted');
    });
  });

  it('builds decision data with contract meta and chat fallback from primary action', async () => {
    renderWithQueryClient(<DecisionProbe />);

    await waitFor(() => {
      const node = screen.getByTestId('decision-state');
      expect(node.getAttribute('data-contract-id')).toBe('contract-1');
      expect(node.getAttribute('data-contract-meta')).toContain('210');
      expect(node.getAttribute('data-contract-meta')).toContain('Bestätigt');
      expect(node.getAttribute('data-chat-label')).toBe('Zum Chat');
      expect(node.getAttribute('data-chat-user')).toBe('provider-1');
    });
  });

  it('combines managed request detail with provider offer response state', async () => {
    renderWithQueryClient(<ProviderOfferSheetProbe />);

    await waitFor(() => {
      const node = screen.getByTestId('provider-offer-state');
      expect(node.getAttribute('data-request-id')).toBe('req-1');
      expect(node.getAttribute('data-existing-offer-id')).toBe('offer-mine');
    });
  });
});
