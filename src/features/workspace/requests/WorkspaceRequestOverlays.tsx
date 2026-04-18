'use client';

import * as React from 'react';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  RequestOfferSheet,
  RequestOwnerEditPanel,
} from '@/components/requests/details';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ChatWorkspacePage } from '@/features/chat/ChatWorkspacePage';
import { providerQK } from '@/features/provider/queries';
import { useRequestOwnerEdit } from '@/features/requests/details/useRequestOwnerEdit';
import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import type { RequestDialogIntent } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import { completeContract, confirmContract, listMyContracts } from '@/lib/api/contracts';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import {
  acceptOffer,
  createOffer,
  declineOffer,
  deleteOffer,
  listMyProviderOffers,
  listOffersByRequest,
  updateOffer,
} from '@/lib/api/offers';
import { ApiError } from '@/lib/api/http-error';
import { getMyRequestById, getPublicRequestById } from '@/lib/api/requests';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';
import {
  normalizeAppImageSrc,
  shouldBypassNextImageOptimization,
} from '@/lib/requests/images';

function formatDialogDate(locale: Locale, value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDialogPrice(locale: Locale, value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOfferTimestamp(locale: Locale, value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function toDateTimeLocalValue(value?: string | null) {
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
  if (!Number.isFinite(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function resolveOfferStatusBadge(locale: Locale, status: OfferDto['status']) {
  if (status === 'accepted') {
    return {
      label: locale === 'de' ? 'Angenommen' : 'Accepted',
      className: 'status-badge status-badge--success',
    };
  }
  if (status === 'declined') {
    return {
      label: locale === 'de' ? 'Abgelehnt' : 'Declined',
      className: 'status-badge status-badge--danger',
    };
  }
  if (status === 'withdrawn') {
    return {
      label: locale === 'de' ? 'Zurückgezogen' : 'Withdrawn',
      className: 'status-badge status-badge--warning',
    };
  }
  return {
    label: locale === 'de' ? 'Neu' : 'New',
    className: 'status-badge status-badge--info',
  };
}

function resolveContractStatusBadge(locale: Locale, status: ContractDto['status']) {
  if (status === 'completed') {
    return {
      label: locale === 'de' ? 'Abgeschlossen' : 'Completed',
      className: 'status-badge status-badge--success',
    };
  }
  if (status === 'confirmed' || status === 'in_progress') {
    return {
      label: locale === 'de' ? 'Bestätigt' : 'Confirmed',
      className: 'status-badge status-badge--success',
    };
  }
  if (status === 'cancelled') {
    return {
      label: locale === 'de' ? 'Storniert' : 'Cancelled',
      className: 'status-badge status-badge--danger',
    };
  }
  return {
    label: locale === 'de' ? 'Ausstehend' : 'Pending',
    className: 'status-badge status-badge--warning',
  };
}

async function fetchWorkspaceManagedRequest(requestId: string, locale: Locale) {
  try {
    const request = await getMyRequestById(requestId);
    return {
      request,
      source: 'owner' as const,
    };
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 403 && error.status !== 404)) {
      throw error;
    }
  }

  return {
    request: await getPublicRequestById(requestId, { locale }),
    source: 'public' as const,
  };
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
  const t = useT();
  const qc = useQueryClient();
  const { data: offers = [], isLoading, isError } = useQuery({
    queryKey: ['workspace-request-offers', requestId],
    queryFn: () => withStatusFallback(() => listOffersByRequest(requestId), [] as OfferDto[]),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const [pendingOfferActionId, setPendingOfferActionId] = React.useState<string | null>(null);

  const invalidateOfferState = React.useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['workspace-request-offers', requestId] }),
      qc.invalidateQueries({ queryKey: workspaceQK.offersMyClient() }),
      qc.invalidateQueries({ queryKey: workspaceQK.requestsMy() }),
      qc.invalidateQueries({ queryKey: ['workspace-requests'] }),
      qc.invalidateQueries({ queryKey: ['workspace-private-overview'] }),
      qc.invalidateQueries({ queryKey: ['request-detail', requestId] }),
    ]);
  }, [qc, requestId]);

  const handleAccept = React.useCallback(async (offerId: string) => {
    if (pendingOfferActionId === offerId) return;
    setPendingOfferActionId(offerId);
    try {
      await acceptOffer(offerId);
      toast.success(locale === 'de' ? 'Angebot angenommen.' : 'Offer accepted.');
      await invalidateOfferState();
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setPendingOfferActionId(null);
    }
  }, [invalidateOfferState, locale, pendingOfferActionId, t]);

  const handleDecline = React.useCallback(async (offerId: string) => {
    if (pendingOfferActionId === offerId) return;
    setPendingOfferActionId(offerId);
    try {
      await declineOffer(offerId);
      toast.success(locale === 'de' ? 'Angebot abgelehnt.' : 'Offer declined.');
      await invalidateOfferState();
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setPendingOfferActionId(null);
    }
  }, [invalidateOfferState, locale, pendingOfferActionId, t]);

  const acceptedOfferId = offers.find((offer) => offer.status === 'accepted')?.id ?? null;
  const actionableOffers = offers.filter((offer) => offer.status !== 'withdrawn');

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
  const t = useT();
  const qc = useQueryClient();
  const [startAt, setStartAt] = React.useState(() => toDateTimeLocalValue());
  const [durationMin, setDurationMin] = React.useState('120');
  const [note, setNote] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data: contracts = [] } = useQuery({
    queryKey: workspaceQK.contractsMyClient(),
    queryFn: () => withStatusFallback(() => listMyContracts({ role: 'client' }), [] as ContractDto[]),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const contract = React.useMemo(
    () => contracts.find((item) => item.requestId === card.requestId) ?? null,
    [card.requestId, contracts],
  );
  const chatAction = React.useMemo(
    () => card.status.actions.find((action) => action.kind === 'open_chat' && Boolean(action.chatInput))
      ?? (card.decision.primaryAction?.kind === 'open_chat' ? card.decision.primaryAction : null),
    [card.decision.primaryAction, card.status.actions],
  );
  const chatInput = chatAction?.chatInput ?? null;
  const chatLabel = chatAction?.label ?? (locale === 'de' ? 'Chat' : 'Chat');

  React.useEffect(() => {
    if (!contract?.createdAt) return;
    setStartAt((current) => (current ? current : toDateTimeLocalValue(contract.createdAt)));
  }, [contract?.createdAt]);

  const invalidateDecisionState = React.useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: workspaceQK.contractsMyClient() }),
      qc.invalidateQueries({ queryKey: workspaceQK.requestsMy() }),
      qc.invalidateQueries({ queryKey: ['workspace-requests'] }),
      qc.invalidateQueries({ queryKey: ['workspace-private-overview'] }),
      qc.invalidateQueries({ queryKey: ['request-detail', card.requestId] }),
    ]);
  }, [card.requestId, qc]);

  const handleConfirmContract = React.useCallback(async () => {
    if (!contract?.id || !startAt) return;
    setIsSubmitting(true);
    try {
      await confirmContract(contract.id, {
        startAt: new Date(startAt).toISOString(),
        durationMin: durationMin.trim() ? Number(durationMin) : undefined,
        note: note.trim() || undefined,
      });
      toast.success(locale === 'de' ? 'Vertrag bestätigt.' : 'Contract confirmed.');
      await invalidateDecisionState();
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [contract?.id, durationMin, invalidateDecisionState, locale, note, startAt, t]);

  const handleCompleteContract = React.useCallback(async () => {
    if (!contract?.id) return;
    setIsSubmitting(true);
    try {
      await completeContract(contract.id);
      toast.success(locale === 'de' ? 'Abschluss bestätigt.' : 'Completion confirmed.');
      await invalidateDecisionState();
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [contract?.id, invalidateDecisionState, locale, t]);

  if (card.decision.actionType === 'review_offers' || card.decision.actionType === 'none') {
    return null;
  }

  const contractPrice = contract?.priceAmount != null
    ? formatDialogPrice(locale, contract.priceAmount)
    : null;
  const contractMeta = [
    contractPrice,
    contract?.status ? resolveContractStatusBadge(locale, contract.status).label : null,
  ].filter(Boolean).join(' · ');

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
                disabled={isSubmitting || contract.status !== 'pending'}
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
                disabled={isSubmitting || contract.status !== 'pending'}
              />
            </label>
            <label className="my-request-decision-form__field">
              <span>{locale === 'de' ? 'Hinweis' : 'Note'}</span>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={isSubmitting || contract.status !== 'pending'}
                placeholder={locale === 'de' ? 'Optionaler Hinweis für den Vertrag' : 'Optional note for the contract'}
              />
            </label>
            <div className="my-request-dialog__actions">
              {chatInput ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onOpenChatConversation(chatInput)}
                  disabled={isSubmitting}
                >
                  {chatLabel}
                </button>
              ) : null}
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  void handleConfirmContract();
                }}
                disabled={isSubmitting || contract.status !== 'pending' || !startAt}
              >
                {isSubmitting
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
                disabled={isSubmitting}
              >
                {chatLabel}
              </button>
            ) : null}
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                void handleCompleteContract();
              }}
              disabled={isSubmitting || contract.status === 'completed' || contract.status === 'cancelled'}
            >
              {isSubmitting
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

function cardlessTitle(locale: Locale) {
  return locale === 'de' ? 'Anfrage' : 'Request';
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
  const { data, isLoading, isError } = useQuery({
    queryKey: ['request-detail', card.requestId, locale],
    queryFn: () => fetchWorkspaceManagedRequest(card.requestId, locale),
    staleTime: 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
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
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['request-detail', requestId, locale],
    queryFn: () => fetchWorkspaceManagedRequest(requestId, locale),
    staleTime: 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });
  const request = data?.request ?? null;
  const { data: myOffers = [] } = useQuery({
    queryKey: workspaceQK.offersMy(),
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), [] as OfferDto[]),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const existingResponse = React.useMemo(
    () => myOffers.find((item) => item.requestId === requestId) ?? null,
    [myOffers, requestId],
  );
  const [offerAmount, setOfferAmount] = React.useState('');
  const [offerComment, setOfferComment] = React.useState('');
  const [offerAvailability, setOfferAvailability] = React.useState('');
  const [offerSheetMode, setOfferSheetMode] = React.useState<'form' | 'success'>('form');
  const [isSubmittingOffer, setIsSubmittingOffer] = React.useState(false);

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

  const invalidateWorkspaceState = React.useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: workspaceQK.offersMy() }),
      qc.invalidateQueries({ queryKey: workspaceQK.requestsMy() }),
      qc.invalidateQueries({ queryKey: ['workspace-requests'] }),
      qc.invalidateQueries({ queryKey: ['workspace-private-overview'] }),
      qc.invalidateQueries({ queryKey: providerQK.myProfile() }),
    ]);
  }, [qc]);

  const resetDraft = React.useCallback(() => {
    setOfferSheetMode('form');
    setOfferAmount('');
    setOfferComment('');
    setOfferAvailability('');
  }, []);

  const handleOfferSubmit = React.useCallback(async () => {
    if (!request) return;
    const parsedAmount = Number(offerAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.message(t(I18N_KEYS.requestDetails.responseAmountInvalid));
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const payload = {
        amount: parsedAmount,
        message: offerComment.trim() || undefined,
        availabilityNote: offerAvailability.trim() || undefined,
      };

      if (existingResponse?.id) {
        await updateOffer(existingResponse.id, payload);
        toast.success(t(I18N_KEYS.requestDetails.responseUpdated));
        await invalidateWorkspaceState();
        onClose();
        return;
      }

      await createOffer({
        requestId: request.id,
        ...payload,
      });
      await invalidateWorkspaceState();
      setOfferSheetMode('success');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        toast.message(t(I18N_KEYS.requestDetails.responseEditUnavailable));
      } else if (error instanceof ApiError && error.status === 409) {
        toast.message(t(I18N_KEYS.requestDetails.responseAlready));
        await invalidateWorkspaceState();
        onClose();
      } else if (error instanceof ApiError && error.status === 403) {
        toast.error(error.message || t(I18N_KEYS.requestDetails.responseFailed));
      } else {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      }
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [
    existingResponse?.id,
    invalidateWorkspaceState,
    offerAmount,
    offerAvailability,
    offerComment,
    onClose,
    request,
    t,
  ]);

  const handleOfferCancel = React.useCallback(async () => {
    if (!existingResponse?.id) {
      resetDraft();
      onClose();
      return;
    }

    setIsSubmittingOffer(true);
    try {
      await deleteOffer(existingResponse.id);
      await invalidateWorkspaceState();
      toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
      resetDraft();
      onClose();
    } catch {
      toast.error(t(I18N_KEYS.requestDetails.responseFailed));
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [existingResponse?.id, invalidateWorkspaceState, onClose, resetDraft, t]);

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
        void handleOfferCancel();
      }}
      onSuccessBack={handleSuccessBack}
      onSubmit={() => {
        void handleOfferSubmit();
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
