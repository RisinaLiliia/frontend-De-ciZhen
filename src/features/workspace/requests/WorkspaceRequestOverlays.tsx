'use client';

import * as React from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';

import {
  RequestOfferSheet,
  RequestOwnerEditPanel,
} from '@/components/requests/details';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ChatWorkspacePage } from '@/features/chat/ChatWorkspacePage';
import { useRequestOwnerEdit } from '@/features/requests/details/useRequestOwnerEdit';
import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import {
  useWorkspaceProviderOfferSheetActions,
  useWorkspaceRequestDecisionActions,
  useWorkspaceRequestOfferActions,
} from '@/features/workspace/requests/useWorkspaceRequestOverlayActions';
import {
  cardlessTitle,
  formatDialogDate,
  formatDialogPrice,
  formatOfferTimestamp,
  resolveOfferStatusBadge,
  toDateTimeLocalValue,
  useWorkspaceManagedRequestData,
  useWorkspaceProviderOfferSheetData,
  useWorkspaceRequestDecisionData,
  useWorkspaceRequestOffersData,
} from '@/features/workspace/requests/useWorkspaceRequestOverlayData';
import type { RequestDialogIntent } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';
import {
  normalizeAppImageSrc,
  shouldBypassNextImageOptimization,
} from '@/lib/requests/images';

function WorkspaceRequestOffersSection({
  locale,
  requestId,
  onOpenChatConversation,
}: {
  locale: Locale;
  requestId: string;
  onOpenChatConversation: (payload: WorkspaceChatConversationInput) => void;
}) {
  const { actionableOffers, acceptedOfferId, isError, isLoading } = useWorkspaceRequestOffersData(requestId);
  const {
    acceptRequestOffer,
    declineRequestOffer,
    pendingOfferActionId,
  } = useWorkspaceRequestOfferActions({ locale, requestId });

  return (
    <div className="my-request-dialog__section">
      <div className="my-request-dialog__section-head">
        <div>
          <h3>{locale === 'de' ? 'Angebote' : 'Offers'}</h3>
          <p className="my-request-dialog__section-subtitle">
            {locale === 'de'
              ? 'Treffe die Entscheidung direkt in diesem Workspace.'
              : 'Make the decision directly in this workspace.'}
          </p>
        </div>
        <span className="my-request-dialog__section-count">
          {actionableOffers.length}
        </span>
      </div>

      {isLoading ? (
        <div className="my-request-dialog__offer-list">
          {Array.from({ length: 2 }).map((_, index) => (
            <article key={`offer-skeleton-${index}`} className="my-request-offer-card">
              <div className="skeleton h-6 w-32" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-16 w-full" />
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && isError ? (
        <p className="my-request-dialog__section-subtitle">
          {locale === 'de' ? 'Angebote konnten nicht geladen werden.' : 'Offers could not be loaded.'}
        </p>
      ) : null}

      {!isLoading && !isError && actionableOffers.length === 0 ? (
        <p className="my-request-dialog__section-subtitle">
          {locale === 'de'
            ? 'Noch keine aktiven Angebote für diese Anfrage.'
            : 'No active offers for this request yet.'}
        </p>
      ) : null}

      {!isLoading && !isError && actionableOffers.length > 0 ? (
        <div className="my-request-dialog__offer-list">
          {actionableOffers.map((offer) => {
            const statusBadge = resolveOfferStatusBadge(locale, offer.status);
            const isAccepted = offer.status === 'accepted';
            const isDeclined = offer.status === 'declined';
            const isBusy = pendingOfferActionId === offer.id;
            const isDecisionLocked = Boolean(acceptedOfferId && acceptedOfferId !== offer.id);
            const canAccept = !isAccepted && !isDeclined && !isDecisionLocked;
            const canDecline = !isAccepted && !isDeclined;
            const offerAmount = formatDialogPrice(locale, offer.amount);
            const sentAt = formatOfferTimestamp(locale, offer.createdAt);
            const availability = offer.availabilityNote?.trim() || formatOfferTimestamp(locale, offer.availableAt);

            return (
              <article key={offer.id} className={`my-request-offer-card ${isAccepted ? 'is-accepted' : ''}`.trim()}>
                <div className="my-request-offer-card__head">
                  <div className="my-request-offer-card__identity">
                    <strong>{offer.providerDisplayName?.trim() || (locale === 'de' ? 'Dienstleister' : 'Provider')}</strong>
                    <span>{sentAt || '—'}</span>
                  </div>
                  <div className="my-request-offer-card__status">
                    {offerAmount ? (
                      <strong className="my-request-offer-card__price">{offerAmount}</strong>
                    ) : null}
                    <span className={statusBadge.className}>{statusBadge.label}</span>
                  </div>
                </div>

                {(offer.message?.trim() || availability || offer.providerCompletedJobs || offer.providerRatingAvg) ? (
                  <div className="my-request-offer-card__body">
                    {offer.message?.trim() ? (
                      <p className="my-request-offer-card__message">{offer.message.trim()}</p>
                    ) : null}
                    <div className="my-request-offer-card__meta">
                      {availability ? (
                        <span>{locale === 'de' ? `Verfügbarkeit: ${availability}` : `Availability: ${availability}`}</span>
                      ) : null}
                      {typeof offer.providerCompletedJobs === 'number' ? (
                        <span>
                          {locale === 'de'
                            ? `${offer.providerCompletedJobs} Aufträge abgeschlossen`
                            : `${offer.providerCompletedJobs} jobs completed`}
                        </span>
                      ) : null}
                      {typeof offer.providerRatingAvg === 'number' ? (
                        <span>
                          {locale === 'de'
                            ? `Bewertung ${offer.providerRatingAvg.toFixed(1)}`
                            : `Rating ${offer.providerRatingAvg.toFixed(1)}`}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="my-request-offer-card__actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={!offer.providerUserId || isBusy}
                    onClick={() => onOpenChatConversation({
                      relatedEntity: { type: 'offer', id: offer.id },
                      participantUserId: offer.providerUserId,
                      participantRole: 'provider',
                      requestId: offer.requestId,
                      providerUserId: offer.providerUserId,
                      offerId: offer.id,
                    })}
                  >
                    {locale === 'de' ? 'Chat' : 'Chat'}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost is-primary"
                    disabled={!canAccept || isBusy}
                    onClick={() => {
                      void acceptRequestOffer(offer.id);
                    }}
                  >
                    {isBusy && pendingOfferActionId === offer.id
                      ? (locale === 'de' ? 'Speichern…' : 'Saving…')
                      : (locale === 'de' ? 'Annehmen' : 'Accept')}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={!canDecline || isBusy}
                    onClick={() => {
                      void declineRequestOffer(offer.id);
                    }}
                  >
                    {locale === 'de' ? 'Ablehnen' : 'Decline'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceRequestDecisionSection({
  locale,
  card,
  onOpenChatConversation,
}: {
  locale: Locale;
  card: MyRequestsViewCard;
  onOpenChatConversation: (payload: WorkspaceChatConversationInput) => void;
}) {
  const [startAt, setStartAt] = React.useState(() => toDateTimeLocalValue());
  const [durationMin, setDurationMin] = React.useState('120');
  const [note, setNote] = React.useState('');
  const {
    completeRequestContract,
    confirmRequestContract,
    isSubmittingDecision,
  } = useWorkspaceRequestDecisionActions({
    locale,
    requestId: card.requestId,
  });
  const {
    chatInput,
    chatLabel,
    contract,
    contractMeta,
  } = useWorkspaceRequestDecisionData({ card, locale });

  React.useEffect(() => {
    if (!contract?.createdAt) return;
    setStartAt((current) => (current ? current : toDateTimeLocalValue(contract.createdAt)));
  }, [contract?.createdAt]);

  if (card.decision.actionType === 'review_offers' || card.decision.actionType === 'none') {
    return null;
  }

  return (
    <div className="my-request-dialog__section my-request-dialog__section--decision">
      <div className="my-request-dialog__section-head">
        <div>
          <h3>{card.decision.actionLabel?.trim() || (locale === 'de' ? 'Nächster Schritt' : 'Next step')}</h3>
          <p className="my-request-dialog__section-subtitle">
            {card.decision.actionReason?.trim()
              || (locale === 'de'
                ? 'Bearbeite den nächsten Schritt direkt hier im Workspace.'
                : 'Handle the next step directly here in the workspace.')}
          </p>
        </div>
        <span className="my-request-dialog__section-count">
          {card.decision.actionPriorityLevel === 'high' ? '!' : 'i'}
        </span>
      </div>

      {contractMeta ? (
        <p className="my-request-dialog__section-subtitle">{contractMeta}</p>
      ) : null}

      {(card.decision.actionType === 'reply_required' || card.decision.actionType === 'overdue_followup') && chatInput ? (
        <div className="my-request-dialog__actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onOpenChatConversation(chatInput)}
          >
            {chatLabel}
          </button>
        </div>
      ) : null}

      {card.decision.actionType === 'confirm_contract' ? (
        contract ? (
          <div className="my-request-decision-form">
            <label className="my-request-decision-form__field">
              <span>{locale === 'de' ? 'Start' : 'Start'}</span>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
                disabled={isSubmittingDecision || contract.status !== 'pending'}
              />
            </label>
            <label className="my-request-decision-form__field">
              <span>{locale === 'de' ? 'Dauer (Min.)' : 'Duration (min)'}</span>
              <Input
                type="number"
                min={15}
                step={15}
                value={durationMin}
                onChange={(event) => setDurationMin(event.target.value)}
                disabled={isSubmittingDecision || contract.status !== 'pending'}
              />
            </label>
            <label className="my-request-decision-form__field">
              <span>{locale === 'de' ? 'Hinweis' : 'Note'}</span>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={isSubmittingDecision || contract.status !== 'pending'}
                placeholder={locale === 'de' ? 'Optionaler Hinweis für den Vertrag' : 'Optional note for the contract'}
              />
            </label>
            <div className="my-request-dialog__actions">
              {chatInput ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onOpenChatConversation(chatInput)}
                  disabled={isSubmittingDecision}
                >
                  {chatLabel}
                </button>
              ) : null}
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (!contract?.id || !startAt) return;
                  void confirmRequestContract({
                    contractId: contract.id,
                    startAt,
                    durationMin,
                    note,
                  });
                }}
                disabled={isSubmittingDecision || contract.status !== 'pending' || !startAt}
              >
                {isSubmittingDecision
                  ? (locale === 'de' ? 'Speichern…' : 'Saving…')
                  : (locale === 'de' ? 'Vertrag bestätigen' : 'Confirm contract')}
              </button>
            </div>
          </div>
        ) : (
          <p className="my-request-dialog__section-subtitle">
            {locale === 'de'
              ? 'Vertragsdaten sind noch nicht verfügbar.'
              : 'Contract details are not available yet.'}
          </p>
        )
      ) : null}

      {card.decision.actionType === 'confirm_completion' ? (
        contract ? (
          <div className="my-request-dialog__actions">
            {chatInput ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onOpenChatConversation(chatInput)}
                disabled={isSubmittingDecision}
              >
                {chatLabel}
              </button>
            ) : null}
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (!contract?.id) return;
                void completeRequestContract(contract.id);
              }}
              disabled={isSubmittingDecision || contract.status === 'completed' || contract.status === 'cancelled'}
            >
              {isSubmittingDecision
                ? (locale === 'de' ? 'Speichern…' : 'Saving…')
                : (locale === 'de' ? 'Abschluss bestätigen' : 'Confirm completion')}
            </button>
          </div>
        ) : (
          <p className="my-request-dialog__section-subtitle">
            {locale === 'de'
              ? 'Für diese Anfrage wurde noch kein Vertrag gefunden.'
              : 'No contract has been found for this request yet.'}
          </p>
        )
      ) : null}
    </div>
  );
}

export function WorkspaceManagedRequestDialog({
  locale,
  card,
  initialIntent,
  onClose,
  onOpenOfferSheet,
  onOpenChatConversation,
}: {
  locale: Locale;
  card: MyRequestsViewCard;
  initialIntent: RequestDialogIntent;
  onClose: () => void;
  onOpenOfferSheet: (requestId: string) => void;
  onOpenChatConversation: (payload: WorkspaceChatConversationInput) => void;
}) {
  const t = useT();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useWorkspaceManagedRequestData({
    locale,
    requestId: card.requestId,
  });
  const request = data?.request ?? null;
  const isOwner = data?.source === 'owner';
  const ownerEdit = useRequestOwnerEdit({
    request,
    isOwner,
    showOwnerBadge: isOwner,
    shouldOpenOwnerEdit: initialIntent === 'edit',
    qc,
    t,
  });
  const visiblePhotos = ownerEdit.isOwnerEditMode
    ? ownerEdit.ownerPhotos
    : (request?.photos ?? []).filter(Boolean).slice(0, 4);
  const statusLabel = card.status.badgeLabel?.trim() || request?.status?.trim() || null;
  const dateLabel = formatDialogDate(locale, request?.preferredDate) || card.requestPreview.dateLabel || null;
  const priceLabel = formatDialogPrice(locale, request?.price) || card.requestPreview.priceLabel || null;
  const cityLabel = request?.cityName?.trim() || card.requestPreview.cityLabel || null;
  const description = (ownerEdit.isOwnerEditMode
    ? ownerEdit.ownerDescription
    : request?.description)?.trim() || card.requestPreview.excerpt?.trim() || null;
  const offerAction = card.status.actions.find(
    (action) => action.kind === 'send_offer' || action.kind === 'edit_offer',
  );
  const chatAction = card.status.actions.find(
    (action) => action.kind === 'open_chat' && Boolean(action.chatInput),
  );
  const chatInput = chatAction?.chatInput ?? null;
  const chatLabel = chatAction?.label ?? (locale === 'de' ? 'Chat' : 'Chat');

  return (
    <div
      className="dc-modal my-request-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`workspace-request-dialog-${card.requestId}`}
    >
      <button
        type="button"
        className="dc-modal__backdrop"
        onClick={onClose}
        aria-label={locale === 'de' ? 'Dialog schließen' : 'Close dialog'}
      />
      <div className="dc-modal__panel dc-modal__panel--wide my-request-dialog__panel">
        <div className="my-request-dialog__header">
          <div className="my-request-dialog__header-copy">
            <span className="my-request-dialog__eyebrow">{card.requestPreview.categoryLabel}</span>
            <h2 id={`workspace-request-dialog-${card.requestId}`} className="my-request-dialog__title">
              {ownerEdit.isOwnerEditMode && ownerEdit.ownerTitle.trim()
                ? ownerEdit.ownerTitle.trim()
                : card.requestPreview.title}
            </h2>
            <div className="my-request-dialog__meta">
              {cityLabel ? <span>{cityLabel}</span> : null}
              {dateLabel ? <span>{dateLabel}</span> : null}
              {priceLabel ? <span>{priceLabel}</span> : null}
              {statusLabel ? <span>{statusLabel}</span> : null}
            </div>
          </div>
          <button
            type="button"
            className="my-request-dialog__close"
            onClick={onClose}
            aria-label={locale === 'de' ? 'Dialog schließen' : 'Close dialog'}
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="my-request-dialog__state">
            <div className="skeleton h-8 w-56" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-10 w-40" />
          </div>
        ) : null}

        {!isLoading && (isError || !request) ? (
          <div className="my-request-dialog__state">
            <h3>{locale === 'de' ? 'Anfrage konnte nicht geladen werden.' : 'Request could not be loaded.'}</h3>
            <p>{locale === 'de' ? 'Bitte versuche es erneut.' : 'Please try again.'}</p>
          </div>
        ) : null}

        {!isLoading && request ? (
          <div className="my-request-dialog__body">
            {isOwner ? (
              <>
                {!ownerEdit.isOwnerEditMode ? (
                  <div className="my-request-dialog__toolbar">
                    <span className="my-request-dialog__badge">{statusLabel ?? request.status}</span>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => ownerEdit.setIsOwnerEditMode(true)}
                    >
                      {locale === 'de' ? 'Bearbeiten' : 'Edit'}
                    </button>
                  </div>
                ) : null}
                <RequestOwnerEditPanel
                  isEditMode={ownerEdit.isOwnerEditMode}
                  showPublishAction={request.status === 'draft'}
                  isSaving={ownerEdit.isSavingOwner}
                  isUploadingPhoto={ownerEdit.isUploadingOwnerPhoto}
                  activeSubmitIntent={ownerEdit.activeOwnerSubmitIntent}
                  titleValue={ownerEdit.ownerTitle}
                  descriptionValue={ownerEdit.ownerDescription}
                  priceValue={ownerEdit.ownerPrice}
                  priceTrend={ownerEdit.ownerPriceTrend}
                  photos={ownerEdit.ownerPhotos}
                  ownerEditLabel={t(I18N_KEYS.requestDetails.ownerEdit)}
                  ownerClearLabel={t(I18N_KEYS.requestDetails.ownerClear)}
                  titlePlaceholder={t(I18N_KEYS.request.titlePlaceholder)}
                  titleLabel={t(I18N_KEYS.request.titleLabel)}
                  descriptionPlaceholder={t(I18N_KEYS.request.descriptionPlaceholder)}
                  descriptionLabel={t(I18N_KEYS.request.descriptionLabel)}
                  pricePlaceholder={t(I18N_KEYS.request.pricePlaceholder)}
                  priceLabel={t(I18N_KEYS.request.priceLabel)}
                  removePhotoLabel={t(I18N_KEYS.request.removePhoto)}
                  addPhotoLabel={t(I18N_KEYS.request.photosButton)}
                  photosHintLabel={t(I18N_KEYS.requestDetails.ownerPhotosHint)}
                  cancelLabel={t(I18N_KEYS.requestDetails.ownerCancel)}
                  saveLabel={request.status === 'draft'
                    ? t(I18N_KEYS.request.submitDraft)
                    : t(I18N_KEYS.requestDetails.ownerSave)}
                  publishLabel={t(I18N_KEYS.request.submitPublish)}
                  priceTrendDownLabel={t(I18N_KEYS.requestDetails.ownerPriceTrendDown)}
                  priceTrendUpLabel={t(I18N_KEYS.requestDetails.ownerPriceTrendUp)}
                  onToggleEdit={() => ownerEdit.setIsOwnerEditMode((prev) => !prev)}
                  onClearText={ownerEdit.handleOwnerClearText}
                  onTitleChange={ownerEdit.setOwnerTitle}
                  onDescriptionChange={ownerEdit.setOwnerDescription}
                  onPriceChange={ownerEdit.setOwnerPrice}
                  onPhotoPick={(files) => {
                    void ownerEdit.handleOwnerPhotoPick(files);
                  }}
                  onRemovePhoto={(index) => {
                    ownerEdit.setOwnerPhotos((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
                  }}
                  onCancelEdit={() => ownerEdit.setIsOwnerEditMode(false)}
                  onSave={(intent) => {
                    void ownerEdit.handleOwnerSave(intent);
                  }}
                />
                {!ownerEdit.isOwnerEditMode ? (
                  <WorkspaceRequestDecisionSection
                    locale={locale}
                    card={card}
                    onOpenChatConversation={onOpenChatConversation}
                  />
                ) : null}
                {!ownerEdit.isOwnerEditMode ? (
                  <WorkspaceRequestOffersSection
                    locale={locale}
                    requestId={card.requestId}
                    onOpenChatConversation={onOpenChatConversation}
                  />
                ) : null}
              </>
            ) : null}

            {!isOwner ? (
              <>
                {visiblePhotos.length > 0 ? (
                  <div className="my-request-dialog__photos">
                    {visiblePhotos.map((photo, index) => {
                      const safeSrc = normalizeAppImageSrc(photo);
                      return (
                        <div key={`${photo}-${index}`} className="my-request-dialog__photo">
                          <Image
                            src={safeSrc}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 50vw, 200px"
                            unoptimized={shouldBypassNextImageOptimization(safeSrc)}
                            className="my-request-dialog__photo-img"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {description ? (
                  <div className="my-request-dialog__section">
                    <h3>{locale === 'de' ? 'Beschreibung' : 'Description'}</h3>
                    <p>{description}</p>
                  </div>
                ) : null}
                {(offerAction || chatAction) ? (
                  <div className="my-request-dialog__actions">
                    {offerAction ? (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => onOpenOfferSheet(card.requestId)}
                      >
                        {offerAction.label}
                      </button>
                    ) : null}
                    {chatInput ? (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onOpenChatConversation(chatInput)}
                      >
                        {chatLabel}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}

            {isOwner && !ownerEdit.isOwnerEditMode && description ? (
              <div className="my-request-dialog__section">
                <h3>{locale === 'de' ? 'Beschreibung' : 'Description'}</h3>
                <p>{description}</p>
              </div>
            ) : null}

            {isOwner && !ownerEdit.isOwnerEditMode && visiblePhotos.length > 0 ? (
              <div className="my-request-dialog__photos">
                {visiblePhotos.map((photo, index) => {
                  const safeSrc = normalizeAppImageSrc(photo);
                  return (
                    <div key={`${photo}-${index}`} className="my-request-dialog__photo">
                      <Image
                        src={safeSrc}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 50vw, 200px"
                        unoptimized={shouldBypassNextImageOptimization(safeSrc)}
                        className="my-request-dialog__photo-img"
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function WorkspaceManagedOfferSheet({
  locale,
  requestId,
  onClose,
}: {
  locale: Locale;
  requestId: string;
  onClose: () => void;
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
    return (
      <div className="dc-modal my-request-dialog" role="dialog" aria-modal="true">
        <button
          type="button"
          className="dc-modal__backdrop"
          onClick={onClose}
          aria-label={locale === 'de' ? 'Dialog schließen' : 'Close dialog'}
        />
        <div className="dc-modal__panel dc-modal__panel--compact my-request-dialog__panel">
          <div className="my-request-dialog__state">
            <div className="skeleton h-8 w-48" />
            <div className="skeleton h-24 w-full" />
          </div>
        </div>
      </div>
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
      previewTitle={request.title?.trim() || cardlessTitle(locale)}
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
      successTipCardBody={locale === 'de'
        ? 'Vervollständige dein Profil später im Workspace, falls du mehr Vertrauen aufbauen willst.'
        : 'You can complete your profile later in the workspace if you want to build more trust.'}
      successProfileCta={t(I18N_KEYS.requestDetails.responseProfileCta)}
      successContinueCta={t(I18N_KEYS.requestDetails.responseContinueCta)}
      successProfileHref="/workspace?section=requests&scope=my"
      showProfileAdvice={false}
      profileStatusLabel={locale === 'de' ? 'Workspace' : 'Workspace'}
      isSubmitting={isSubmittingOffer}
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
  locale,
  conversationId,
  title,
  onClose,
}: {
  locale: Locale;
  conversationId: string;
  title: string;
  onClose: () => void;
}) {
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
        aria-label={locale === 'de' ? 'Chat schließen' : 'Close chat'}
      />
      <div className="dc-modal__panel dc-modal__panel--wide my-request-chat-dialog__panel">
        <div className="my-request-chat-dialog__header">
          <div>
            <span className="my-request-chat-dialog__eyebrow">
              {locale === 'de' ? 'Nachrichten' : 'Messages'}
            </span>
            <h2 id={`workspace-chat-dialog-${conversationId}`} className="my-request-chat-dialog__title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="my-request-chat-dialog__close"
            onClick={onClose}
            aria-label={locale === 'de' ? 'Chat schließen' : 'Close chat'}
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
