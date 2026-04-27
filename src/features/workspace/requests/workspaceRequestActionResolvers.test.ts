import { describe, expect, it } from 'vitest';

import {
  resolveWorkspaceRequestChatAction,
  resolveWorkspaceRequestOfferAction,
} from '@/features/workspace/requests/workspaceRequestActionResolvers';

describe('workspaceRequestActionResolvers', () => {
  it('prefers status chat actions before card-level CTA fallbacks', () => {
    const action = resolveWorkspaceRequestChatAction({
      status: {
        actions: [
          {
            key: 'chat',
            kind: 'open_chat',
            tone: 'secondary',
            icon: 'chat',
            label: 'Chat',
            requestId: 'req-1',
            chatInput: {
              relatedEntity: { type: 'request', id: 'req-1' },
              participantUserId: 'provider-1',
              participantRole: 'provider',
              requestId: 'req-1',
              providerUserId: 'provider-1',
            },
          },
        ],
      },
      primaryAction: {
        key: 'primary-chat',
        kind: 'open_chat',
        tone: 'primary',
        icon: 'chat',
        label: 'Primary chat',
        requestId: 'req-1',
        chatInput: {
          relatedEntity: { type: 'request', id: 'req-1' },
          participantUserId: 'provider-2',
          participantRole: 'provider',
          requestId: 'req-1',
          providerUserId: 'provider-2',
        },
      },
      secondaryAction: null,
    } as never);

    expect(action?.key).toBe('chat');
  });

  it('falls back to secondary then primary card-level chat actions', () => {
    const action = resolveWorkspaceRequestChatAction({
      status: {
        actions: [],
      },
      primaryAction: {
        key: 'primary-chat',
        kind: 'open_chat',
        tone: 'primary',
        icon: 'chat',
        label: 'Primary chat',
        requestId: 'req-1',
        chatInput: {
          relatedEntity: { type: 'request', id: 'req-1' },
          participantUserId: 'provider-1',
          participantRole: 'provider',
          requestId: 'req-1',
          providerUserId: 'provider-1',
        },
      },
      secondaryAction: {
        key: 'secondary-chat',
        kind: 'open_chat',
        tone: 'secondary',
        icon: 'chat',
        label: 'Secondary chat',
        requestId: 'req-1',
        chatInput: {
          relatedEntity: { type: 'request', id: 'req-1' },
          participantUserId: 'provider-2',
          participantRole: 'provider',
          requestId: 'req-1',
          providerUserId: 'provider-2',
        },
      },
    } as never);

    expect(action?.key).toBe('secondary-chat');
  });

  it('resolves provider offer actions from status actions', () => {
    const action = resolveWorkspaceRequestOfferAction({
      status: {
        actions: [
          {
            key: 'send-offer',
            kind: 'send_offer',
            tone: 'primary',
            icon: 'send',
            label: 'Angebot senden',
            requestId: 'req-2',
          },
        ],
      },
    } as never);

    expect(action?.kind).toBe('send_offer');
  });
});
