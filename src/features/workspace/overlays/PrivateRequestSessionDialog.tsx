'use client';

import * as React from 'react';

import { BackButton } from '@/components/layout/BackButton';
import { ChatWorkspacePage } from '@/features/chat/ChatWorkspacePage';
import { RequestDialogShell } from '@/features/workspace/overlays/RequestDialogShell';
import {
  WorkspaceManagedOfferSheet,
  WorkspaceManagedRequestDialog,
} from '@/features/workspace/overlays/RequestOverlays';
import type { RequestDialogIntent } from '@/features/workspace/overlays/useWorkspaceRequestOverlayFlow';
import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';
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
  presentation?: 'modal' | 'inline';
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

export function PrivateRequestSessionDialog({
  locale,
  presentation = 'modal',
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

  const t = (key: typeof I18N_KEYS.workspace[keyof typeof I18N_KEYS.workspace] | typeof I18N_KEYS.requestDetails[keyof typeof I18N_KEYS.requestDetails] | typeof I18N_KEYS.auth[keyof typeof I18N_KEYS.auth] | typeof I18N_KEYS.requestsPage[keyof typeof I18N_KEYS.requestsPage]) => translate(key, locale);
  const ariaLabel = scene === 'chat'
    ? activeChatState?.title || t(I18N_KEYS.workspace.messagesTitle)
    : scene === 'offer_edit'
      ? t(I18N_KEYS.requestDetails.workspaceEditOffer)
      : activeRequestCard?.requestPreview.title || t(I18N_KEYS.requestDetails.workspaceRequestFallbackTitle);
  const sceneTitle = t(I18N_KEYS.requestsPage.navChat);
  const sceneSubtitle = activeChatState?.title || t(I18N_KEYS.workspace.requestConversationSubtitle);

  return (
    <RequestDialogShell
      locale={locale}
      ariaLabel={ariaLabel}
      onClose={onDismissSession}
      isLoading={false}
      isError={false}
      errorTitle=""
      errorBody=""
      bodyVariant={scene === 'detail' ? 'details' : 'default'}
      presentation={presentation}
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
    </RequestDialogShell>
  );
}
