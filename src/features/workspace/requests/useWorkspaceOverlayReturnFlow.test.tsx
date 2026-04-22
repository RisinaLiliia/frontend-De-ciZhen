/** @vitest-environment happy-dom */

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWorkspacePublicRequestOverlayFlow } from '@/features/workspace/requests/useWorkspacePublicRequestOverlayFlow';
import { useWorkspaceRequestOverlayFlow } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';

vi.mock('@/lib/i18n/useT', () => ({
  useT: () => ((key: string) => key),
}));

vi.mock('@/lib/api/chat', () => ({
  createConversation: vi.fn(),
}));

import { createConversation } from '@/lib/api/chat';

const createConversationMock = vi.mocked(createConversation);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithClient(node: React.ReactNode) {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      {node}
    </QueryClientProvider>,
  );
}

function PublicFlowProbe() {
  const flow = useWorkspacePublicRequestOverlayFlow({
    locale: 'de',
    requests: [{ id: 'req-1', title: 'Anfrage 1' }] as never[],
  });

  return (
    <>
      <button type="button" onClick={() => flow.openRequest('req-1', 'view')}>open-request</button>
      <button type="button" onClick={() => flow.openOfferSheet('req-1')}>open-offer</button>
      <button type="button" onClick={flow.closeOfferSheet}>close-offer</button>
      <div
        data-testid="public-flow-state"
        data-request-id={flow.activeRequestState?.requestId ?? ''}
        data-offer-id={flow.activeOfferRequestId ?? ''}
      />
    </>
  );
}

function PrivateFlowProbe() {
  const flow = useWorkspaceRequestOverlayFlow({
    locale: 'de',
    cards: [{
      requestId: 'req-1',
      requestPreview: { title: 'Anfrage 1' },
    }] as unknown as MyRequestsViewCard[],
    listContext: {},
  });

  return (
    <>
      <button type="button" onClick={() => flow.openRequest('req-1', 'view')}>open-request</button>
      <button type="button" onClick={() => flow.openOfferSheet('req-1')}>open-offer</button>
      <button type="button" onClick={flow.closeOfferSheet}>close-offer</button>
      <button
        type="button"
        onClick={() => {
          void flow.openChatConversation({
            relatedEntity: { type: 'request', id: 'req-1' },
            participantUserId: 'provider-1',
            participantRole: 'provider',
            requestId: 'req-1',
          });
        }}
      >
        open-chat
      </button>
      <button type="button" onClick={flow.closeChat}>close-chat</button>
      <div
        data-testid="private-flow-state"
        data-request-id={flow.activeRequestState?.requestId ?? ''}
        data-offer-id={flow.activeOfferRequestId ?? ''}
        data-chat-id={flow.activeChatState?.conversationId ?? ''}
      />
    </>
  );
}

describe('workspace overlay return flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createConversationMock.mockResolvedValue({ id: 'conversation-1' } as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('returns to public request detail after closing offer sheet opened from the dialog', () => {
    renderWithClient(<PublicFlowProbe />);

    fireEvent.click(screen.getByText('open-request'));
    fireEvent.click(screen.getByText('open-offer'));

    expect(screen.getByTestId('public-flow-state').getAttribute('data-request-id')).toBe('');
    expect(screen.getByTestId('public-flow-state').getAttribute('data-offer-id')).toBe('req-1');

    fireEvent.click(screen.getByText('close-offer'));

    expect(screen.getByTestId('public-flow-state').getAttribute('data-request-id')).toBe('req-1');
    expect(screen.getByTestId('public-flow-state').getAttribute('data-offer-id')).toBe('');
  });

  it('returns to private request detail after closing chat opened from the dialog', async () => {
    renderWithClient(<PrivateFlowProbe />);

    fireEvent.click(screen.getByText('open-request'));
    fireEvent.click(screen.getByText('open-chat'));

    await waitFor(() => {
      expect(screen.getByTestId('private-flow-state').getAttribute('data-request-id')).toBe('');
      expect(screen.getByTestId('private-flow-state').getAttribute('data-chat-id')).toBe('conversation-1');
    });

    fireEvent.click(screen.getByText('close-chat'));

    expect(screen.getByTestId('private-flow-state').getAttribute('data-request-id')).toBe('req-1');
    expect(screen.getByTestId('private-flow-state').getAttribute('data-chat-id')).toBe('');
  });

  it('returns to private request detail after closing offer sheet opened from the dialog', () => {
    renderWithClient(<PrivateFlowProbe />);

    fireEvent.click(screen.getByText('open-request'));
    fireEvent.click(screen.getByText('open-offer'));

    expect(screen.getByTestId('private-flow-state').getAttribute('data-request-id')).toBe('');
    expect(screen.getByTestId('private-flow-state').getAttribute('data-offer-id')).toBe('req-1');

    fireEvent.click(screen.getByText('close-offer'));

    expect(screen.getByTestId('private-flow-state').getAttribute('data-request-id')).toBe('req-1');
    expect(screen.getByTestId('private-flow-state').getAttribute('data-offer-id')).toBe('');
  });
});
