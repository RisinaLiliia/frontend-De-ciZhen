'use client';

import * as React from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { OfferDto } from '@/lib/api/dto/offers';
import { deleteOffer } from '@/lib/api/offers';
import { deleteMyRequest } from '@/lib/api/requests';
import { createThread } from '@/lib/api/chat';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { workspaceQK } from '@/features/workspace/requests';
import {
  buildWorkspaceActionsResult,
  buildWorkspaceOfferLoginHref,
  buildWorkspaceOfferSheetHref,
  buildWorkspaceOwnerRequestActions,
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

export function useWorkspaceActions({ isAuthed, myOffers, t, qc, router }: Args) {
  const [pendingOfferRequestId, setPendingOfferRequestId] = React.useState<string | null>(null);
  const [pendingDeleteRequestId, setPendingDeleteRequestId] = React.useState<string | null>(null);

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
      try {
        const navigation = resolveWorkspaceChatNavigation(offer);
        if (!navigation.threadInput) {
          router.push(navigation.fallbackHref);
          return;
        }
        const thread = await createThread(navigation.threadInput);
        await qc.invalidateQueries({ queryKey: workspaceQK.chatInbox() });
        router.push(`/chat/${thread.id}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
        router.push('/chat');
      }
    },
    [qc, router, t],
  );

  const onDeleteMyRequest = React.useCallback(
    async (requestId: string) => {
      if (pendingDeleteRequestId === requestId) return;
      setPendingDeleteRequestId(requestId);
      try {
        await deleteMyRequest(requestId);
        toast.success(t(I18N_KEYS.client.requestDeleted));
        await qc.invalidateQueries({ queryKey: workspaceQK.requestsMy() });
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
      } finally {
        setPendingDeleteRequestId(null);
      }
    },
    [pendingDeleteRequestId, qc, t],
  );

  const onDeleteMyRequestVoid = React.useCallback((requestId: string) => {
    void onDeleteMyRequest(requestId);
  }, [onDeleteMyRequest]);

  const ownerRequestActions = React.useMemo(
    () =>
      buildWorkspaceOwnerRequestActions({
        onDelete: onDeleteMyRequestVoid,
        pendingDeleteRequestId,
      }),
    [onDeleteMyRequestVoid, pendingDeleteRequestId],
  );

  return React.useMemo(
    () =>
      buildWorkspaceActionsResult({
        pendingOfferRequestId,
        ownerRequestActions,
        onOpenOfferSheet,
        onWithdrawOffer,
        onOpenChatThread,
      }),
    [
      onOpenChatThread,
      onOpenOfferSheet,
      onWithdrawOffer,
      ownerRequestActions,
      pendingOfferRequestId,
    ],
  );
}
