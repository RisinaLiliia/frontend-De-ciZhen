'use client';

import * as React from 'react';
import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { OfferDto } from '@/lib/api/dto/offers';
import { deleteOffer } from '@/lib/api/offers';
import { archiveMyRequest, deleteMyRequest, duplicateMyRequest, publishMyRequest, unpublishMyRequest } from '@/lib/api/requests';
import { createConversation } from '@/lib/api/chat';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { workspaceQK } from '@/features/workspace/requests';
import {
  buildWorkspaceActionsResult,
  buildWorkspaceOfferLoginHref,
  buildWorkspaceOfferSheetHref,
  buildWorkspaceOwnerRequestActions,
  type WorkspaceChatConversationInput,
  isWorkspaceChatConversationInput,
  resolveWorkspaceChatNavigation,
  resolveWorkspaceOfferById,
} from '@/features/workspace/private/workspaceActions.model';

type RouterLike = {
  push: (href: string) => void;
};

type Translator = (key: I18nKey) => string;

type Args = {
  isAuthed: boolean;
  myOffers: OfferDto[];
  t: Translator;
  qc: QueryClient;
  router: RouterLike;
};

const requestLifecyclePublicQueryKeys: QueryKey[] = [
  ['requests-explorer-public'],
  ['requests-public'],
  ['workspace-public-overview'],
  ['workspace-public-summary'],
  ['requests-public-summary-total'],
  ['requests-public-city-activity'],
  ['home-nearby-requests'],
  ['requests-latest'],
  ['request-similar'],
];

export function useWorkspaceActions({ isAuthed, myOffers, t, qc, router }: Args) {
  const [pendingOfferRequestId, setPendingOfferRequestId] = React.useState<string | null>(null);
  const [pendingPublishRequestId, setPendingPublishRequestId] = React.useState<string | null>(null);
  const [pendingUnpublishRequestId, setPendingUnpublishRequestId] = React.useState<string | null>(null);
  const [pendingArchiveRequestId, setPendingArchiveRequestId] = React.useState<string | null>(null);
  const [pendingDuplicateRequestId, setPendingDuplicateRequestId] = React.useState<string | null>(null);
  const [pendingDeleteRequestId, setPendingDeleteRequestId] = React.useState<string | null>(null);

  const invalidateWorkspaceRequests = React.useCallback(async () => {
    const queryKeys: QueryKey[] = [
      workspaceQK.requestsMy(),
      ['workspace-requests'],
      ['workspace-private-overview'],
      workspaceQK.favoriteRequests(),
      workspaceQK.offersMy(),
      workspaceQK.offersMyClient(),
      workspaceQK.chatInbox(),
      ...requestLifecyclePublicQueryKeys,
    ];

    await Promise.all([
      ...queryKeys.map((queryKey) => qc.invalidateQueries({ queryKey })),
    ]);
  }, [qc]);

  const onOpenOfferSheet = React.useCallback(
    (requestId: string) => {
      if (!isAuthed) {
        toast.message(t(I18N_KEYS.requestDetails.loginRequired));
        router.push(buildWorkspaceOfferLoginHref(requestId));
        return;
      }
      router.push(buildWorkspaceOfferSheetHref(requestId));
    },
    [isAuthed, router, t],
  );

  const onWithdrawOffer = React.useCallback(
    async (offerId: string) => {
      const offer = resolveWorkspaceOfferById(myOffers, offerId);
      if (!offer) return;
      setPendingOfferRequestId(offer.requestId);
      try {
        await deleteOffer(offerId);
        toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
        await qc.invalidateQueries({ queryKey: workspaceQK.offersMy() });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      } finally {
        setPendingOfferRequestId(null);
      }
    },
    [myOffers, qc, t],
  );

  const onOpenChatThread = React.useCallback(
    async (offer: OfferDto) => {
      const navigation = resolveWorkspaceChatNavigation(offer);
      if (!navigation.conversationInput) {
        router.push(navigation.fallbackHref);
        return;
      }
      try {
        const conversation = await createConversation(navigation.conversationInput);
        await qc.invalidateQueries({ queryKey: workspaceQK.chatInbox() });
        router.push(`/chat?conversation=${encodeURIComponent(conversation.id)}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
        router.push('/chat');
      }
    },
    [qc, router, t],
  );

  const onOpenChatConversation = React.useCallback(
    async (payload: WorkspaceChatConversationInput) => {
      try {
        if (!isWorkspaceChatConversationInput(payload)) {
          router.push('/chat');
          return;
        }
        const conversation = await createConversation(payload);
        await qc.invalidateQueries({ queryKey: workspaceQK.chatInbox() });
        router.push(`/chat?conversation=${encodeURIComponent(conversation.id)}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
        router.push('/chat');
      }
    },
    [qc, router, t],
  );

  const onArchiveMyRequest = React.useCallback(
    async (requestId: string) => {
      if (pendingArchiveRequestId === requestId) return;
      setPendingArchiveRequestId(requestId);
      try {
        await archiveMyRequest(requestId);
        toast.success(t(I18N_KEYS.client.requestArchived));
        await invalidateWorkspaceRequests();
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
      } finally {
        setPendingArchiveRequestId(null);
      }
    },
    [invalidateWorkspaceRequests, pendingArchiveRequestId, t],
  );

  const onArchiveMyRequestVoid = React.useCallback((requestId: string) => {
    void onArchiveMyRequest(requestId);
  }, [onArchiveMyRequest]);

  const onPublishMyRequest = React.useCallback(
    async (requestId: string) => {
      if (pendingPublishRequestId === requestId) return;
      setPendingPublishRequestId(requestId);
      try {
        await publishMyRequest(requestId);
        toast.success(t(I18N_KEYS.client.requestPublished));
        await invalidateWorkspaceRequests();
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
      } finally {
        setPendingPublishRequestId(null);
      }
    },
    [invalidateWorkspaceRequests, pendingPublishRequestId, t],
  );

  const onPublishMyRequestVoid = React.useCallback((requestId: string) => {
    void onPublishMyRequest(requestId);
  }, [onPublishMyRequest]);

  const onUnpublishMyRequest = React.useCallback(
    async (requestId: string) => {
      if (pendingUnpublishRequestId === requestId) return;
      setPendingUnpublishRequestId(requestId);
      try {
        await unpublishMyRequest(requestId);
        toast.success(t(I18N_KEYS.client.requestUnpublished));
        await invalidateWorkspaceRequests();
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
      } finally {
        setPendingUnpublishRequestId(null);
      }
    },
    [invalidateWorkspaceRequests, pendingUnpublishRequestId, t],
  );

  const onUnpublishMyRequestVoid = React.useCallback((requestId: string) => {
    void onUnpublishMyRequest(requestId);
  }, [onUnpublishMyRequest]);

  const onDuplicateMyRequest = React.useCallback(
    async (requestId: string) => {
      if (pendingDuplicateRequestId === requestId) return;
      setPendingDuplicateRequestId(requestId);
      try {
        await duplicateMyRequest(requestId);
        toast.success(t(I18N_KEYS.client.requestDuplicated));
        await invalidateWorkspaceRequests();
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
      } finally {
        setPendingDuplicateRequestId(null);
      }
    },
    [invalidateWorkspaceRequests, pendingDuplicateRequestId, t],
  );

  const onDuplicateMyRequestVoid = React.useCallback((requestId: string) => {
    void onDuplicateMyRequest(requestId);
  }, [onDuplicateMyRequest]);

  const onDeleteMyRequest = React.useCallback(
    async (requestId: string) => {
      if (pendingDeleteRequestId === requestId) return;
      setPendingDeleteRequestId(requestId);
      try {
        await deleteMyRequest(requestId);
        toast.success(t(I18N_KEYS.client.requestDeleted));
        await invalidateWorkspaceRequests();
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
      } finally {
        setPendingDeleteRequestId(null);
      }
    },
    [invalidateWorkspaceRequests, pendingDeleteRequestId, t],
  );

  const onDeleteMyRequestVoid = React.useCallback((requestId: string) => {
    void onDeleteMyRequest(requestId);
  }, [onDeleteMyRequest]);

  const ownerRequestActions = React.useMemo(
    () =>
      buildWorkspaceOwnerRequestActions({
        pendingArchiveRequestId,
        pendingDuplicateRequestId,
        pendingPublishRequestId,
        pendingUnpublishRequestId,
        onPublish: onPublishMyRequestVoid,
        onUnpublish: onUnpublishMyRequestVoid,
        onDelete: onDeleteMyRequestVoid,
        onArchive: onArchiveMyRequestVoid,
        onDuplicate: onDuplicateMyRequestVoid,
        pendingDeleteRequestId,
      }),
    [
      onArchiveMyRequestVoid,
      onDeleteMyRequestVoid,
      onDuplicateMyRequestVoid,
      onPublishMyRequestVoid,
      onUnpublishMyRequestVoid,
      pendingArchiveRequestId,
      pendingDeleteRequestId,
      pendingDuplicateRequestId,
      pendingPublishRequestId,
      pendingUnpublishRequestId,
    ],
  );

  return React.useMemo(
    () =>
      buildWorkspaceActionsResult({
        pendingOfferRequestId,
        ownerRequestActions,
        onOpenOfferSheet,
        onWithdrawOffer,
        onOpenChatThread,
        onOpenChatConversation,
      }),
    [
      onOpenChatConversation,
      onOpenChatThread,
      onOpenOfferSheet,
      onWithdrawOffer,
      ownerRequestActions,
      pendingOfferRequestId,
    ],
  );
}
