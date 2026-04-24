/** @vitest-environment happy-dom */

import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  fetchWorkspaceManagedRequest,
  useWorkspaceCompletionReviewActions,
  useWorkspaceProviderOfferSheetActions,
  useWorkspaceRequestDecisionActions,
  useWorkspaceRequestOfferActions,
} from '@/features/workspace/requests/useWorkspaceRequestOverlayActions';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import { ApiError } from '@/lib/api/http-error';

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  message: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast,
}));

vi.mock('@/lib/i18n/useT', () => ({
  useT: () => (key: string) => key,
}));

vi.mock('@/lib/api/requests', () => ({
  getMyRequestById: vi.fn(),
  getPublicRequestById: vi.fn(),
  listMyRequests: vi.fn(),
}));

vi.mock('@/lib/api/offers', () => ({
  acceptOffer: vi.fn(),
  declineOffer: vi.fn(),
  createOffer: vi.fn(),
  updateOffer: vi.fn(),
  deleteOffer: vi.fn(),
}));

vi.mock('@/lib/api/contracts', () => ({
  confirmContract: vi.fn(),
  completeContract: vi.fn(),
}));

vi.mock('@/lib/api/reviews', () => ({
  createProviderReview: vi.fn(),
}));

import { completeContract, confirmContract } from '@/lib/api/contracts';
import {
  acceptOffer,
  createOffer,
  deleteOffer,
} from '@/lib/api/offers';
import { createProviderReview } from '@/lib/api/reviews';
import { getMyRequestById, getPublicRequestById, listMyRequests } from '@/lib/api/requests';

const getMyRequestByIdMock = vi.mocked(getMyRequestById);
const getPublicRequestByIdMock = vi.mocked(getPublicRequestById);
const listMyRequestsMock = vi.mocked(listMyRequests);
const acceptOfferMock = vi.mocked(acceptOffer);
const createOfferMock = vi.mocked(createOffer);
const deleteOfferMock = vi.mocked(deleteOffer);
const confirmContractMock = vi.mocked(confirmContract);
const completeContractMock = vi.mocked(completeContract);
const createProviderReviewMock = vi.mocked(createProviderReview);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
}

function renderWithClient(node: React.ReactNode, queryClient = createQueryClient()) {
  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        {node}
      </QueryClientProvider>,
    ),
    queryClient,
  };
}

function OfferActionsProbe() {
  const state = useWorkspaceRequestOfferActions({
    locale: 'de',
    requestId: 'req-1',
  });

  return (
    <>
      <button type="button" onClick={() => void state.acceptRequestOffer('offer-1')}>
        accept
      </button>
      <div data-testid="pending-offer">{state.pendingOfferActionId ?? ''}</div>
    </>
  );
}

function DecisionActionsProbe() {
  const state = useWorkspaceRequestDecisionActions({
    locale: 'de',
    requestId: 'req-1',
  });

  return (
    <>
      <button
        type="button"
        onClick={() => void state.confirmRequestContract({
          contractId: 'contract-1',
          startAt: '2026-04-18T10:30',
          durationMin: '90',
          note: 'Werkzeug mitbringen',
        })}
      >
        confirm
      </button>
      <button
        type="button"
        onClick={() => void state.completeRequestContract('contract-1')}
      >
        complete
      </button>
      <div data-testid="pending-decision">{String(state.isSubmittingDecision)}</div>
    </>
  );
}

function ProviderOfferActionsProbe({
  request,
  existingResponse,
  onClose,
  onResetDraft,
}: {
  request: { id: string } | null;
  existingResponse: { id: string } | null;
  onClose: () => void;
  onResetDraft: () => void;
}) {
  const state = useWorkspaceProviderOfferSheetActions({
    onClose,
    onResetDraft,
    request,
    requestId: 'req-1',
    existingResponse,
  });
  const [result, setResult] = React.useState('');

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void state.submitProviderOffer({
            amountValue: '150',
            commentValue: 'Ich bin bereit',
            availabilityValue: 'Morgen 10 Uhr',
          }).then((value) => setResult(value));
        }}
      >
        submit
      </button>
      <button type="button" onClick={() => void state.cancelProviderOffer()}>
        cancel
      </button>
      <div data-testid="submit-result">{result}</div>
      <div data-testid="pending-provider">{String(state.isSubmittingOffer)}</div>
    </>
  );
}

function CompletionReviewProbe() {
  const state = useWorkspaceCompletionReviewActions({
    locale: 'de',
  });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void state.submitCompletionReview({
            bookingId: 'booking-1',
            rating: 5,
            text: 'Sehr gut',
          });
        }}
      >
        review
      </button>
      <div data-testid="pending-review">{String(state.isSubmittingReview)}</div>
    </>
  );
}

describe('useWorkspaceRequestOverlayActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listMyRequestsMock.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  it('falls back to public request endpoint when owner request returns 403', async () => {
    getMyRequestByIdMock.mockRejectedValueOnce(new ApiError('forbidden', 403));
    getPublicRequestByIdMock.mockResolvedValueOnce({
      id: 'req-1',
      title: 'Öffentliche Anfrage',
    } as never);

    const result = await fetchWorkspaceManagedRequest({
      requestId: 'req-1',
      locale: 'de',
      qc: createQueryClient(),
      attemptOwner: true,
    });

    expect(getMyRequestByIdMock).toHaveBeenCalledWith('req-1');
    expect(getPublicRequestByIdMock).toHaveBeenCalledWith('req-1', { locale: 'de' });
    expect(result.source).toBe('public');
    expect(result.request.id).toBe('req-1');
  });

  it('uses cached owner request for edit intent instead of calling public endpoint', async () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(['requests-my'], [{
      id: 'req-1',
      title: 'Cached owner request',
      serviceKey: 'home_cleaning',
      cityId: 'c1',
      propertyType: 'apartment',
      area: 55,
      preferredDate: '2026-04-22T10:00:00.000Z',
      isRecurring: false,
      status: 'draft',
      createdAt: '2026-04-17T10:00:00.000Z',
      clientId: 'u1',
    }]);
    getMyRequestByIdMock.mockRejectedValueOnce(new ApiError('forbidden', 404));

    const result = await fetchWorkspaceManagedRequest({
      requestId: 'req-1',
      locale: 'de',
      qc: queryClient,
      attemptOwner: true,
      preferOwner: true,
    });

    expect(getMyRequestByIdMock).toHaveBeenCalledWith('req-1');
    expect(getPublicRequestByIdMock).not.toHaveBeenCalled();
    expect(result.source).toBe('owner');
    expect(result.request.title).toBe('Cached owner request');
  });

  it('falls back to backend my-requests list when owner detail endpoint returns 404', async () => {
    getMyRequestByIdMock.mockRejectedValueOnce(new ApiError('missing', 404));
    listMyRequestsMock.mockResolvedValueOnce([
      {
        id: 'req-1',
        title: 'Owner request from list',
        serviceKey: 'home_cleaning',
        cityId: 'c1',
        propertyType: 'apartment',
        area: 55,
        preferredDate: '2026-04-22T10:00:00.000Z',
        isRecurring: false,
        status: 'published',
        createdAt: '2026-04-17T10:00:00.000Z',
      },
    ] as never);

    const result = await fetchWorkspaceManagedRequest({
      requestId: 'req-1',
      locale: 'de',
      qc: createQueryClient(),
      attemptOwner: true,
    });

    expect(getMyRequestByIdMock).toHaveBeenCalledWith('req-1');
    expect(listMyRequestsMock).toHaveBeenCalledTimes(1);
    expect(getPublicRequestByIdMock).not.toHaveBeenCalled();
    expect(result.source).toBe('owner');
    expect(result.request.title).toBe('Owner request from list');
  });

  it('loads public request directly when owner attempt is disabled', async () => {
    getPublicRequestByIdMock.mockResolvedValueOnce({
      id: 'req-1',
      title: 'Öffentliche Anfrage',
    } as never);

    const result = await fetchWorkspaceManagedRequest({
      requestId: 'req-1',
      locale: 'de',
      qc: createQueryClient(),
      attemptOwner: false,
    });

    expect(getMyRequestByIdMock).not.toHaveBeenCalled();
    expect(getPublicRequestByIdMock).toHaveBeenCalledWith('req-1', { locale: 'de' });
    expect(result.source).toBe('public');
  });

  it('accepts an offer, tracks pending state, and invalidates workspace offer queries', async () => {
    const acceptDeferred = deferred<unknown>();
    acceptOfferMock.mockReturnValueOnce(acceptDeferred.promise as never);

    const { queryClient } = renderWithClient(<OfferActionsProbe />);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    fireEvent.click(screen.getByText('accept'));

    await waitFor(() => {
      expect(screen.getByTestId('pending-offer').textContent).toBe('offer-1');
    });

    acceptDeferred.resolve({});

    await waitFor(() => {
      expect(screen.getByTestId('pending-offer').textContent).toBe('');
    });

    expect(acceptOfferMock).toHaveBeenCalledWith('offer-1');
    expect(toast.success).toHaveBeenCalledWith('Angebot angenommen.');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspace-request-offers', 'req-1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: workspaceQK.contractsMyClient() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: workspaceQK.requestsMy() });
  });

  it('confirms a contract with serialized payload and clears submitting state', async () => {
    const confirmDeferred = deferred<unknown>();
    confirmContractMock.mockReturnValueOnce(confirmDeferred.promise as never);

    const { queryClient } = renderWithClient(<DecisionActionsProbe />);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(screen.getByTestId('pending-decision').textContent).toBe('true');
    });

    confirmDeferred.resolve({});

    await waitFor(() => {
      expect(screen.getByTestId('pending-decision').textContent).toBe('false');
    });

    expect(confirmContractMock).toHaveBeenCalledWith('contract-1', {
      startAt: new Date('2026-04-18T10:30').toISOString(),
      durationMin: 90,
      note: 'Werkzeug mitbringen',
    });
    expect(toast.success).toHaveBeenCalledWith('Vertrag bestätigt.');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: workspaceQK.contractsMyClient() });
  });

  it('creates a provider offer and returns created result', async () => {
    createOfferMock.mockResolvedValueOnce({ id: 'offer-1' } as never);
    const onClose = vi.fn();
    const onResetDraft = vi.fn();

    renderWithClient(
      <ProviderOfferActionsProbe
        request={{ id: 'req-1' }}
        existingResponse={null}
        onClose={onClose}
        onResetDraft={onResetDraft}
      />,
    );

    fireEvent.click(screen.getByText('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('submit-result').textContent).toBe('created');
    });

    expect(createOfferMock).toHaveBeenCalledWith({
      requestId: 'req-1',
      amount: 150,
      message: 'Ich bin bereit',
      availabilityNote: 'Morgen 10 Uhr',
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('resets draft and closes immediately when cancelling a new provider offer', async () => {
    const onClose = vi.fn();
    const onResetDraft = vi.fn();

    renderWithClient(
      <ProviderOfferActionsProbe
        request={{ id: 'req-1' }}
        existingResponse={null}
        onClose={onClose}
        onResetDraft={onResetDraft}
      />,
    );

    fireEvent.click(screen.getByText('cancel'));

    await waitFor(() => {
      expect(onResetDraft).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    expect(deleteOfferMock).not.toHaveBeenCalled();
  });

  it('completes a contract and invalidates decision queries', async () => {
    completeContractMock.mockResolvedValueOnce({} as never);

    const { queryClient } = renderWithClient(<DecisionActionsProbe />);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    fireEvent.click(screen.getByText('complete'));

    await waitFor(() => {
      expect(completeContractMock).toHaveBeenCalledWith('contract-1');
    });

    expect(toast.success).toHaveBeenCalledWith('Abschluss bestätigt.');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspace-private-overview'] });
  });

  it('submits provider review after completion and invalidates review queries', async () => {
    createProviderReviewMock.mockResolvedValueOnce({ id: 'review-1' } as never);

    const { queryClient } = renderWithClient(<CompletionReviewProbe />);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    fireEvent.click(screen.getByText('review'));

    await waitFor(() => {
      expect(createProviderReviewMock).toHaveBeenCalledWith({
        bookingId: 'booking-1',
        rating: 5,
        text: 'Sehr gut',
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reviews-my'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['bookings-my-reviewable'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: workspaceQK.contractsMyClient() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: workspaceQK.requestsMy() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspace-requests'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspace-private-overview'] });
  });
});
