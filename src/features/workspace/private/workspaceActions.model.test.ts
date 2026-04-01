import { describe, expect, it, vi } from 'vitest';

import {
  buildWorkspaceActionsResult,
  buildWorkspaceOfferLoginHref,
  buildWorkspaceOfferSheetHref,
  buildWorkspaceOwnerRequestActions,
  resolveWorkspaceChatNavigation,
  resolveWorkspaceOfferById,
} from './workspaceActions.model';

describe('workspaceActions.model', () => {
  it('builds offer sheet and login hrefs for workspace actions', () => {
    expect(buildWorkspaceOfferSheetHref('req-1')).toBe('/requests/req-1?offer=1');
    expect(buildWorkspaceOfferLoginHref('req-1')).toBe('/auth/login?next=%2Frequests%2Freq-1%3Foffer%3D1');
  });

  it('resolves latest matching offer and chat navigation payload', () => {
    const offer = resolveWorkspaceOfferById(
      [
        { id: 'offer-1', requestId: 'req-1' },
        { id: 'offer-2', requestId: 'req-2', providerUserId: 'provider-user-2' },
      ] as never,
      'offer-2',
    );

    expect(offer?.id).toBe('offer-2');
    expect(resolveWorkspaceChatNavigation(offer as never)).toEqual({
      fallbackHref: '/chat',
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
      fallbackHref: '/chat',
      conversationInput: null,
    });
  });

  it('builds owner actions and final workspace actions result', () => {
    const onDelete = vi.fn();
    const onOpenOfferSheet = vi.fn();
    const onWithdrawOffer = vi.fn();
    const onOpenChatThread = vi.fn();

    const ownerRequestActions = buildWorkspaceOwnerRequestActions({
      pendingDeleteRequestId: 'req-1',
      onDelete,
    });
    const result = buildWorkspaceActionsResult({
      pendingOfferRequestId: 'req-2',
      ownerRequestActions,
      onOpenOfferSheet,
      onWithdrawOffer,
      onOpenChatThread,
    });

    expect(ownerRequestActions.pendingDeleteRequestId).toBe('req-1');
    expect(result.pendingOfferRequestId).toBe('req-2');
    expect(result.ownerRequestActions.onDelete).toBe(onDelete);
    expect(result.onWithdrawOffer).toBe(onWithdrawOffer);
  });
});
