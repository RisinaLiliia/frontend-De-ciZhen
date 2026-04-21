'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';

import {
  RequestOfferSheet,
} from '@/components/requests/details';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ChatWorkspacePage } from '@/features/chat/ChatWorkspacePage';
import { RequestDetailsContent } from '@/features/requests/details/RequestDetailsContent';
import { useRequestDetailsContentState } from '@/features/requests/details/useRequestDetailsContentState';
import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import {
  useWorkspaceProviderOfferSheetActions,
  useWorkspaceRequestDecisionActions,
  useWorkspaceRequestOfferActions,
} from '@/features/workspace/requests/useWorkspaceRequestOverlayActions';
import { WorkspaceRequestDialogShell } from '@/features/workspace/requests/WorkspaceRequestDialogShell';
import {
  cardlessTitle,
  formatDialogDate,
  formatDialogPrice,
  formatOfferTimestamp,
  resolveContractStatusBadge,
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

function WorkspaceInlineStateCard({
  locale,
  title,
  body,
  tone,
}: {
  locale: Locale;
  title: string;
  body: string;
  tone: 'empty' | 'error' | 'info';
}) {
  const icon = tone === 'error'
    ? '!'
    : tone === 'empty'
      ? '0'
      : 'i';

  return (
    <div className={`my-request-inline-state my-request-inline-state--${tone}`.trim()} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="my-request-inline-state__icon" aria-hidden="true">{icon}</span>
      <div className="my-request-inline-state__copy">
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <span className="my-request-inline-state__meta">
        {locale === 'de' ? 'Inline' : 'Inline'}
      </span>
    </div>
  );
}

function WorkspaceCompactModalPortal({
  locale,
  ariaLabel,
  onClose,
  children,
}: {
  locale: Locale;
  ariaLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isMounted]);

  if (!isMounted) return null;

  return createPortal((
    <div className="dc-modal my-request-dialog" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <button
        type="button"
        className="dc-modal__backdrop"
        onClick={onClose}
        aria-label={locale === 'de' ? 'Dialog schließen' : 'Close dialog'}
      />
      <div className="dc-modal__panel dc-modal__panel--compact my-request-dialog__panel">
        {children}
      </div>
    </div>
  ), document.body);
}

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
  const [optimisticOffers, setOptimisticOffers] = React.useState(actionableOffers);

  React.useEffect(() => {
    setOptimisticOffers(actionableOffers);
  }, [actionableOffers]);

  const activeOffers = optimisticOffers;
  const optimisticAcceptedOfferId = activeOffers.find((offer) => offer.status === 'accepted')?.id ?? acceptedOfferId ?? null;

  const handleAccept = React.useCallback(async (offerId: string) => {
    const previous = activeOffers;
    setOptimisticOffers((current) => current.map((offer) => {
      if (offer.id === offerId) {
        return { ...offer, status: 'accepted' };
      }
      return offer.status === 'withdrawn' ? offer : { ...offer };
    }));
    const ok = await acceptRequestOffer(offerId);
    if (!ok) {
      setOptimisticOffers(previous);
    }
  }, [acceptRequestOffer, activeOffers]);

  const handleDecline = React.useCallback(async (offerId: string) => {
    const previous = activeOffers;
    setOptimisticOffers((current) => current.map((offer) => (
      offer.id === offerId ? { ...offer, status: 'declined' } : offer
    )));
    const ok = await declineRequestOffer(offerId);
    if (!ok) {
      setOptimisticOffers(previous);
    }
  }, [activeOffers, declineRequestOffer]);

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
          {activeOffers.length}
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
        <WorkspaceInlineStateCard
          locale={locale}
          tone="error"
          title={locale === 'de' ? 'Angebote konnten nicht geladen werden' : 'Offers could not be loaded'}
          body={locale === 'de'
            ? 'Der Entscheidungsbereich bleibt geöffnet. Bitte versuche es erneut oder öffne den Chat direkt aus der Karte.'
            : 'The decision area stays open. Please try again or open the chat directly from the card.'}
        />
      ) : null}

      {!isLoading && !isError && activeOffers.length === 0 ? (
        <WorkspaceInlineStateCard
          locale={locale}
          tone="empty"
          title={locale === 'de' ? 'Noch keine aktiven Angebote' : 'No active offers yet'}
          body={locale === 'de'
            ? 'Sobald Dienstleister reagieren, kannst du Annahme oder Ablehnung direkt hier erledigen.'
            : 'As soon as providers respond, you can accept or decline directly here.'}
        />
      ) : null}

      {!isLoading && !isError && activeOffers.length > 0 ? (
        <div className="my-request-dialog__offer-list">
          {activeOffers.map((offer) => {
            const statusBadge = resolveOfferStatusBadge(locale, offer.status);
            const isAccepted = offer.status === 'accepted';
            const isDeclined = offer.status === 'declined';
            const isBusy = pendingOfferActionId === offer.id;
            const isDecisionLocked = Boolean(optimisticAcceptedOfferId && optimisticAcceptedOfferId !== offer.id);
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
                      void handleAccept(offer.id);
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
                      void handleDecline(offer.id);
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
  const [optimisticContractStatus, setOptimisticContractStatus] = React.useState<NonNullable<typeof contract>['status'] | null>(contract?.status ?? null);

  React.useEffect(() => {
    setOptimisticContractStatus(contract?.status ?? null);
  }, [contract?.status]);

  React.useEffect(() => {
    if (!contract?.createdAt) return;
    setStartAt((current) => (current ? current : toDateTimeLocalValue(contract.createdAt)));
  }, [contract?.createdAt]);

  if (card.decision.actionType === 'review_offers' || card.decision.actionType === 'none') {
    return null;
  }

  const effectiveContract = contract
    ? { ...contract, status: optimisticContractStatus ?? contract.status }
    : null;
  const effectiveContractMeta = effectiveContract?.priceAmount != null
    ? [
      formatDialogPrice(locale, effectiveContract.priceAmount),
      resolveContractStatusBadge(locale, effectiveContract.status).label,
    ]
      .filter(Boolean)
      .join(' · ')
    : contractMeta;

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

      {effectiveContractMeta ? (
        <p className="my-request-dialog__section-subtitle">{effectiveContractMeta}</p>
      ) : null}

      {(card.decision.actionType === 'reply_required' || card.decision.actionType === 'overdue_followup') && chatInput ? (
        <div className="my-request-dialog__actions my-request-dialog__actions--sticky">
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
        effectiveContract ? (
          <div className="my-request-decision-form">
            <label className="my-request-decision-form__field">
              <span>{locale === 'de' ? 'Start' : 'Start'}</span>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
                disabled={isSubmittingDecision || effectiveContract.status !== 'pending'}
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
                disabled={isSubmittingDecision || effectiveContract.status !== 'pending'}
              />
            </label>
            <label className="my-request-decision-form__field">
              <span>{locale === 'de' ? 'Hinweis' : 'Note'}</span>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={isSubmittingDecision || effectiveContract.status !== 'pending'}
                placeholder={locale === 'de' ? 'Optionaler Hinweis für den Vertrag' : 'Optional note for the contract'}
              />
            </label>
            <div className="my-request-dialog__actions my-request-dialog__actions--sticky">
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
                  if (!effectiveContract?.id || !startAt) return;
                  const previousStatus = optimisticContractStatus;
                  setOptimisticContractStatus('confirmed');
                  void confirmRequestContract({
                    contractId: effectiveContract.id,
                    startAt,
                    durationMin,
                    note,
                  }).then((ok) => {
                    if (!ok) {
                      setOptimisticContractStatus(previousStatus);
                    }
                  });
                }}
                disabled={isSubmittingDecision || effectiveContract.status !== 'pending' || !startAt}
              >
                {isSubmittingDecision
                  ? (locale === 'de' ? 'Speichern…' : 'Saving…')
                  : (locale === 'de' ? 'Vertrag bestätigen' : 'Confirm contract')}
              </button>
            </div>
          </div>
        ) : (
          <WorkspaceInlineStateCard
            locale={locale}
            tone="info"
            title={locale === 'de' ? 'Vertragsdaten fehlen noch' : 'Contract details are not available yet'}
            body={locale === 'de'
              ? 'Sobald das Angebot in einen Vertrag überführt wurde, kannst du Start, Dauer und Bestätigung direkt hier abschließen.'
              : 'As soon as the offer is converted into a contract, you can confirm start, duration, and completion directly here.'}
          />
        )
      ) : null}

      {card.decision.actionType === 'confirm_completion' ? (
        effectiveContract ? (
          <div className="my-request-dialog__actions my-request-dialog__actions--sticky">
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
                if (!effectiveContract?.id) return;
                const previousStatus = optimisticContractStatus;
                setOptimisticContractStatus('completed');
                void completeRequestContract(effectiveContract.id).then((ok) => {
                  if (!ok) {
                    setOptimisticContractStatus(previousStatus);
                  }
                });
              }}
              disabled={isSubmittingDecision || effectiveContract.status === 'completed' || effectiveContract.status === 'cancelled'}
            >
              {isSubmittingDecision
                ? (locale === 'de' ? 'Speichern…' : 'Saving…')
                : (locale === 'de' ? 'Abschluss bestätigen' : 'Confirm completion')}
            </button>
          </div>
        ) : (
          <WorkspaceInlineStateCard
            locale={locale}
            tone="empty"
            title={locale === 'de' ? 'Noch kein Vertrag gefunden' : 'No contract found yet'}
            body={locale === 'de'
              ? 'Die Abschlussbestätigung wird hier sichtbar, sobald der Auftrag aktiv als Vertrag geführt wird.'
              : 'Completion confirmation will appear here as soon as the request is tracked as an active contract.'}
          />
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
    attemptOwner: true,
    preferOwner: initialIntent === 'edit',
  });
  const request = data?.request ?? null;
  const isOwner = data?.source === 'owner';
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
    ownerTitle,
    requestPriceTrend,
    requestPriceTrendLabel,
    requestStatusView,
    setIsOwnerEditMode,
    setOwnerDescription,
    setOwnerPhotos,
    setOwnerPrice,
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
  });
  const offerAction = card.status.actions.find(
    (action) => action.kind === 'send_offer' || action.kind === 'edit_offer',
  );
  const chatAction = card.status.actions.find(
    (action) => action.kind === 'open_chat' && Boolean(action.chatInput),
  );
  const chatInput = chatAction?.chatInput ?? null;
  const effectiveApplyLabel = offerAction?.label ?? applyLabel;
  const effectiveApplyState = offerAction?.kind === 'edit_offer' ? 'edit' : applyState;
  const effectiveApplyTitle = offerAction?.kind === 'edit_offer'
    ? offerAction.label
    : applyTitle;
  const resolvedRequest = request ?? null;
  const resolvedViewModel = viewModel ?? null;
  const hasResolvedContent = Boolean(resolvedRequest && resolvedViewModel);

  return (
    <WorkspaceRequestDialogShell
      locale={locale}
      ariaLabel={card.requestPreview.title}
      onClose={onClose}
      isLoading={isLoading}
      isError={!isLoading && (isError || !hasResolvedContent)}
      errorTitle={locale === 'de' ? 'Anfrage konnte nicht geladen werden' : 'Request could not be loaded'}
      errorBody={locale === 'de'
        ? 'Der Workspace bleibt an derselben Stelle. Versuche es erneut, ohne die Seite zu verlassen.'
        : 'The workspace stays in place. Please try again without leaving this page.'}
    >
      {hasResolvedContent ? (
        <RequestDetailsContent
          t={t}
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
          asideChildren={isOwner && !isOwnerEditMode ? (
            <>
              <WorkspaceRequestDecisionSection
                locale={locale}
                card={card}
                onOpenChatConversation={onOpenChatConversation}
              />
              <WorkspaceRequestOffersSection
                locale={locale}
                requestId={card.requestId}
                onOpenChatConversation={onOpenChatConversation}
              />
            </>
          ) : null}
        />
      ) : null}
    </WorkspaceRequestDialogShell>
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
      <WorkspaceCompactModalPortal
        locale={locale}
        ariaLabel={locale === 'de' ? 'Angebot' : 'Offer'}
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
    return (
      <WorkspaceCompactModalPortal
        locale={locale}
        ariaLabel={locale === 'de' ? 'Angebot' : 'Offer'}
        onClose={onClose}
      >
        <div className="my-request-dialog__state">
          <WorkspaceInlineStateCard
            locale={locale}
            tone="error"
            title={locale === 'de' ? 'Angebot konnte nicht geladen werden' : 'Offer could not be loaded'}
            body={locale === 'de'
              ? 'Bitte versuche es erneut, ohne den Workspace zu verlassen.'
              : 'Please try again without leaving the workspace.'}
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
