'use client';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { CreateConversationDto } from '@/lib/api/dto/chat';
import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';
import { buildWorkspaceRequestOverlayHref } from '@/features/workspace/requests/workspaceRequestRoute.model';

export type WorkspaceChatConversationInput = Pick<
  CreateConversationDto,
  | 'relatedEntity'
  | 'participantUserId'
  | 'participantRole'
  | 'requestId'
  | 'providerUserId'
  | 'offerId'
  | 'orderId'
  | 'contractId'
>;

export function buildWorkspaceOfferSheetHref(requestId: string) {
  return buildWorkspaceRequestOverlayHref({
    currentSearch: '',
    requestId,
    scope: 'market',
    panel: 'offer',
  });
}

export function buildWorkspaceOfferLoginHref(requestId: string) {
  return `/auth/login?next=${encodeURIComponent(buildWorkspaceOfferSheetHref(requestId))}`;
}

export function buildWorkspaceChatConversationHref(conversationId: string) {
  return buildWorkspaceHref({
    currentSearch: '',
    section: 'chat',
    patch: {
      conversation: conversationId,
    },
  });
}

export function resolveWorkspaceChatNavigation(offer: OfferDto) {
  const providerUserId = offer.providerUserId?.trim();
  if (!providerUserId || !offer.requestId) {
    return {
      conversationInput: null,
    };
  }

  return {
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

export function isWorkspaceChatConversationInput(
  value: unknown,
): value is WorkspaceChatConversationInput {
  const candidate = value as Partial<WorkspaceChatConversationInput> | null;
  return Boolean(
    candidate &&
    candidate.relatedEntity &&
    candidate.relatedEntity.type &&
    candidate.relatedEntity.id &&
    candidate.participantUserId,
  );
}

export function buildWorkspaceOwnerRequestActions(args: {
  pendingPublishRequestId: string | null;
  pendingUnpublishRequestId: string | null;
  pendingArchiveRequestId: string | null;
  pendingDuplicateRequestId: string | null;
  pendingDeleteRequestId: string | null;
  onPublish: (requestId: string) => void;
  onUnpublish: (requestId: string) => void;
  onArchive: (requestId: string) => void;
  onDuplicate: (requestId: string) => void;
  onDelete: (requestId: string) => void;
}) {
  return {
    onPublish: args.onPublish,
    onUnpublish: args.onUnpublish,
    onArchive: args.onArchive,
    onDuplicate: args.onDuplicate,
    onDelete: args.onDelete,
    pendingPublishRequestId: args.pendingPublishRequestId,
    pendingUnpublishRequestId: args.pendingUnpublishRequestId,
    pendingArchiveRequestId: args.pendingArchiveRequestId,
    pendingDuplicateRequestId: args.pendingDuplicateRequestId,
    pendingDeleteRequestId: args.pendingDeleteRequestId,
  };
}

export function buildWorkspaceActionsResult(args: {
  pendingOfferRequestId: string | null;
  ownerRequestActions: ReturnType<typeof buildWorkspaceOwnerRequestActions>;
  onOpenOfferSheet: (requestId: string) => void;
  onWithdrawOffer: (offerId: string, requestId?: string) => void;
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
