'use client';

import * as React from 'react';

import { BackButton } from '@/components/layout/BackButton';
import { ChatWorkspacePage } from '@/features/chat/ChatWorkspacePage';
import { WorkspaceRequestDialogShell } from '@/features/workspace/requests/WorkspaceRequestDialogShell';
import {
  WorkspaceManagedOfferSheet,
  WorkspaceManagedRequestDialog,
} from '@/features/workspace/requests/WorkspaceRequestOverlays';
import type { RequestDialogIntent } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';

type ChatState = {
  conversationId: string;
  title: string;
};

type RequestState = {
  requestId: string;
  intent: RequestDialogIntent;
};

type Props = {
  locale: Locale;
  activeRequestState: RequestState | null;
  activeRequestCard: MyRequestsViewCard | null;
  activeOfferRequestId: string | null;
  activeChatState: ChatState | null;
  onDismissSession: () => void;
  onCloseOfferSheet: () => void;
  onCloseChat: () => void;
  onOpenOfferSheet: (requestId: string) => void;
  onOpenChatConversation: (payload: WorkspaceChatConversationInput) => void;
};

export function WorkspacePrivateRequestSessionDialog({
  locale,
  activeRequestState,
  activeRequestCard,
  activeOfferRequestId,
  activeChatState,
  onDismissSession,
  onCloseOfferSheet,
  onCloseChat,
  onOpenOfferSheet,
  onOpenChatConversation,
}: Props) {
  const scene = activeChatState
    ? 'chat'
    : activeOfferRequestId
      ? 'offer_edit'
      : activeRequestState && activeRequestCard
        ? 'detail'
        : null;

  if (!scene) return null;

  const ariaLabel = scene === 'chat'
    ? activeChatState?.title || (locale === 'de' ? 'Nachrichten' : 'Messages')
    : scene === 'offer_edit'
      ? (locale === 'de' ? 'Angebot bearbeiten' : 'Edit offer')
      : activeRequestCard?.requestPreview.title || (locale === 'de' ? 'Anfrage' : 'Request');
  const sceneTitle = locale === 'de' ? 'Chat' : 'Chat';
  const sceneSubtitle = activeChatState?.title || (locale === 'de'
    ? 'Unterhaltung zur Anfrage'
    : 'Conversation for this request');

  return (
    <WorkspaceRequestDialogShell
      locale={locale}
      ariaLabel={ariaLabel}
      onClose={onDismissSession}
      isLoading={false}
      isError={false}
      errorTitle=""
      errorBody=""
      bodyVariant={scene === 'detail' ? 'details' : 'default'}
    >
      {scene === 'detail' && activeRequestState && activeRequestCard ? (
        <WorkspaceManagedRequestDialog
          locale={locale}
          card={activeRequestCard}
          initialIntent={activeRequestState.intent}
          onClose={onDismissSession}
          onOpenOfferSheet={onOpenOfferSheet}
          onOpenChatConversation={onOpenChatConversation}
          surface="embedded"
        />
      ) : null}

      {scene === 'offer_edit' && activeOfferRequestId ? (
        <div className="my-request-dialog__scene my-request-dialog__scene--offer-edit">
          <div className="my-request-dialog__toolbar">
            <BackButton onClick={onCloseOfferSheet} />
          </div>
          <WorkspaceManagedOfferSheet
            locale={locale}
            requestId={activeOfferRequestId}
            onClose={onCloseOfferSheet}
            surface="embedded"
          />
        </div>
      ) : null}

      {scene === 'chat' && activeChatState ? (
        <>
          <div className="my-request-dialog__toolbar">
            <BackButton onClick={onCloseChat} />
            <div>
              <strong>{sceneTitle}</strong>
              <p>{sceneSubtitle}</p>
            </div>
          </div>
          <ChatWorkspacePage
            embeddedConversationId={activeChatState.conversationId}
            className="my-request-chat-dialog__content"
          />
        </>
      ) : null}
    </WorkspaceRequestDialogShell>
  );
}
