import { describe, expect, it, vi } from 'vitest';

import {
  buildWorkspaceActionsResult,
  buildWorkspaceChatConversationHref,
  buildWorkspaceOfferLoginHref,
  buildWorkspaceOfferSheetHref,
  buildWorkspaceOwnerRequestActions,
  isWorkspaceChatConversationInput,
  resolveWorkspaceChatNavigation,
} from './workspaceActions.model';

describe('workspaceActions.model', () => {
  it('builds offer sheet and login hrefs for workspace actions', () => {
    expect(buildWorkspaceOfferSheetHref('req-1')).toBe(
      '/workspace?section=requests&scope=market&requestId=req-1&requestPanel=offer',
    );
    expect(buildWorkspaceOfferLoginHref('req-1')).toBe(
      '/auth/login?next=%2Fworkspace%3Fsection%3Drequests%26scope%3Dmarket%26requestId%3Dreq-1%26requestPanel%3Doffer',
    );
    expect(buildWorkspaceChatConversationHref('conv-1')).toBe(
      '/workspace?section=chat&conversation=conv-1',
    );
  });

  it('builds chat navigation payload from a contextual offer', () => {
    const offer = { id: 'offer-2', requestId: 'req-2', providerUserId: 'provider-user-2' };

    expect(resolveWorkspaceChatNavigation(offer as never)).toEqual({
      conversationInput: {
        relatedEntity: {
          type: 'offer',
          id: 'offer-2',
        },
        requestId: 'req-2',
        participantUserId: 'provider-user-2',
        participantRole: 'provider',
        providerUserId: 'provider-user-2',
        offerId: 'offer-2',
      },
    });
    expect(resolveWorkspaceChatNavigation({ id: 'offer-3', requestId: '' } as never)).toEqual({
      conversationInput: null,
    });
    expect(
      isWorkspaceChatConversationInput({
        relatedEntity: { type: 'offer', id: 'offer-2' },
        participantUserId: 'provider-user-2',
      }),
    ).toBe(true);
    expect(isWorkspaceChatConversationInput({ relatedEntity: { type: 'offer', id: '' } })).toBe(
      false,
    );
  });

  it('builds owner actions and final workspace actions result', () => {
    const onArchive = vi.fn();
    const onDuplicate = vi.fn();
    const onDelete = vi.fn();
    const onPublish = vi.fn();
    const onUnpublish = vi.fn();
    const onOpenOfferSheet = vi.fn();
    const onWithdrawOffer = vi.fn();
    const onOpenChatThread = vi.fn();
    const onOpenChatConversation = vi.fn();

    const ownerRequestActions = buildWorkspaceOwnerRequestActions({
      pendingPublishRequestId: 'req-4',
      pendingUnpublishRequestId: 'req-5',
      pendingArchiveRequestId: 'req-2',
      pendingDuplicateRequestId: 'req-3',
      pendingDeleteRequestId: 'req-1',
      onPublish,
      onUnpublish,
      onArchive,
      onDuplicate,
      onDelete,
    });
    const result = buildWorkspaceActionsResult({
      pendingOfferRequestId: 'req-2',
      ownerRequestActions,
      onOpenOfferSheet,
      onWithdrawOffer,
      onOpenChatThread,
      onOpenChatConversation,
    });

    expect(ownerRequestActions.pendingArchiveRequestId).toBe('req-2');
    expect(ownerRequestActions.pendingDuplicateRequestId).toBe('req-3');
    expect(ownerRequestActions.pendingDeleteRequestId).toBe('req-1');
    expect(ownerRequestActions.pendingPublishRequestId).toBe('req-4');
    expect(ownerRequestActions.pendingUnpublishRequestId).toBe('req-5');
    expect(ownerRequestActions.onPublish).toBe(onPublish);
    expect(ownerRequestActions.onUnpublish).toBe(onUnpublish);
    expect(ownerRequestActions.onArchive).toBe(onArchive);
    expect(ownerRequestActions.onDuplicate).toBe(onDuplicate);
    expect(result.pendingOfferRequestId).toBe('req-2');
    expect(result.ownerRequestActions.onDelete).toBe(onDelete);
    expect(result.onWithdrawOffer).toBe(onWithdrawOffer);
    expect(result.onOpenChatConversation).toBe(onOpenChatConversation);
  });
});
