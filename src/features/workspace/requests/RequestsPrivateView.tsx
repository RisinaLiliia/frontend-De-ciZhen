'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  RequestOfferSheet,
  RequestOwnerEditPanel,
} from '@/components/requests/details';
import { RequestCard } from '@/components/requests/RequestCard';
import { LocationMeta } from '@/components/ui/LocationMeta';
import { IconCalendar } from '@/components/ui/icons/icons';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { providerQK } from '@/features/provider/queries';
import { useRequestOwnerEdit } from '@/features/requests/details/useRequestOwnerEdit';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import { isWorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import type { OwnerRequestActions, RequestsListProps } from '@/components/requests/requestsList.types';
import { DecisionModeBar } from '@/features/workspace/requests/components/DecisionModeBar';
import { DecisionPanel } from '@/features/workspace/requests/components/DecisionPanel';
import type {
  MyRequestsSummaryItem,
  MyRequestsViewCard,
  MyRequestsViewModel,
} from '@/features/workspace/requests/myRequestsView.model';
import type { ActiveDecisionState, WorkQueueMode } from '@/features/workspace/requests/requestsDecision.model';
import {
  buildPrivateRequestCardChrome,
  type PrivateRequestCardAction,
} from '@/features/workspace/requests/requestsPrivateCard.model';
import { resolveOwnerMenuActions } from '@/features/workspace/requests/requestOwnerMenu.model';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import { sortCardsForDecisionMode } from '@/features/workspace/requests/requestsDecision.model';
import { createConversation } from '@/lib/api/chat';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { WorkspaceMyRequestCardDto, WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';
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
  pickRequestImage,
  shouldBypassNextImageOptimization,
} from '@/lib/requests/images';

type RequestsPrivateViewProps = {
  locale: Locale;
  isWorkspaceAuthed: boolean;
  guestLoginHref: string;
  model: MyRequestsViewModel;
  isLoading: boolean;
  isError: boolean;
  decisionState: ActiveDecisionState;
  decisionQueueIds: string[];
  onEnterDecisionMode: (requestId?: string | null) => void;
  onOpenDecisionItem: (requestId: string) => void;
  onExitDecisionMode: () => void;
  listContext: {
    onSendOffer?: RequestsListProps['onSendOffer'];
    onEditOffer?: RequestsListProps['onEditOffer'];
    onWithdrawOffer?: RequestsListProps['onWithdrawOffer'];
    onOpenChatConversation?: (payload: WorkspaceChatConversationInput) => void;
    pendingOfferRequestId?: string | null;
    ownerRequestActions?: OwnerRequestActions;
  };
};

type RailProps = {
  locale: Locale;
  panel: WorkspaceRequestsDecisionPanelDto;
  mode: WorkQueueMode;
  activeRequestId: string | null;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
  className?: string;
};

type RequestDialogIntent = 'view' | 'edit';

type RequestsPrivateListContext = RequestsPrivateViewProps['listContext'] & {
  onOpenRequest?: (requestId: string, intent?: RequestDialogIntent) => void;
};

type ManagedRequestState = {
  requestId: string;
  intent: RequestDialogIntent;
};

function useStateFilterMutation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return React.useCallback((nextState: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', 'requests');
    params.set('scope', 'my');
    params.set('state', nextState);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);
}

function resolveRequestDialogIntent(action: { key: string }): RequestDialogIntent {
  return action.key === 'edit-request' ? 'edit' : 'view';
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

function SummaryCard({
  locale,
  item,
  onSelect,
}: {
  locale: Locale;
  item: MyRequestsSummaryItem;
  onSelect: (nextState: string) => void;
}) {
  const helperText = (() => {
    if (locale === 'de') {
      if (item.key === 'all') return 'Gesamter Überblick';
      if (item.key === 'attention') return 'Wartet auf Aktion';
      if (item.key === 'execution') return 'Vertrag läuft';
      if (item.key === 'completed') return 'Erledigt';
      return 'Zur Prüfung';
    }

    if (item.key === 'all') return 'Full overview';
    if (item.key === 'attention') return 'Needs action';
    if (item.key === 'execution') return 'Work in progress';
    if (item.key === 'completed') return 'Done';
    return 'Pending review';
  })();

  return (
    <button
      type="button"
      className={[
        'my-requests-summary__card',
        `is-${item.key}`,
        item.isHighlighted ? 'is-active' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => onSelect(item.key)}
      aria-pressed={item.isHighlighted}
    >
      <span className="my-requests-summary__label">{item.label}</span>
      <strong className="my-requests-summary__value">{item.value}</strong>
      <span className="my-requests-summary__helper">{helperText}</span>
      <span className="my-requests-summary__accent" aria-hidden="true" />
    </button>
  );
}

function WorkflowProgress({
  locale,
  card,
  steps,
}: {
  locale: Locale;
  card: WorkspaceMyRequestCardDto;
  steps: WorkspaceMyRequestCardDto['progress']['steps'];
}) {
  const activeIndex = React.useMemo(
    () => Math.max(0, steps.findIndex((step) => step.status === 'current')),
    [steps],
  );
  const progressPercent = React.useMemo(() => {
    if (steps.length <= 0) return 0;
    if (steps.every((step) => step.status === 'done')) return 100;
    return Math.round(((activeIndex + 1) / steps.length) * 100);
  }, [activeIndex, steps]);

  const resolveStepMeta = React.useCallback((step: WorkspaceMyRequestCardDto['progress']['steps'][number]) => {
    if (step.key === 'request') {
      return card.createdAt?.trim()
        || (locale === 'de' ? 'Erstellt' : 'Created');
    }

    if (step.key === 'offers') {
      if (card.decision.actionType === 'review_offers' && card.decision.actionLabel?.trim()) {
        return card.decision.actionLabel.trim();
      }

      if (step.status === 'done') {
        return locale === 'de' ? 'Erhalten' : 'Received';
      }

      if (step.status === 'current') {
        return locale === 'de' ? 'Ausstehend' : 'Pending';
      }

      return locale === 'de' ? 'Noch offen' : 'Not started';
    }

    if (step.key === 'selection') {
      if (step.status === 'done') {
        return locale === 'de' ? 'Getroffen' : 'Selected';
      }

      if (step.status === 'current') {
        return locale === 'de' ? 'Ausstehend' : 'Pending';
      }

      return locale === 'de' ? 'Noch offen' : 'Not started';
    }

    if (step.key === 'contract') {
      if (step.status === 'done') {
        return locale === 'de' ? 'Bestätigt' : 'Confirmed';
      }

      if (step.status === 'current') {
        return card.nextEventAt?.trim()
          ? (locale === 'de' ? `Aktiv · ${card.nextEventAt}` : `Active · ${card.nextEventAt}`)
          : (locale === 'de' ? 'Aktiv' : 'Active');
      }

      return locale === 'de' ? 'Noch nicht erstellt' : 'Not created yet';
    }

    if (card.state === 'completed') {
      return locale === 'de' ? 'Abgeschlossen' : 'Completed';
    }

    if (card.state === 'active') {
      return locale === 'de' ? 'In Arbeit' : 'In progress';
    }

    return locale === 'de' ? 'Noch nicht gestartet' : 'Not started';
  }, [card, locale]);

  return (
    <div className="my-request-card__progress-scroll">
      <div className="my-request-card__progress-shell">
        <div
          className="my-request-card__progress"
          role="list"
          aria-label={locale === 'de' ? 'Fortschritt der Anfrage' : 'Request progress'}
        >
          {steps.map((step) => (
            <div
              key={step.key}
              className={`my-request-card__progress-step is-${step.status}`.trim()}
              role="listitem"
            >
              <span className="my-request-card__progress-dot" />
              <span className="my-request-card__progress-copy">
                <span className="my-request-card__progress-label">{step.label}</span>
                <span className="my-request-card__progress-meta">{resolveStepMeta(step)}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="my-request-card__progress-rail" aria-hidden="true">
          <span
            className="my-request-card__progress-rail-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RequestActionControl({
  action,
  variant,
  listContext,
}: {
  action: PrivateRequestCardAction;
  variant: 'primary' | 'secondary';
  listContext: RequestsPrivateListContext;
}) {
  const className = [
    variant === 'primary' ? 'btn-ghost is-primary' : 'btn-secondary',
    'my-request-card__action-btn',
    `my-request-card__action-btn--${variant}`,
  ].join(' ');

  if (action.kind === 'link' && action.requestId && listContext.onOpenRequest) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => listContext.onOpenRequest?.(action.requestId!, resolveRequestDialogIntent(action))}
      >
        {action.label}
      </button>
    );
  }

  if (action.kind === 'link' && action.href) {
    return (
      <Link href={action.href} prefetch={false} className={className}>
        {action.label}
      </Link>
    );
  }

  if (action.kind === 'open_chat' && action.chatInput) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => listContext.onOpenChatConversation?.(action.chatInput!)}
      >
        {action.label}
      </button>
    );
  }

  if (action.kind === 'send_offer' && action.requestId) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => listContext.onSendOffer?.(action.requestId!)}
      >
        {action.label}
      </button>
    );
  }

  if (action.kind === 'edit_offer' && action.requestId) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => listContext.onEditOffer?.(action.requestId!)}
      >
        {action.label}
      </button>
    );
  }

  if (action.kind === 'withdraw_offer' && action.offerId) {
    return (
      <button
        type="button"
        className={className}
        disabled={listContext.pendingOfferRequestId === action.requestId}
        onClick={() => listContext.onWithdrawOffer?.(action.offerId!)}
      >
        {action.label}
      </button>
    );
  }

  if (action.kind === 'delete_request' && action.requestId) {
    return (
      <button
        type="button"
        className={className}
        disabled={listContext.ownerRequestActions?.pendingDeleteRequestId === action.requestId}
        onClick={() => listContext.ownerRequestActions?.onDelete?.(action.requestId!)}
      >
        {action.label}
      </button>
    );
  }

  return null;
}

function RequestSignalPills({
  chrome,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
}) {
  if (chrome.signalPills.length === 0) return null;

  return (
    <div className="my-request-card__signals">
      {chrome.signalPills.map((signal) => (
        <span key={signal.key} className={`my-request-card__signal is-${signal.tone}`.trim()}>
          {signal.label}
        </span>
      ))}
    </div>
  );
}

function RequestOwnerInsights({
  chrome,
  includeSignals = true,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
  includeSignals?: boolean;
}) {
  if ((!includeSignals || chrome.signalPills.length === 0) && chrome.insights.length === 0) return null;

  return (
    <div className="my-request-card__owner-content">
      {includeSignals ? <RequestSignalPills chrome={chrome} /> : null}
      {chrome.insights.length > 0 ? (
        <div className={`my-request-card__insights my-request-card__insights--${Math.min(chrome.insights.length, 2)}`.trim()}>
          {chrome.insights.map((item) => (
            <article key={item.key} className={`my-request-card__insight is-${item.tone}`.trim()}>
              <strong className="my-request-card__insight-title">{item.title}</strong>
              <p className="my-request-card__insight-copy">{item.description}</p>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RequestOwnerFooterNote({
  chrome,
  card,
  locale,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
  card: MyRequestsViewCard;
  locale: Locale;
}) {
  const noteFromInsights = chrome.insights
    .map((item) => item.description.trim())
    .find(Boolean);
  const noteFromDecision = card.decision.actionReason?.trim();
  const noteFromActivity = card.activity?.label?.trim();

  let fallbackNote: string;
  if (card.decision.actionType === 'review_offers') {
    fallbackNote = locale === 'de'
      ? 'Du hast offene Entscheidungen. Wir helfen dir bei der Auswahl.'
      : 'You have open decisions. We help you with the selection.';
  } else if (card.decision.actionType === 'confirm_contract') {
    fallbackNote = locale === 'de'
      ? 'Die nächsten Schritte hängen von deiner Vertragsbestätigung ab.'
      : 'The next steps depend on your contract confirmation.';
  } else if (card.decision.actionType === 'reply_required') {
    fallbackNote = locale === 'de'
      ? 'Es gibt offene Rückmeldungen. Antworte, damit der Vorgang weiterläuft.'
      : 'There are open replies pending. Respond to keep the workflow moving.';
  } else if (card.decision.actionType === 'confirm_completion') {
    fallbackNote = locale === 'de'
      ? 'Bestätige den Abschluss, damit der Vorgang sauber beendet wird.'
      : 'Confirm completion to close the workflow cleanly.';
  } else {
    fallbackNote = locale === 'de'
      ? 'Behalte diesen Vorgang im Blick und steuere die nächsten Schritte direkt hier.'
      : 'Keep this workflow in view and manage the next steps here.';
  }

  const note = noteFromInsights || noteFromDecision || noteFromActivity || fallbackNote;

  if (!note) return null;

  return (
    <div className={`my-request-card__footer-note is-${chrome.insights[0]?.tone ?? 'neutral'}`.trim()}>
      <span className="my-request-card__footer-note-icon" aria-hidden="true">
        i
      </span>
      <p className="my-request-card__footer-note-copy">{note}</p>
    </div>
  );
}

function RequestCardTopSlot({
  chrome,
  locale,
  card,
  steps,
  ownerRequestActions,
  onOpenRequest,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
  locale: Locale;
  card: WorkspaceMyRequestCardDto;
  steps: WorkspaceMyRequestCardDto['progress']['steps'];
  ownerRequestActions?: OwnerRequestActions;
  onOpenRequest?: RequestsPrivateListContext['onOpenRequest'];
}) {
  const statusClassName = card.status.badgeTone ? `status-badge status-badge--${card.status.badgeTone}` : null;

  return (
    <div className="my-request-card__topslot">
      {(statusClassName || card.role === 'customer') ? (
        <div className="my-request-card__topbar">
          <div className="my-request-card__topbar-start">
            {card.status.badgeLabel && statusClassName ? (
              <span className={`${statusClassName} my-request-card__status-badge`.trim()}>
                {card.status.badgeLabel}
              </span>
            ) : null}
          </div>
          <div className="my-request-card__topbar-end">
            {card.role === 'customer' ? (
              <RequestOwnerMenu
                locale={locale}
                card={card}
                ownerRequestActions={ownerRequestActions}
                onOpenRequest={onOpenRequest}
              />
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="my-request-card__header-main">
        <WorkflowProgress locale={locale} card={card} steps={steps} />
      </div>
      {chrome.contextPills.length > 0 ? (
        <div className="my-request-card__context my-request-card__context--top">
          {chrome.contextPills.map((item) => (
            <span key={item} className="my-request-card__context-pill">
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RequestOwnerMenu({
  locale,
  card,
  ownerRequestActions,
  onOpenRequest,
}: {
  locale: Locale;
  card: WorkspaceMyRequestCardDto;
  ownerRequestActions?: OwnerRequestActions;
  onOpenRequest?: RequestsPrivateListContext['onOpenRequest'];
}) {
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const requestHref = card.requestPreview.href || `/requests/${card.requestId}`;
  const menuActions = React.useMemo(
    () => resolveOwnerMenuActions({ card, locale }),
    [card, locale],
  );

  const closeMenu = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleShare = React.useCallback(async (shareHref?: string | null) => {
    closeMenu();

    if (typeof window === 'undefined') return;

    const shareUrl = new URL(shareHref || requestHref, window.location.origin).toString();

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: card.requestPreview.title,
          url: shareUrl,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(locale === 'de' ? 'Link kopiert.' : 'Link copied.');
      } else {
        window.prompt(locale === 'de' ? 'Link teilen' : 'Share link', shareUrl);
      }
    } catch {
      toast.error(locale === 'de' ? 'Link konnte nicht geteilt werden.' : 'Could not share link.');
    }
  }, [card.requestPreview.title, closeMenu, locale, requestHref]);

  const handleDelete = React.useCallback((requestId: string) => {
    closeMenu();

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        locale === 'de'
          ? 'Diese Anfrage endgültig löschen?'
          : 'Delete this request permanently?',
      );
      if (!confirmed) return;
    }

    ownerRequestActions?.onDelete?.(requestId);
  }, [closeMenu, locale, ownerRequestActions]);

  return (
    <div ref={menuRef} className="my-request-card__owner-menu" data-card-action="true">
      <MoreDotsLink
        label={locale === 'de' ? 'Anfrage-Menü öffnen' : 'Open request menu'}
        className={`my-request-card__owner-menu-trigger ${isOpen ? 'is-open' : ''}`.trim()}
        onClick={() => setIsOpen((prev) => !prev)}
      />
      {isOpen ? (
        <div className="my-request-card__owner-menu-surface" role="menu">
          {menuActions.map((action) => {
            if (action.kind === 'link' && action.href) {
              if (action.requestId && onOpenRequest) {
                return (
                  <button
                    key={action.key}
                    type="button"
                    className="my-request-card__owner-menu-item"
                    role="menuitem"
                    onClick={() => {
                      closeMenu();
                      onOpenRequest(action.requestId!, resolveRequestDialogIntent(action));
                    }}
                  >
                    {action.label}
                  </button>
                );
              }

              return (
                <Link
                  key={action.key}
                  href={action.href}
                  prefetch={false}
                  className="my-request-card__owner-menu-item"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  {action.label}
                </Link>
              );
            }

            if (action.kind === 'share_request') {
              return (
                <button
                  key={action.key}
                  type="button"
                  className="my-request-card__owner-menu-item"
                  role="menuitem"
                  onClick={() => void handleShare(action.href)}
                >
                  {action.label}
                </button>
              );
            }

            if (action.kind === 'duplicate_request' && action.requestId) {
              return (
                <button
                  key={action.key}
                  type="button"
                  className="my-request-card__owner-menu-item"
                  role="menuitem"
                  disabled={ownerRequestActions?.pendingDuplicateRequestId === action.requestId}
                  onClick={() => {
                    closeMenu();
                    ownerRequestActions?.onDuplicate?.(action.requestId!);
                  }}
                >
                  {action.label}
                </button>
              );
            }

            if (action.kind === 'archive_request' && action.requestId) {
              return (
                <button
                  key={action.key}
                  type="button"
                  className="my-request-card__owner-menu-item"
                  role="menuitem"
                  disabled={ownerRequestActions?.pendingArchiveRequestId === action.requestId}
                  onClick={() => {
                    closeMenu();
                    ownerRequestActions?.onArchive?.(action.requestId!);
                  }}
                >
                  {action.label}
                </button>
              );
            }

            if (action.kind === 'delete_request' && action.requestId) {
              return (
                <button
                  key={action.key}
                  type="button"
                  className="my-request-card__owner-menu-item is-danger"
                  role="menuitem"
                  disabled={ownerRequestActions?.pendingDeleteRequestId === action.requestId}
                  onClick={() => handleDelete(action.requestId!)}
                >
                  {action.label}
                </button>
              );
            }

            return null;
          })}
        </div>
      ) : null}
    </div>
  );
}

function MyRequestCard({
  locale,
  card,
  index,
  mode,
  isActive,
  listContext,
}: {
  locale: Locale;
  card: MyRequestsViewCard;
  index: number;
  mode: WorkQueueMode;
  isActive: boolean;
  listContext: RequestsPrivateListContext;
}) {
  const preview = card.requestPreview;
  const chrome = React.useMemo(
    () => buildPrivateRequestCardChrome({ card, locale }),
    [card, locale],
  );
  const meta: React.ReactNode[] = [];

  if (preview.cityLabel) {
    meta.push(<LocationMeta key="city" label={preview.cityLabel} />);
  }

  if (preview.dateLabel) {
    meta.push(
      <React.Fragment key="date">
        <IconCalendar />
        {preview.dateLabel}
      </React.Fragment>,
    );
  }

  return (
    <div
      className={[
        'my-request-card',
        mode === 'decision' ? 'my-request-card--decision' : '',
        isActive ? 'my-request-card--active' : '',
        mode === 'decision' && !isActive ? 'my-request-card--idle' : '',
      ].filter(Boolean).join(' ')}
      data-request-id={card.requestId}
    >
      <RequestCard
        prefetch={index < 2}
        href={preview.href}
        className="my-request-card__surface"
        ariaLabel={locale === 'de' ? 'Anfrage öffnen' : 'Open request'}
        imageSrc={preview.imageUrl || pickRequestImage(preview.imageCategoryKey ?? '')}
        imageAlt=""
        imagePriority={index === 0}
        badges={[]}
        category={preview.categoryLabel}
        title={preview.title}
        excerpt={preview.excerpt}
        mediaPlacement="body"
        pricePlacement="body"
        meta={meta}
        priceLabel={preview.priceLabel}
        priceTrend={preview.priceTrend ?? null}
        priceTrendLabel={preview.priceTrendLabel ?? null}
        tags={preview.tags}
        mode="link"
        onOpen={() => listContext.onOpenRequest?.(card.requestId, 'view')}
        isActive={isActive}
        topSlot={(
          <RequestCardTopSlot
            chrome={chrome}
            locale={locale}
            card={card}
            steps={card.progress.steps}
            ownerRequestActions={listContext.ownerRequestActions}
            onOpenRequest={listContext.onOpenRequest}
          />
        )}
        statusSlot={<WorkspaceRequestStatusSlot chrome={chrome} />}
        actionSlot={(chrome.insights.length > 0 || chrome.primaryAction || chrome.secondaryAction) ? (
          <div className="my-request-card__footer-stack">
            <RequestOwnerInsights chrome={chrome} includeSignals={false} />
            <div className="my-request-card__footer-bar">
              <RequestOwnerFooterNote chrome={chrome} card={card} locale={locale} />
              {(chrome.primaryAction || chrome.secondaryAction) ? (
                <div className="my-request-card__action-row">
                  {chrome.secondaryAction ? (
                    <RequestActionControl
                      action={chrome.secondaryAction}
                      variant="secondary"
                      listContext={listContext}
                    />
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary my-request-card__action-btn my-request-card__action-btn--secondary"
                      onClick={() => listContext.onOpenRequest?.(card.requestId, 'view')}
                    >
                      {locale === 'de' ? 'Details öffnen' : 'Open details'}
                    </button>
                  )}
                  {chrome.primaryAction ? (
                    <RequestActionControl
                      action={chrome.primaryAction}
                      variant="primary"
                      listContext={listContext}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      />
    </div>
  );
}

function WorkspaceRequestStatusSlot({
  chrome,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
}) {
  return (
    <span className="request-card__status-actions my-request-card__status-slot">
      {chrome.priorityLabel ? (
        <span className={`my-request-card__priority is-${chrome.priorityTone}`.trim()}>
          {chrome.priorityLabel}
        </span>
      ) : null}
    </span>
  );
}

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

function WorkspaceManagedRequestDialog({
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
                    {chatAction?.chatInput ? (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onOpenChatConversation(chatAction.chatInput!)}
                      >
                        {chatAction.label}
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

function WorkspaceManagedOfferSheet({
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

function cardlessTitle(locale: Locale) {
  return locale === 'de' ? 'Anfrage' : 'Request';
}

function WorkspaceChatDialog({
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
        <iframe
          src={`/chat?conversation=${encodeURIComponent(conversationId)}`}
          title={locale === 'de' ? 'Workspace-Chat' : 'Workspace chat'}
          className="my-request-chat-dialog__frame"
        />
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="my-requests-summary">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`summary-skeleton-${index}`} className="my-requests-summary__card">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-7 w-12" />
        </div>
      ))}
    </div>
  );
}

function CardSkeletonList() {
  return (
    <div className="my-requests-list">
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={`card-skeleton-${index}`} className="panel my-request-card my-request-card--skeleton">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-8 w-full" />
          <div className="skeleton h-4 w-72" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-10 w-56" />
        </article>
      ))}
    </div>
  );
}

function EmptyState({
  locale,
  mode,
}: {
  locale: Locale;
  mode: 'empty' | 'filtered';
}) {
  return (
    <section className="panel my-requests-empty">
      <h3>{mode === 'empty'
        ? (locale === 'de' ? 'Noch keine eigenen Vorgänge' : 'No own workflows yet')
        : (locale === 'de' ? 'Keine Vorgänge für diesen Filter' : 'No items for this filter')}
      </h3>
      <p>
        {mode === 'empty'
          ? (locale === 'de'
            ? 'Sobald du eine Anfrage erstellst oder auf passende Aufträge reagierst, erscheint deine Arbeit hier.'
            : 'Once you create a request or respond to matching jobs, your work will appear here.')
          : (locale === 'de'
            ? 'Passe Status, Rolle oder Zeitraum an.'
            : 'Adjust status, role, or period.')}
      </p>
      <div className="my-requests-empty__actions">
        {mode === 'empty' ? (
          <Link href="/request/create" prefetch={false} className="btn-primary">
            {locale === 'de' ? 'Anfrage erstellen' : 'Create request'}
          </Link>
        ) : null}
        <Link href="/workspace?section=requests&scope=market" prefetch={false} className="btn-secondary">
          {locale === 'de' ? 'Zum Markt' : 'Go to market'}
        </Link>
      </div>
    </section>
  );
}

function AuthGate({
  locale,
  guestLoginHref,
}: {
  locale: Locale;
  guestLoginHref: string;
}) {
  return (
    <section className="panel my-requests-auth-gate">
      <h3>{locale === 'de' ? 'Meine Arbeit ist nur nach Anmeldung verfügbar' : 'My work is only available after sign-in'}</h3>
      <p>
        {locale === 'de'
          ? 'Melde dich an, um deine eigenen Anfragen, Vorgänge und Abschlüsse im Workspace zu verwalten.'
          : 'Sign in to manage your requests, workflows, and completions inside the workspace.'}
      </p>
      <div className="my-requests-empty__actions">
        <Link href={guestLoginHref} prefetch={false} className="btn-primary">
          {locale === 'de' ? 'Anmelden' : 'Sign in'}
        </Link>
        <Link href="/workspace?section=requests&scope=market" prefetch={false} className="btn-secondary">
          {locale === 'de' ? 'Zum Markt' : 'Go to market'}
        </Link>
      </div>
    </section>
  );
}

export function RequestsPrivateActionRail({
  locale,
  panel,
  mode,
  activeRequestId,
  onStartDecisionMode,
  onOpenQueueItem,
  className,
}: RailProps) {
  return (
    <div className={['my-requests-rail', className ?? ''].filter(Boolean).join(' ')}>
      <DecisionPanel
        locale={locale}
        panel={panel}
        isDecisionMode={mode === 'decision'}
        activeRequestId={activeRequestId}
        onStartDecisionMode={onStartDecisionMode}
        onOpenQueueItem={onOpenQueueItem}
      />
    </div>
  );
}

export function RequestsPrivateView({
  locale,
  isWorkspaceAuthed,
  guestLoginHref,
  model,
  isLoading,
  isError,
  decisionState,
  decisionQueueIds,
  onEnterDecisionMode,
  onOpenDecisionItem,
  onExitDecisionMode,
  listContext,
}: RequestsPrivateViewProps) {
  const setStateFilter = useStateFilterMutation();
  const t = useT();
  const qc = useQueryClient();
  const requestsById = React.useMemo(
    () => new Map(model.cards.map((card) => [card.requestId, card])),
    [model.cards],
  );
  const visibleCards = React.useMemo(() => {
    if (decisionState.mode !== 'decision') return model.cards;
    return sortCardsForDecisionMode(model.cards, model.response.decisionPanel);
  }, [decisionState.mode, model.cards, model.response.decisionPanel]);
  const cardRefs = React.useRef(new Map<string, HTMLElement>());
  const [activeRequestState, setActiveRequestState] = React.useState<ManagedRequestState | null>(null);
  const [activeOfferRequestId, setActiveOfferRequestId] = React.useState<string | null>(null);
  const [activeChatState, setActiveChatState] = React.useState<{
    conversationId: string;
    title: string;
  } | null>(null);
  const activeRequestCard = activeRequestState
    ? requestsById.get(activeRequestState.requestId) ?? null
    : null;

  const openRequest = React.useCallback((requestId: string, intent: RequestDialogIntent = 'view') => {
    if (!requestsById.has(requestId)) return;
    setActiveOfferRequestId(null);
    setActiveChatState(null);
    setActiveRequestState({ requestId, intent });
  }, [requestsById]);

  const openOfferSheet = React.useCallback((requestId: string) => {
    if (!requestsById.has(requestId)) return;
    setActiveRequestState(null);
    setActiveChatState(null);
    setActiveOfferRequestId(requestId);
  }, [requestsById]);

  const openChatConversation = React.useCallback(async (payload: WorkspaceChatConversationInput) => {
    try {
      if (!isWorkspaceChatConversationInput(payload)) {
        toast.error(locale === 'de' ? 'Chat konnte nicht geöffnet werden.' : 'Chat could not be opened.');
        return;
      }

      const conversation = await createConversation(payload);
      await qc.invalidateQueries({ queryKey: workspaceQK.chatInbox() });
      const requestTitle = payload.requestId
        ? requestsById.get(payload.requestId)?.requestPreview.title?.trim()
        : '';

      setActiveRequestState(null);
      setActiveOfferRequestId(null);
      setActiveChatState({
        conversationId: conversation.id,
        title: requestTitle || (locale === 'de' ? 'Nachrichten' : 'Messages'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  }, [locale, qc, requestsById, t]);

  const effectiveListContext = React.useMemo<RequestsPrivateListContext>(
    () => ({
      ...listContext,
      onSendOffer: openOfferSheet,
      onEditOffer: openOfferSheet,
      onOpenChatConversation: (payload) => {
        void openChatConversation(payload);
      },
      onOpenRequest: openRequest,
    }),
    [listContext, openChatConversation, openOfferSheet, openRequest],
  );

  React.useEffect(() => {
    if (decisionState.mode !== 'decision' || !decisionState.activeRequestId) return;
    const node = cardRefs.current.get(decisionState.activeRequestId);
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [decisionState.activeRequestId, decisionState.mode]);

  React.useEffect(() => {
    if (!activeRequestState) return;
    if (activeRequestCard) return;
    setActiveRequestState(null);
  }, [activeRequestCard, activeRequestState]);

  React.useEffect(() => {
    if (!activeOfferRequestId) return;
    if (requestsById.has(activeOfferRequestId)) return;
    setActiveOfferRequestId(null);
  }, [activeOfferRequestId, requestsById]);

  if (!isWorkspaceAuthed) {
    return <AuthGate locale={locale} guestLoginHref={guestLoginHref} />;
  }

  if (isError && model.cards.length === 0 && model.emptyMode !== 'empty') {
    return (
      <section className="panel my-requests-empty">
        <h3>{locale === 'de' ? 'Deine Arbeitsansicht konnte nicht geladen werden.' : 'Your work view could not be loaded.'}</h3>
        <p>{locale === 'de' ? 'Bitte versuche es erneut.' : 'Please try again.'}</p>
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          {locale === 'de' ? 'Neu laden' : 'Reload'}
        </button>
      </section>
    );
  }

  return (
    <section className="my-requests-view">
      {isLoading ? <SummarySkeleton /> : (
        <div className="my-requests-summary">
          {(model.response.summary?.items ?? []).map((item) => (
            <SummaryCard key={item.key} locale={locale} item={item} onSelect={setStateFilter} />
          ))}
        </div>
      )}

      {isLoading ? <CardSkeletonList /> : null}

      {!isLoading && model.emptyMode === 'empty' ? <EmptyState locale={locale} mode="empty" /> : null}
      {!isLoading && model.emptyMode === 'filtered' ? <EmptyState locale={locale} mode="filtered" /> : null}
      {!isLoading && visibleCards.length > 0 ? (
        <>
          {decisionState.mode === 'decision' ? (
            <DecisionModeBar
              locale={locale}
              completedInSession={decisionState.completedInSession}
              remainingCount={decisionQueueIds.length}
              onExit={onExitDecisionMode}
            />
          ) : null}
          <div className="my-requests-list">
            {visibleCards.map((card, index) => (
              <div
                key={card.id}
                ref={(node) => {
                  if (node) {
                    cardRefs.current.set(card.requestId, node);
                    return;
                  }
                  cardRefs.current.delete(card.requestId);
                }}
              >
                <MyRequestCard
                  locale={locale}
                  card={card}
                  index={index}
                  mode={decisionState.mode}
                  isActive={decisionState.activeRequestId === card.requestId}
                  listContext={effectiveListContext}
                />
              </div>
            ))}
          </div>
          {model.response.decisionPanel ? (
            <RequestsPrivateActionRail
              locale={locale}
              panel={model.response.decisionPanel}
              mode={decisionState.mode}
              activeRequestId={decisionState.activeRequestId}
              onStartDecisionMode={() => onEnterDecisionMode()}
              onOpenQueueItem={onOpenDecisionItem}
              className="my-requests-view__mobile-rail"
            />
          ) : null}
        </>
      ) : null}
      {activeRequestState && activeRequestCard ? (
        <WorkspaceManagedRequestDialog
          locale={locale}
          card={activeRequestCard}
          initialIntent={activeRequestState.intent}
          onClose={() => setActiveRequestState(null)}
          onOpenOfferSheet={openOfferSheet}
          onOpenChatConversation={(payload) => {
            void openChatConversation(payload);
          }}
        />
      ) : null}
      {activeOfferRequestId ? (
        <WorkspaceManagedOfferSheet
          locale={locale}
          requestId={activeOfferRequestId}
          onClose={() => setActiveOfferRequestId(null)}
        />
      ) : null}
      {activeChatState ? (
        <WorkspaceChatDialog
          locale={locale}
          conversationId={activeChatState.conversationId}
          title={activeChatState.title}
          onClose={() => setActiveChatState(null)}
        />
      ) : null}
      {!isLoading && decisionState.mode === 'decision' && visibleCards.length === 0 && model.response.decisionPanel ? (
        <>
          <DecisionModeBar
            locale={locale}
            completedInSession={decisionState.completedInSession}
            remainingCount={0}
            onExit={onExitDecisionMode}
          />
          <section className="panel my-requests-empty my-requests-empty--success">
            <h3>{locale === 'de' ? 'Alle offenen Entscheidungen erledigt' : 'All open decisions completed'}</h3>
            <p>
              {locale === 'de'
                ? 'Deine Decision Queue ist leer. Du kannst zum normalen Listenmodus zurückkehren.'
                : 'Your decision queue is empty. You can return to the default list mode.'}
            </p>
            <div className="my-requests-empty__actions">
              <button type="button" className="btn-primary" onClick={onExitDecisionMode}>
                {locale === 'de' ? 'Modus beenden' : 'Exit mode'}
              </button>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
