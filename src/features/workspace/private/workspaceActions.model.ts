'use client';

import type { OfferDto } from '@/lib/api/dto/offers';

export function buildWorkspaceOfferSheetHref(requestId: string) {
  return `/requests/${requestId}?offer=1`;
}

export function buildWorkspaceOfferLoginHref(requestId: string) {
  return `/auth/login?next=${encodeURIComponent(buildWorkspaceOfferSheetHref(requestId))}`;
}

export function resolveWorkspaceOfferById(myOffers: OfferDto[], offerId: string) {
  return myOffers.find((item) => item.id === offerId);
}

export function resolveWorkspaceChatNavigation(offer: OfferDto) {
  const providerUserId = offer.providerUserId?.trim();
  if (!providerUserId || !offer.requestId) {
    return {
      fallbackHref: '/chat',
      threadInput: null,
    };
  }

  return {
    fallbackHref: '/chat',
    threadInput: {
      requestId: offer.requestId,
      providerUserId,
      offerId: offer.id,
    },
  };
}

export function buildWorkspaceOwnerRequestActions(args: {
  pendingDeleteRequestId: string | null;
  onDelete: (requestId: string) => void;
}) {
  return {
    onDelete: args.onDelete,
    pendingDeleteRequestId: args.pendingDeleteRequestId,
  };
}

export function buildWorkspaceActionsResult(args: {
  pendingOfferRequestId: string | null;
  ownerRequestActions: ReturnType<typeof buildWorkspaceOwnerRequestActions>;
  onOpenOfferSheet: (requestId: string) => void;
  onWithdrawOffer: (offerId: string) => void;
  onOpenChatThread: (offer: OfferDto) => void;
}) {
  return {
    pendingOfferRequestId: args.pendingOfferRequestId,
    ownerRequestActions: args.ownerRequestActions,
    onOpenOfferSheet: args.onOpenOfferSheet,
    onWithdrawOffer: args.onWithdrawOffer,
    onOpenChatThread: args.onOpenChatThread,
  };
}
