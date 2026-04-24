'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { OwnerRequestActions, RequestsListProps } from '@/components/requests/requestsList.types';
import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import {
  type WorkspaceChatConversationInput,
  isWorkspaceChatConversationInput,
} from '@/features/workspace/private/workspaceActions.model';
import { createConversation } from '@/lib/api/chat';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';

export type RequestDialogIntent = 'view' | 'edit' | 'responses' | 'contract' | 'review';

export type WorkspaceRequestOverlayListContext = {
  onSendOffer?: RequestsListProps['onSendOffer'];
  onEditOffer?: RequestsListProps['onEditOffer'];
  onWithdrawOffer?: RequestsListProps['onWithdrawOffer'];
  onOpenChatConversation?: (payload: WorkspaceChatConversationInput) => void;
  pendingOfferRequestId?: string | null;
  ownerRequestActions?: OwnerRequestActions;
  onOpenRequest?: (requestId: string, intent?: RequestDialogIntent) => void;
};

type ManagedRequestState = {
  requestId: string;
  intent: RequestDialogIntent;
};

type WorkspaceChatDialogState = {
  conversationId: string;
  title: string;
};

type Params = {
  locale: Locale;
  cards: MyRequestsViewCard[];
  listContext: Omit<WorkspaceRequestOverlayListContext, 'onOpenRequest'>;
};

export function useWorkspaceRequestOverlayFlow({
  locale,
  cards,
  listContext,
}: Params) {
  const t = useT();
  const qc = useQueryClient();
  const requestsById = React.useMemo(
    () => new Map(cards.map((card) => [card.requestId, card])),
    [cards],
  );
  const [activeRequestState, setActiveRequestState] = React.useState<ManagedRequestState | null>(null);
  const [activeOfferRequestId, setActiveOfferRequestId] = React.useState<string | null>(null);
  const [activeChatState, setActiveChatState] = React.useState<WorkspaceChatDialogState | null>(null);
  const [returnRequestState, setReturnRequestState] = React.useState<ManagedRequestState | null>(null);
  const activeRequestStateRef = React.useRef<ManagedRequestState | null>(null);
  const activeRequestCard = activeRequestState
    ? requestsById.get(activeRequestState.requestId) ?? null
    : null;

  React.useEffect(() => {
    activeRequestStateRef.current = activeRequestState;
  }, [activeRequestState]);

  const openRequest = React.useCallback((requestId: string, intent: RequestDialogIntent = 'view') => {
    if (!requestsById.has(requestId)) return;
    setReturnRequestState(null);
    setActiveOfferRequestId(null);
    setActiveChatState(null);
    setActiveRequestState({ requestId, intent });
  }, [requestsById]);

  const closeRequest = React.useCallback(() => {
    setReturnRequestState(null);
    setActiveRequestState(null);
  }, []);

  const openOfferSheet = React.useCallback((requestId: string) => {
    if (!requestsById.has(requestId)) return;
    setReturnRequestState(activeRequestStateRef.current);
    setActiveRequestState(null);
    setActiveChatState(null);
    setActiveOfferRequestId(requestId);
  }, [requestsById]);

  const closeOfferSheet = React.useCallback(() => {
    setActiveOfferRequestId(null);
    setActiveRequestState(returnRequestState);
    setReturnRequestState(null);
  }, [returnRequestState]);

  const openChatConversation = React.useCallback(async (payload: WorkspaceChatConversationInput) => {
    try {
      if (!isWorkspaceChatConversationInput(payload)) {
        toast.error(locale === 'de' ? 'Chat konnte nicht geöffnet werden.' : 'Chat could not be opened.');
        return;
      }

      const conversation = await createConversation(payload);
      await qc.invalidateQueries({ queryKey: workspaceQK.chatInbox() });
      const requestTitle = payload.requestId
        ? requestsById.get(payload.requestId)?.requestPreview.title?.trim()
        : '';

      setReturnRequestState(activeRequestStateRef.current);
      setActiveRequestState(null);
      setActiveOfferRequestId(null);
      setActiveChatState({
        conversationId: conversation.id,
        title: requestTitle || (locale === 'de' ? 'Nachrichten' : 'Messages'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  }, [locale, qc, requestsById, t]);

  const closeChat = React.useCallback(() => {
    setActiveChatState(null);
    setActiveRequestState(returnRequestState);
    setReturnRequestState(null);
  }, [returnRequestState]);

  const effectiveListContext = React.useMemo<WorkspaceRequestOverlayListContext>(
    () => ({
      ...listContext,
      onSendOffer: openOfferSheet,
      onEditOffer: openOfferSheet,
      onOpenChatConversation: (payload) => {
        void openChatConversation(payload);
      },
      onOpenRequest: openRequest,
    }),
    [listContext, openChatConversation, openOfferSheet, openRequest],
  );

  React.useEffect(() => {
    if (!activeRequestState) return;
    if (activeRequestCard) return;
    setActiveRequestState(null);
  }, [activeRequestCard, activeRequestState]);

  React.useEffect(() => {
    if (!activeOfferRequestId) return;
    if (requestsById.has(activeOfferRequestId)) return;
    setActiveOfferRequestId(null);
  }, [activeOfferRequestId, requestsById]);

  return {
    activeChatState,
    activeOfferRequestId,
    activeRequestCard,
    activeRequestState,
    closeChat,
    closeOfferSheet,
    closeRequest,
    effectiveListContext,
    openChatConversation,
    openOfferSheet,
    openRequest,
  };
}
