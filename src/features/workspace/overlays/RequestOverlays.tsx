'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  RequestDetailsContent,
  useRequestDetailsContentState,
} from '@/features/workspace/requests/workspaceRequestDetailsFacade';
import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import { RequestDialogShell } from '@/features/workspace/overlays/RequestDialogShell';
import {
  useWorkspaceManagedRequestData,
} from '@/features/workspace/requests/useWorkspaceRequestOverlayData';
import {
  WorkspaceRequestDecisionSection,
  WorkspaceRequestOffersSection,
} from '@/features/workspace/requests/ManagedRequestSections';
import { hasOwnerRequestManagementCapability } from '@/features/workspace/requests/requestOwnerMenu.model';
import {
  resolveWorkspaceRequestChatAction,
  resolveWorkspaceRequestOfferAction,
} from '@/features/workspace/requests/workspaceRequestActionResolvers';
import type { RequestDialogIntent } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';

export { WorkspaceChatDialog, WorkspaceManagedOfferSheet } from '@/features/workspace/overlays/RequestSecondaryOverlays';

export function WorkspaceManagedRequestDialog({
  locale,
  card,
  initialIntent,
  onClose,
  onOpenOfferSheet,
  onOpenChatConversation,
  surface = 'modal',
}: {
  locale: Locale;
  card: MyRequestsViewCard;
  initialIntent: RequestDialogIntent;
  onClose: () => void;
  onOpenOfferSheet: (requestId: string) => void;
  onOpenChatConversation: (payload: WorkspaceChatConversationInput) => void;
  surface?: 'modal' | 'embedded';
}) {
  const t = useT();
  const qc = useQueryClient();
  const isCustomerRequest = card.role === 'customer';
  const canManageRequest = React.useMemo(
    () => hasOwnerRequestManagementCapability(card),
    [card],
  );
  const { data, isLoading, isError } = useWorkspaceManagedRequestData({
    locale,
    requestId: card.requestId,
    attemptOwner: isCustomerRequest,
    preferOwner: canManageRequest && initialIntent === 'edit',
  });
  const request = data?.request ?? null;
  const isOwner = canManageRequest && data?.source === 'owner';
  const {
    activeOwnerSubmitIntent,
    applyLabel,
    applyState,
    applyTitle,
    formatPriceValue,
    handleOwnerClearText,
    handleOwnerPhotoPick,
    handleOwnerSave,
    isOwnerEditMode,
    isSavingOwner,
    isUploadingOwnerPhoto,
    ownerDescription,
    ownerPhotos,
    ownerPrice,
    ownerPriceTrend,
    ownerCityId,
    ownerTitle,
    ownerPreferredDate,
    requestPriceTrend,
    requestPriceTrendLabel,
    requestStatusView,
    setIsOwnerEditMode,
    setOwnerDescription,
    setOwnerCityId,
    setOwnerPhotos,
    setOwnerPrice,
    setOwnerPreferredDate,
    setOwnerTitle,
    similarTitle,
    similarFallbackMessage,
    similarForRender,
    similarHref,
    viewModel,
  } = useRequestDetailsContentState({
    request,
    locale,
    t,
    qc,
    isOwner,
    shouldOpenOwnerEdit: initialIntent === 'edit',
    hasOffer: false,
    isOfferAccepted: false,
    providerProfile: null,
    includeRelated: !canManageRequest,
  });
  const offerAction = resolveWorkspaceRequestOfferAction(card);
  const chatAction = resolveWorkspaceRequestChatAction(card);
  const chatInput = chatAction?.chatInput ?? null;
  const effectiveApplyLabel = offerAction?.label ?? applyLabel;
  const effectiveApplyState = offerAction?.kind === 'edit_offer' ? 'edit' : applyState;
  const effectiveApplyTitle = offerAction?.kind === 'edit_offer'
    ? offerAction.label
    : applyTitle;
  const resolvedRequest = request ?? null;
  const resolvedViewModel = viewModel ?? null;
  const hasResolvedContent = Boolean(resolvedRequest && resolvedViewModel);
  const showManagedRequestSidebar = isCustomerRequest && !isOwnerEditMode;
  const decisionSection = (
    <WorkspaceRequestDecisionSection
      locale={locale}
      card={card}
      initialIntent={initialIntent}
      onOpenChatConversation={onOpenChatConversation}
    />
  );
  const offersSection = (
    <WorkspaceRequestOffersSection
      locale={locale}
      requestId={card.requestId}
      onOpenChatConversation={onOpenChatConversation}
    />
  );
  const content = hasResolvedContent ? (
    <RequestDetailsContent
      t={t}
      locale={locale}
      request={resolvedRequest!}
      viewModel={resolvedViewModel!}
      surface="dialog"
      requestStatusView={requestStatusView}
      requestPriceTrend={requestPriceTrend}
      requestPriceTrendLabel={requestPriceTrendLabel}
      applyLabel={effectiveApplyLabel}
      applyState={effectiveApplyState}
      applyTitle={effectiveApplyTitle}
      showOfferCta={!isOwner && Boolean(offerAction)}
      showChatCta={!isOwner && Boolean(chatInput)}
      showFavoriteCta={false}
      showOwnerBadge={isOwner}
      isSaved={false}
      isSavePending={false}
      onApply={() => {
        if (!offerAction) return;
        onOpenOfferSheet(card.requestId);
      }}
      onChat={() => {
        if (!chatInput) return;
        onOpenChatConversation(chatInput);
      }}
      onFavorite={() => {}}
      isOwnerEditMode={isOwnerEditMode}
      ownerTitle={ownerTitle}
      ownerDescription={ownerDescription}
      ownerPrice={ownerPrice}
      ownerCityId={ownerCityId}
      ownerPreferredDate={ownerPreferredDate}
      ownerPhotos={ownerPhotos}
      isSavingOwner={isSavingOwner}
      isUploadingOwnerPhoto={isUploadingOwnerPhoto}
      activeOwnerSubmitIntent={activeOwnerSubmitIntent}
      ownerPriceTrend={ownerPriceTrend}
      onToggleOwnerEdit={() => setIsOwnerEditMode((prev) => !prev)}
      onOwnerClearText={handleOwnerClearText}
      onOwnerTitleChange={setOwnerTitle}
      onOwnerDescriptionChange={setOwnerDescription}
      onOwnerPriceChange={setOwnerPrice}
      onOwnerCityChange={setOwnerCityId}
      onOwnerPreferredDateChange={setOwnerPreferredDate}
      onOwnerPhotoPick={(files) => {
        void handleOwnerPhotoPick(files);
      }}
      onOwnerPhotoRemove={(index) => {
        setOwnerPhotos((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
      }}
      onOwnerCancelEdit={() => setIsOwnerEditMode(false)}
      onOwnerSave={(intent) => {
        void handleOwnerSave(intent);
      }}
      formatPriceValue={formatPriceValue}
      similarTitle={similarTitle}
      similarFallbackMessage={similarFallbackMessage}
      similarForRender={similarForRender}
      similarHref={similarHref}
      showSimilarSection={!showManagedRequestSidebar && !isOwner}
      asideChildren={showManagedRequestSidebar ? (
        initialIntent === 'responses'
          ? (
            <>
              {offersSection}
              {decisionSection}
            </>
          )
          : initialIntent === 'review'
            ? (
              <>
                {decisionSection}
                {offersSection}
              </>
            )
          : (
            <>
              {decisionSection}
              {offersSection}
            </>
          )
      ) : null}
    />
  ) : null;

  if (surface === 'embedded') {
    if (isLoading) {
      return (
        <div className="my-request-dialog__state">
          <div className="skeleton h-8 w-56" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-10 w-40" />
        </div>
      );
    }

    if (isError || !hasResolvedContent) {
      return (
        <div className="my-request-dialog__state">
          <div className="my-request-inline-state my-request-inline-state--error" role="alert">
            <span className="my-request-inline-state__icon" aria-hidden="true">!</span>
            <div className="my-request-inline-state__copy">
              <strong>{t(I18N_KEYS.requestDetails.workspaceLoadErrorTitle)}</strong>
              <p>{t(I18N_KEYS.requestDetails.workspaceLoadErrorBody)}</p>
            </div>
            <span className="my-request-inline-state__meta">
              {t(I18N_KEYS.requestDetails.workspaceInlineMeta)}
            </span>
          </div>
        </div>
      );
    }

    return content;
  }

  return (
    <RequestDialogShell
      locale={locale}
      ariaLabel={card.requestPreview.title}
      onClose={onClose}
      isLoading={isLoading}
      isError={!isLoading && (isError || !hasResolvedContent)}
      errorTitle={t(I18N_KEYS.requestDetails.workspaceLoadErrorTitle)}
      errorBody={t(I18N_KEYS.requestDetails.workspaceLoadErrorBody)}
    >
      {content}
    </RequestDialogShell>
  );
}
