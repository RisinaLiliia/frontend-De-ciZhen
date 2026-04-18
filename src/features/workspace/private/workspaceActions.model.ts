'use client';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { CreateConversationDto } from '@/lib/api/dto/chat';

export type WorkspaceChatConversationInput = Pick<
  CreateConversationDto,
  'relatedEntity' | 'participantUserId' | 'participantRole' | 'requestId' | 'providerUserId' | 'offerId' | 'orderId' | 'contractId'
>;

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
      conversationInput: null,
    };
  }

  return {
    fallbackHref: '/chat',
    conversationInput: {
      relatedEntity: {
        type: 'offer' as const,
        id: offer.id,
      },
      requestId: offer.requestId,
      participantUserId: providerUserId,
      participantRole: 'provider' as const,
      providerUserId,
      offerId: offer.id,
    },
  };
}

export function isWorkspaceChatConversationInput(value: unknown): value is WorkspaceChatConversationInput {
  const candidate = value as Partial<WorkspaceChatConversationInput> | null;
  return Boolean(
    candidate
    && candidate.relatedEntity
    && candidate.relatedEntity.type
    && candidate.relatedEntity.id
    && candidate.participantUserId,
  );
}

export function buildWorkspaceOwnerRequestActions(args: {
  pendingArchiveRequestId: string | null;
  pendingDuplicateRequestId: string | null;
  pendingDeleteRequestId: string | null;
  onArchive: (requestId: string) => void;
  onDuplicate: (requestId: string) => void;
  onDelete: (requestId: string) => void;
}) {
  return {
    onArchive: args.onArchive,
    onDuplicate: args.onDuplicate,
    onDelete: args.onDelete,
    pendingArchiveRequestId: args.pendingArchiveRequestId,
    pendingDuplicateRequestId: args.pendingDuplicateRequestId,
    pendingDeleteRequestId: args.pendingDeleteRequestId,
  };
}

export function buildWorkspaceActionsResult(args: {
  pendingOfferRequestId: string | null;
  ownerRequestActions: ReturnType<typeof buildWorkspaceOwnerRequestActions>;
  onOpenOfferSheet: (requestId: string) => void;
  onWithdrawOffer: (offerId: string) => void;
  onOpenChatThread: (offer: OfferDto) => void;
  onOpenChatConversation: (payload: WorkspaceChatConversationInput) => void;
}) {
  return {
    pendingOfferRequestId: args.pendingOfferRequestId,
    ownerRequestActions: args.ownerRequestActions,
    onOpenOfferSheet: args.onOpenOfferSheet,
    onWithdrawOffer: args.onWithdrawOffer,
    onOpenChatThread: args.onOpenChatThread,
    onOpenChatConversation: args.onOpenChatConversation,
  };
}
