/** @vitest-environment happy-dom */
import * as React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { useWorkspaceActions } from '@/features/workspace/private/useWorkspaceActions';
import { createConversation } from '@/lib/api/chat';
import { deleteOffer } from '@/lib/api/offers';
import { duplicateMyRequest, publishMyRequest, unpublishMyRequest } from '@/lib/api/requests';
import { I18N_KEYS } from '@/lib/i18n/keys';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

vi.mock('@/lib/api/requests', () => ({
  archiveMyRequest: vi.fn(),
  deleteMyRequest: vi.fn(),
  duplicateMyRequest: vi.fn(),
  publishMyRequest: vi.fn(),
  unpublishMyRequest: vi.fn(),
}));

vi.mock('@/lib/api/chat', () => ({
  createConversation: vi.fn(),
}));

vi.mock('@/lib/api/offers', () => ({
  deleteOffer: vi.fn(),
}));

function UseWorkspaceActionsProbe() {
  const actions = useWorkspaceActions({
    isAuthed: true,
    t: (key) => String(key),
    qc: {
      invalidateQueries: invalidateQueriesSpy,
    } as never,
    router: {
      push: pushSpy,
    },
  });

  return (
    <>
      <button
        type="button"
        data-testid="duplicate"
        onClick={() => actions.ownerRequestActions.onDuplicate('req-1')}
      >
        duplicate
      </button>
      <button
        type="button"
        data-testid="publish"
        onClick={() => actions.ownerRequestActions.onPublish?.('req-1')}
      >
        publish
      </button>
      <button
        type="button"
        data-testid="unpublish"
        onClick={() => actions.ownerRequestActions.onUnpublish?.('req-1')}
      >
        unpublish
      </button>
      <button
        type="button"
        data-testid="chat-thread"
        onClick={() => actions.onOpenChatThread({ id: 'offer-1', requestId: 'req-1', providerUserId: 'provider-1' } as never)}
      >
        chat-thread
      </button>
      <button
        type="button"
        data-testid="chat-missing"
        onClick={() => actions.onOpenChatThread({ id: 'offer-missing', requestId: 'req-2' } as never)}
      >
        chat-missing
      </button>
      <button
        type="button"
        data-testid="chat-invalid"
        onClick={() => actions.onOpenChatConversation({ relatedEntity: { type: 'offer', id: '' } } as never)}
      >
        chat-invalid
      </button>
      <button
        type="button"
        data-testid="withdraw-with-request-id"
        onClick={() => actions.onWithdrawOffer('offer-unknown', 'req-explicit')}
      >
        withdraw-with-request-id
      </button>
    </>
  );
}

const duplicateMyRequestMock = vi.mocked(duplicateMyRequest);
const publishMyRequestMock = vi.mocked(publishMyRequest);
const unpublishMyRequestMock = vi.mocked(unpublishMyRequest);
const createConversationMock = vi.mocked(createConversation);
const deleteOfferMock = vi.mocked(deleteOffer);
const toastSuccessMock = vi.mocked(toast.success);
const toastMessageMock = vi.mocked(toast.message);
const toastErrorMock = vi.mocked(toast.error);
const invalidateQueriesSpy = vi.fn().mockResolvedValue(undefined);
const pushSpy = vi.fn();

describe('useWorkspaceActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateQueriesSpy.mockResolvedValue(undefined);
    duplicateMyRequestMock.mockResolvedValue({ id: 'dup-1' } as never);
    publishMyRequestMock.mockResolvedValue({ id: 'req-1' } as never);
    unpublishMyRequestMock.mockResolvedValue({ id: 'req-1' } as never);
    createConversationMock.mockResolvedValue({ id: 'conv-1' } as never);
    deleteOfferMock.mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('duplicates requests without leaving the workspace flow', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('duplicate').click();
    });

    await waitFor(() => {
      expect(duplicateMyRequestMock).toHaveBeenCalledWith('req-1');
      expect(pushSpy).not.toHaveBeenCalled();
    });
  });

  it('refreshes public request feeds after publishing inside workspace', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('publish').click();
    });

    await waitFor(() => {
      expect(publishMyRequestMock).toHaveBeenCalledWith('req-1');
      expect(toastSuccessMock).toHaveBeenCalledWith(I18N_KEYS.client.requestPublished);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['requests-explorer-public'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['workspace-public-overview'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['home-nearby-requests'] });
    });
  });

  it('uses the unpublish toast and refreshes request caches after unpublishing', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('unpublish').click();
    });

    await waitFor(() => {
      expect(unpublishMyRequestMock).toHaveBeenCalledWith('req-1');
      expect(toastSuccessMock).toHaveBeenCalledWith(I18N_KEYS.client.requestUnpublished);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['requests-my'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['favorite-requests'] });
    });
  });

  it('opens contextual chat conversations instead of routing to generic inbox', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('chat-thread').click();
    });

    await waitFor(() => {
      expect(createConversationMock).toHaveBeenCalledWith(
        expect.objectContaining({
          participantUserId: 'provider-1',
          requestId: 'req-1',
          offerId: 'offer-1',
        }),
      );
      expect(pushSpy).toHaveBeenCalledWith('/chat?conversation=conv-1');
    });
  });

  it('does not route to generic inbox when chat context is missing or invalid', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('chat-missing').click();
      screen.getByTestId('chat-invalid').click();
    });

    await waitFor(() => {
      expect(toastMessageMock).toHaveBeenCalledWith(I18N_KEYS.requestDetails.chatSoon);
      expect(createConversationMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'req-2' }),
      );
      expect(pushSpy).not.toHaveBeenCalledWith('/chat');
    });
  });

  it('stays in place when contextual chat creation fails', async () => {
    createConversationMock.mockRejectedValueOnce(new Error('boom'));
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('chat-thread').click();
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('boom');
      expect(pushSpy).not.toHaveBeenCalledWith('/chat');
    });
  });

  it('withdraws an offer when request id is provided directly by the UI contract', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('withdraw-with-request-id').click();
    });

    await waitFor(() => {
      expect(deleteOfferMock).toHaveBeenCalledWith('offer-unknown');
      expect(toastSuccessMock).toHaveBeenCalledWith(I18N_KEYS.requestDetails.responseCancelled);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['offers-my'] });
    });
  });
});
