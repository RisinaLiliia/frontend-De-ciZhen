'use client';

import * as React from 'react';

import { RequestOfferSheet } from '@/components/requests/details';
import { ChatWorkspacePage } from '@/features/workspace/chat/ChatWorkspacePage';
import {
  useWorkspaceProviderOfferSheetActions,
} from '@/features/workspace/overlays/useWorkspaceRequestOverlayActions';
import {
  cardlessTitle,
  formatDialogDate,
  formatDialogPrice,
  useWorkspaceProviderOfferSheetData,
} from '@/features/workspace/overlays/useWorkspaceRequestOverlayData';
import {
  WorkspaceCompactModalPortal,
  WorkspaceInlineStateCard,
} from '@/features/workspace/overlays/WorkspaceOverlayPrimitives';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';

export function WorkspaceManagedOfferSheet({
  locale,
  requestId,
  onClose,
  surface = 'modal',
}: {
  locale: Locale;
  requestId: string;
  onClose: () => void;
  surface?: 'modal' | 'embedded';
}) {
  const t = useT();
  const { existingResponse, isError, isLoading, request } = useWorkspaceProviderOfferSheetData({
    locale,
    requestId,
  });
  const [offerAmount, setOfferAmount] = React.useState('');
  const [offerComment, setOfferComment] = React.useState('');
  const [offerAvailability, setOfferAvailability] = React.useState('');
  const [offerSheetMode, setOfferSheetMode] = React.useState<'form' | 'success'>('form');

  React.useEffect(() => {
    if (!request) return;
    if (existingResponse) {
      setOfferAmount(
        typeof existingResponse.amount === 'number'
          ? String(Math.max(1, Math.round(existingResponse.amount)))
          : '',
      );
      setOfferComment(existingResponse.message ?? '');
      setOfferAvailability(existingResponse.availabilityNote ?? existingResponse.availableAt ?? '');
      return;
    }

    setOfferAmount(
      typeof request.price === 'number' && Number.isFinite(request.price)
        ? String(Math.max(1, Math.round(request.price)))
        : '',
    );
    setOfferComment('');
    setOfferAvailability('');
  }, [existingResponse, request]);

  const resetDraft = React.useCallback(() => {
    setOfferSheetMode('form');
    setOfferAmount('');
    setOfferComment('');
    setOfferAvailability('');
  }, []);
  const {
    cancelProviderOffer,
    isSubmittingOffer,
    submitProviderOffer,
  } = useWorkspaceProviderOfferSheetActions({
    onClose,
    onResetDraft: resetDraft,
    request,
    requestId,
    existingResponse,
  });

  const handleSuccessBack = React.useCallback(() => {
    resetDraft();
    onClose();
  }, [onClose, resetDraft]);

  if (isLoading || (!request && !isError)) {
    return surface === 'embedded' ? (
      <div className="my-request-dialog__state">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-24 w-full" />
      </div>
    ) : (
      <WorkspaceCompactModalPortal
        locale={locale}
        ariaLabel={t(I18N_KEYS.requestDetails.workspaceOfferFallbackTitle)}
        onClose={onClose}
      >
        <div className="my-request-dialog__state">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-24 w-full" />
        </div>
      </WorkspaceCompactModalPortal>
    );
  }

  if (!request && isError) {
    return surface === 'embedded' ? (
      <div className="my-request-dialog__state">
        <WorkspaceInlineStateCard
          locale={locale}
          tone="error"
          title={t(I18N_KEYS.requestDetails.workspaceOfferLoadErrorTitle)}
          body={t(I18N_KEYS.requestDetails.workspaceOfferLoadErrorBody)}
        />
      </div>
    ) : (
      <WorkspaceCompactModalPortal
        locale={locale}
        ariaLabel={t(I18N_KEYS.requestDetails.workspaceOfferFallbackTitle)}
        onClose={onClose}
      >
        <div className="my-request-dialog__state">
          <WorkspaceInlineStateCard
            locale={locale}
            tone="error"
            title={t(I18N_KEYS.requestDetails.workspaceOfferLoadErrorTitle)}
            body={t(I18N_KEYS.requestDetails.workspaceOfferLoadErrorBody)}
          />
        </div>
      </WorkspaceCompactModalPortal>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <RequestOfferSheet
      isOpen={true}
      mode={offerSheetMode}
      title={existingResponse
        ? t(I18N_KEYS.requestDetails.responseEditTitle)
        : t(I18N_KEYS.requestDetails.responseFormTitle)}
      previewTitle={request.title?.trim() || cardlessTitle(t)}
      previewCity={request.cityName?.trim() || '—'}
      previewDate={formatDialogDate(locale, request.preferredDate) || '—'}
      previewPrice={formatDialogPrice(locale, request.price)}
      amountLabel={t(I18N_KEYS.requestDetails.responseAmountLabel)}
      amountValue={offerAmount}
      amountPlaceholder="120"
      commentLabel={t(I18N_KEYS.requestDetails.responseCommentLabel)}
      commentValue={offerComment}
      commentPlaceholder={t(I18N_KEYS.requestDetails.responseCommentPlaceholder)}
      availabilityLabel={t(I18N_KEYS.requestDetails.responseAvailabilityLabel)}
      availabilityValue={offerAvailability}
      availabilityPlaceholder={t(I18N_KEYS.requestDetails.responseAvailabilityPlaceholder)}
      submitLabel={existingResponse
        ? t(I18N_KEYS.requestDetails.responseEditSubmit)
        : t(I18N_KEYS.requestDetails.responseSubmit)}
      submitKind={existingResponse ? 'edit' : 'submit'}
      cancelLabel={existingResponse
        ? t(I18N_KEYS.requestDetails.responseCancel)
        : t(I18N_KEYS.common.back)}
      cancelKind={existingResponse ? 'delete' : 'back'}
      closeLabel={t(I18N_KEYS.requestDetails.responseClose)}
      successTitle={t(I18N_KEYS.requestDetails.responseSuccessTitle)}
      successBody={t(I18N_KEYS.requestDetails.responseSuccessBody)}
      successSubline={t(I18N_KEYS.requestDetails.responseSuccessSubline)}
      successTipTitle={t(I18N_KEYS.requestDetails.responseSuccessTipTitle)}
      successTipCardTitle={t(I18N_KEYS.requestDetails.responseSuccessTipCardTitle)}
      successTipCardBody={t(I18N_KEYS.requestDetails.workspaceOfferSuccessTipCardBody)}
      successProfileCta={t(I18N_KEYS.requestDetails.responseProfileCta)}
      successContinueCta={t(I18N_KEYS.requestDetails.responseContinueCta)}
      successProfileHref="/workspace?section=requests&scope=my"
      showProfileAdvice={false}
      profileStatusLabel={t(I18N_KEYS.requestDetails.workspaceProfileStatusLabel)}
      isSubmitting={isSubmittingOffer}
      surface={surface}
      showCloseButton={surface !== 'embedded'}
      onAmountChange={setOfferAmount}
      onCommentChange={setOfferComment}
      onAvailabilityChange={setOfferAvailability}
      onClose={onClose}
      onCancel={() => {
        void cancelProviderOffer();
      }}
      onSuccessBack={handleSuccessBack}
      onSubmit={() => {
        void submitProviderOffer({
          amountValue: offerAmount,
          commentValue: offerComment,
          availabilityValue: offerAvailability,
        }).then((result) => {
          if (result === 'created') {
            setOfferSheetMode('success');
          }
        });
      }}
    />
  );
}

export function WorkspaceChatDialog({
  conversationId,
  title,
  onClose,
}: {
  locale: Locale;
  conversationId: string;
  title: string;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <div
      className="dc-modal my-request-chat-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`workspace-chat-dialog-${conversationId}`}
    >
      <button
        type="button"
        className="dc-modal__backdrop"
        onClick={onClose}
        aria-label={t(I18N_KEYS.requestDetails.workspaceChatCloseLabel)}
      />
      <div className="dc-modal__panel dc-modal__panel--wide my-request-chat-dialog__panel">
        <div className="my-request-chat-dialog__header">
          <div>
            <span className="my-request-chat-dialog__eyebrow">
              {t(I18N_KEYS.workspace.messagesTitle)}
            </span>
            <h2 id={`workspace-chat-dialog-${conversationId}`} className="my-request-chat-dialog__title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="my-request-chat-dialog__close"
            onClick={onClose}
            aria-label={t(I18N_KEYS.requestDetails.workspaceChatCloseLabel)}
          >
            ×
          </button>
        </div>
        <ChatWorkspacePage
          embeddedConversationId={conversationId}
          className="my-request-chat-dialog__content"
        />
      </div>
    </div>
  );
}
