'use client';

import * as React from 'react';

import { WorkspaceReviewRatingField } from '@/components/reviews/WorkspaceReviewRatingField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import type { RequestDialogIntent } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import {
  useWorkspaceCompletionReviewActions,
  useWorkspaceRequestDecisionActions,
  useWorkspaceRequestOfferActions,
} from '@/features/workspace/requests/useWorkspaceRequestOverlayActions';
import {
  formatDialogPrice,
  formatOfferTimestamp,
  resolveContractStatusBadge,
  resolveOfferStatusBadge,
  toDateTimeLocalValue,
  useWorkspaceRequestDecisionData,
  useWorkspaceRequestOffersData,
} from '@/features/workspace/requests/useWorkspaceRequestOverlayData';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceInlineStateCard } from '@/features/workspace/requests/WorkspaceOverlayPrimitives';

function WorkspaceSelectedProviderSummary({
  locale,
  offer,
  contract,
  bookingStartAt,
}: {
  locale: Locale;
  offer: NonNullable<ReturnType<typeof useWorkspaceRequestDecisionData>['selectedOffer']>;
  contract: ReturnType<typeof useWorkspaceRequestDecisionData>['contract'];
  bookingStartAt?: string | null;
}) {
  const priceLabel = formatDialogPrice(locale, contract?.priceAmount ?? offer.amount);
  const statusBadge = contract
    ? resolveContractStatusBadge(locale, contract.status)
    : resolveOfferStatusBadge(locale, offer.status);
  const assignedAt = formatOfferTimestamp(locale, contract?.confirmedAt ?? contract?.createdAt ?? offer.updatedAt ?? offer.createdAt);
  const scheduledAt = formatOfferTimestamp(locale, bookingStartAt ?? offer.availableAt ?? offer.requestPreferredDate);
  const availability = offer.availabilityNote?.trim() || null;
  const message = offer.message?.trim() || null;
  const metaItems = [
    assignedAt
      ? `${locale === 'de' ? 'In Arbeit seit' : 'In progress since'}: ${assignedAt}`
      : null,
    scheduledAt
      ? `${locale === 'de' ? 'Geplanter Termin' : 'Planned service date'}: ${scheduledAt}`
      : null,
    priceLabel
      ? `${locale === 'de' ? 'Kosten' : 'Price'}: ${priceLabel}`
      : null,
  ].filter(Boolean);

  return (
    <article className="my-request-contract-card">
      <div className="my-request-contract-card__head">
        <div className="my-request-contract-card__identity">
          <strong>{offer.providerDisplayName?.trim() || (locale === 'de' ? 'Gewählter Anbieter' : 'Selected provider')}</strong>
          <span className={statusBadge.className}>{statusBadge.label}</span>
        </div>
        {priceLabel ? <strong className="my-request-contract-card__price">{priceLabel}</strong> : null}
      </div>

      {message ? <p className="my-request-contract-card__message">{message}</p> : null}

      {metaItems.length > 0 ? (
        <div className="my-request-contract-card__meta">
          {metaItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}

      {availability || contract?.priceDetails ? (
        <div className="my-request-contract-card__note">
          {availability || contract?.priceDetails}
        </div>
      ) : null}
    </article>
  );
}

export function WorkspaceRequestOffersSection({
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
  const actionableOffersSignature = React.useMemo(
    () => actionableOffers.map((offer) => `${offer.id}:${offer.status}:${offer.updatedAt ?? offer.createdAt ?? ''}`).join('|'),
    [actionableOffers],
  );

  React.useEffect(() => {
    setOptimisticOffers((current) => {
      const currentSignature = current
        .map((offer) => `${offer.id}:${offer.status}:${offer.updatedAt ?? offer.createdAt ?? ''}`)
        .join('|');
      return currentSignature === actionableOffersSignature ? current : actionableOffers;
    });
  }, [actionableOffers, actionableOffersSignature]);

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

export function WorkspaceRequestDecisionSection({
  locale,
  card,
  initialIntent,
  onOpenChatConversation,
}: {
  locale: Locale;
  card: MyRequestsViewCard;
  initialIntent: RequestDialogIntent;
  onOpenChatConversation: (payload: WorkspaceChatConversationInput) => void;
}) {
  const [startAt, setStartAt] = React.useState(() => toDateTimeLocalValue());
  const [durationMin, setDurationMin] = React.useState('120');
  const [note, setNote] = React.useState('');
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewText, setReviewText] = React.useState('');
  const [reviewPromptDismissed, setReviewPromptDismissed] = React.useState(false);
  const [reviewSubmitted, setReviewSubmitted] = React.useState(false);
  const {
    completeRequestContract,
    confirmRequestContract,
    isSubmittingDecision,
  } = useWorkspaceRequestDecisionActions({
    locale,
    requestId: card.requestId,
  });
  const {
    booking,
    chatInput,
    chatLabel,
    contract,
    contractMeta,
    reviewStatus,
    selectedOffer,
    suggestedStartAt,
  } = useWorkspaceRequestDecisionData({ card, locale });
  const {
    isSubmittingReview,
    submitCompletionReview,
  } = useWorkspaceCompletionReviewActions();
  const [optimisticContractStatus, setOptimisticContractStatus] = React.useState<NonNullable<typeof contract>['status'] | null>(contract?.status ?? null);

  React.useEffect(() => {
    setOptimisticContractStatus(contract?.status ?? null);
  }, [contract?.status]);

  React.useEffect(() => {
    if (!suggestedStartAt) return;
    setStartAt((current) => (current ? current : toDateTimeLocalValue(suggestedStartAt)));
  }, [suggestedStartAt]);

  React.useEffect(() => {
    if (optimisticContractStatus !== 'completed') {
      setReviewPromptDismissed(false);
      setReviewSubmitted(false);
      setReviewText('');
      setReviewRating(5);
    }
  }, [optimisticContractStatus]);

  const hasSavedClientReview = Boolean(reviewStatus?.clientReviewId);
  const shouldShowReviewScene = initialIntent === 'review'
    || card.decision.actionType === 'review_completion'
    || hasSavedClientReview;

  React.useEffect(() => {
    if (!reviewStatus?.clientReviewId) return;
    setReviewSubmitted(true);
  }, [reviewStatus?.clientReviewId]);

  if (card.decision.actionType === 'review_offers' || (card.decision.actionType === 'none' && !shouldShowReviewScene)) {
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
  const shouldShowReviewPrompt = Boolean(
    effectiveContract?.status === 'completed'
    && booking?.bookingId
    && (reviewStatus?.canClientReviewProvider || initialIntent === 'review')
    && !hasSavedClientReview
    && !reviewPromptDismissed
    && !reviewSubmitted,
  );

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

      {selectedOffer ? (
        <WorkspaceSelectedProviderSummary
          locale={locale}
          offer={selectedOffer}
          contract={effectiveContract}
          bookingStartAt={booking?.startAt ?? null}
        />
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
          <>
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
                      return;
                    }
                    setReviewPromptDismissed(false);
                  });
                }}
                disabled={isSubmittingDecision || effectiveContract.status === 'completed' || effectiveContract.status === 'cancelled'}
              >
                {isSubmittingDecision
                  ? (locale === 'de' ? 'Speichern…' : 'Saving…')
                  : (locale === 'de' ? 'Leistung bestätigen' : 'Confirm completion')}
              </button>
            </div>

            {shouldShowReviewPrompt ? (
              <div className="my-request-review-card">
                <div className="my-request-review-card__head">
                  <div>
                    <h4>{locale === 'de' ? 'Bewertung hinterlassen' : 'Leave a review'}</h4>
                    <p>
                      {locale === 'de'
                        ? 'Der Auftrag ist abgeschlossen. Bewerte die Zusammenarbeit mit dem gewählten Anbieter direkt hier.'
                        : 'The job is completed. Rate your collaboration with the selected provider right here.'}
                    </p>
                  </div>
                </div>
                <WorkspaceReviewRatingField
                  label={locale === 'de' ? 'Bewertung' : 'Rating'}
                  value={reviewRating}
                  onChange={setReviewRating}
                />
                <label className="my-request-decision-form__field">
                  <span>{locale === 'de' ? 'Feedback' : 'Feedback'}</span>
                  <Textarea
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    placeholder={locale === 'de'
                      ? 'Wie lief die Zusammenarbeit? Was war besonders gut?'
                      : 'How did the collaboration go? What stood out?'}
                    disabled={isSubmittingReview}
                  />
                </label>
                <div className="my-request-review-card__actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={isSubmittingReview}
                    onClick={() => setReviewPromptDismissed(true)}
                  >
                    {locale === 'de' ? 'Später' : 'Later'}
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isSubmittingReview || !booking?.bookingId}
                    onClick={() => {
                      if (!booking?.bookingId) return;
                      void submitCompletionReview({
                        bookingId: booking.bookingId,
                        rating: reviewRating,
                        text: reviewText,
                      }).then((ok) => {
                        if (!ok) return;
                        setReviewSubmitted(true);
                      });
                    }}
                  >
                    {isSubmittingReview
                      ? (locale === 'de' ? 'Senden…' : 'Submitting…')
                      : (locale === 'de' ? 'Bewertung senden' : 'Submit review')}
                  </button>
                </div>
              </div>
            ) : null}

            {reviewSubmitted && !hasSavedClientReview ? (
              <WorkspaceInlineStateCard
                locale={locale}
                tone="info"
                title={locale === 'de' ? 'Bewertung gespeichert' : 'Review submitted'}
                body={locale === 'de'
                  ? 'Danke. Dein Feedback wurde gespeichert und ist jetzt Teil des Qualitätsverlaufs.'
                  : 'Thanks. Your feedback has been saved and is now part of the quality history.'}
              />
            ) : null}
          </>
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

      {shouldShowReviewScene ? (
        effectiveContract ? (
          hasSavedClientReview ? (
            <article className="my-request-review-card">
              <div className="my-request-review-card__head">
                <div>
                  <h4>{locale === 'de' ? 'Deine Bewertung' : 'Your review'}</h4>
                  <p>
                    {reviewStatus?.clientReviewedProviderAt
                      ? (locale === 'de'
                        ? `Gespeichert am ${formatOfferTimestamp(locale, reviewStatus.clientReviewedProviderAt)}`
                        : `Saved on ${formatOfferTimestamp(locale, reviewStatus.clientReviewedProviderAt)}`)
                      : (locale === 'de'
                        ? 'Dein Feedback wurde bereits gespeichert.'
                        : 'Your feedback has already been saved.')}
                  </p>
                </div>
              </div>
              <WorkspaceReviewRatingField
                label={locale === 'de' ? 'Bewertung' : 'Rating'}
                value={reviewStatus?.clientReviewRating ?? 5}
                onChange={() => {}}
                disabled
              />
              {reviewStatus?.clientReviewText ? (
                <div className="my-request-contract-card__note">
                  {reviewStatus.clientReviewText}
                </div>
              ) : null}
            </article>
          ) : shouldShowReviewPrompt ? null : (
            <WorkspaceInlineStateCard
              locale={locale}
              tone="info"
              title={locale === 'de' ? 'Bewertung verfügbar, sobald der Auftrag abgeschlossen ist' : 'Review available once the job is completed'}
              body={locale === 'de'
                ? 'Sobald die Leistung bestätigt ist, kannst du hier direkt eine Bewertung hinterlassen.'
                : 'As soon as the work is confirmed, you can leave your review right here.'}
            />
          )
        ) : (
          <WorkspaceInlineStateCard
            locale={locale}
            tone="empty"
            title={locale === 'de' ? 'Noch keine Bewertungsdaten verfügbar' : 'No review data available yet'}
            body={locale === 'de'
              ? 'Öffne diesen Schritt erneut, sobald ein Vertrag und eine abgeschlossene Leistung vorliegen.'
              : 'Open this step again once a contract and a completed job are available.'}
          />
        )
      ) : null}
    </div>
  );
}
