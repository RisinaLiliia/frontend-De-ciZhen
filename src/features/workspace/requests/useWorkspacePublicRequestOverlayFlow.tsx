'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createConversation } from '@/lib/api/chat';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import { isWorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import type { RequestDialogIntent } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

type WorkspaceChatDialogState = {
  conversationId: string;
  title: string;
};

type ManagedRequestState = {
  requestId: string;
  intent: RequestDialogIntent;
};

export function useWorkspacePublicRequestOverlayFlow({
  locale,
  requests,
}: {
  locale: Locale;
  requests: RequestResponseDto[];
}) {
  const t = useT();
  const qc = useQueryClient();
  const requestsById = React.useMemo(
    () => new Map(requests.map((request) => [request.id, request])),
    [requests],
  );
  const [activeRequestState, setActiveRequestState] = React.useState<ManagedRequestState | null>(null);
  const [activeOfferRequestId, setActiveOfferRequestId] = React.useState<string | null>(null);
  const [activeChatState, setActiveChatState] = React.useState<WorkspaceChatDialogState | null>(null);
  const [returnRequestState, setReturnRequestState] = React.useState<ManagedRequestState | null>(null);
  const activeRequestStateRef = React.useRef<ManagedRequestState | null>(null);

  React.useEffect(() => {
    activeRequestStateRef.current = activeRequestState;
  }, [activeRequestState]);

  const openRequest = React.useCallback((requestId: string, intent: RequestDialogIntent = 'view') => {
    setReturnRequestState(null);
    setActiveOfferRequestId(null);
    setActiveChatState(null);
    setActiveRequestState({ requestId, intent });
  }, []);

  const closeRequest = React.useCallback(() => {
    setReturnRequestState(null);
    setActiveRequestState(null);
  }, []);

  const openOfferSheet = React.useCallback((requestId: string) => {
    setReturnRequestState(activeRequestStateRef.current);
    setActiveRequestState(null);
    setActiveChatState(null);
    setActiveOfferRequestId(requestId);
  }, []);

  const closeOfferSheet = React.useCallback(() => {
    setActiveOfferRequestId(null);
    setActiveRequestState(returnRequestState);
    setReturnRequestState(null);
  }, [returnRequestState]);

  const openChatConversation = React.useCallback(async (payload: WorkspaceChatConversationInput, title?: string) => {
    try {
      if (!isWorkspaceChatConversationInput(payload)) {
        toast.error(locale === 'de' ? 'Chat konnte nicht geöffnet werden.' : 'Chat could not be opened.');
        return;
      }

      const conversation = await createConversation(payload);
      await qc.invalidateQueries({ queryKey: workspaceQK.chatInbox() });
      const fallbackTitle = payload.requestId
        ? requestsById.get(payload.requestId)?.title?.trim()
        : '';

      setReturnRequestState(activeRequestStateRef.current);
      setActiveRequestState(null);
      setActiveOfferRequestId(null);
      setActiveChatState({
        conversationId: conversation.id,
        title: title?.trim() || fallbackTitle || (locale === 'de' ? 'Nachrichten' : 'Messages'),
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

  const dismissSession = React.useCallback(() => {
    setReturnRequestState(null);
    setActiveChatState(null);
    setActiveOfferRequestId(null);
    setActiveRequestState(null);
  }, []);

  return {
    activeChatState,
    activeOfferRequestId,
    activeRequestState,
    closeChat,
    closeOfferSheet,
    closeRequest,
    dismissSession,
    openChatConversation,
    openOfferSheet,
    openRequest,
  };
}
