'use client';

import * as React from 'react';

import { BackButton } from '@/components/layout/BackButton';
import { ChatWorkspacePage } from '@/features/chat/ChatWorkspacePage';
import { WorkspacePublicRequestDialog } from '@/features/workspace/requests/WorkspacePublicRequestDialog';
import { WorkspaceRequestDialogShell } from '@/features/workspace/requests/WorkspaceRequestDialogShell';
import { WorkspaceManagedOfferSheet } from '@/features/workspace/requests/WorkspaceRequestOverlays';
import type { RequestDialogIntent } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
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
  activeOfferRequestId: string | null;
  activeChatState: ChatState | null;
  onDismissSession: () => void;
  onCloseOfferSheet: () => void;
  onCloseChat: () => void;
  onOpenRequest: (requestId: string, intent?: RequestDialogIntent) => void;
  onOpenOfferSheet: (requestId: string) => void;
  onOpenChatConversation: (payload: WorkspaceChatConversationInput, title?: string) => void;
};

export function WorkspacePublicRequestSessionDialog({
  locale,
  activeRequestState,
  activeOfferRequestId,
  activeChatState,
  onDismissSession,
  onCloseOfferSheet,
  onCloseChat,
  onOpenRequest,
  onOpenOfferSheet,
  onOpenChatConversation,
}: Props) {
  const scene = activeChatState
    ? 'chat'
    : activeOfferRequestId
      ? 'offer_edit'
      : activeRequestState
        ? 'detail'
        : null;

  if (!scene) return null;

  const requestId = activeRequestState?.requestId ?? activeOfferRequestId ?? null;
  const requestIntent = activeRequestState?.intent ?? 'view';
  const ariaLabel = scene === 'chat'
    ? activeChatState?.title || (locale === 'de' ? 'Nachrichten' : 'Messages')
    : scene === 'offer_edit'
      ? (locale === 'de' ? 'Angebot bearbeiten' : 'Edit offer')
      : (locale === 'de' ? 'Anfrage' : 'Request');
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
      {scene === 'detail' && requestId ? (
        <WorkspacePublicRequestDialog
          locale={locale}
          requestId={requestId}
          initialIntent={requestIntent}
          onClose={onDismissSession}
          onOpenRequest={onOpenRequest}
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
