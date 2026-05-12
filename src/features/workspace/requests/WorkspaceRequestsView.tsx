'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { RequestCard } from '@/components/requests/RequestCard';
import type { OwnerRequestActions } from '@/components/requests/requestsList.types';
import { LocationMeta } from '@/components/ui/LocationMeta';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import {
  IconArchive,
  IconCalendar,
  IconCopy,
  IconEdit,
  IconShare,
  IconTrash,
} from '@/components/ui/icons/icons';
import { DecisionModeBar } from '@/features/workspace/requests/components/DecisionModeBar';
import { DecisionPanel } from '@/features/workspace/requests/components/DecisionPanel';
import { RequestsWorkspaceSummary } from '@/features/workspace/requests/components/RequestsWorkspaceSummary';
import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { WorkspaceGuestRequestCard } from '@/features/workspace/requests/components/WorkspaceGuestRequestCard';
import {
  buildRequestsWorkspaceDecisionRailProps,
  buildRequestsWorkspaceSummaryStripProps,
} from '@/features/workspace/requests/requestsWorkspaceSurface.model';
import {
  buildPrivateRequestCardChrome,
  type PrivateRequestCardAction,
} from '@/features/workspace/requests/requestsPrivateCard.model';
import {
  hasOwnerRequestEditCapability,
  resolveOwnerMenuActions,
} from '@/features/workspace/requests/requestOwnerMenu.model';
import type { WorkQueueMode } from '@/features/workspace/requests/requestsDecision.model';
import { sortCardsForDecisionMode } from '@/features/workspace/requests/requestsDecision.model';
import { WorkspacePrivateRequestSessionDialog } from '@/features/workspace/requests/WorkspacePrivateRequestSessionDialog';
import {
  type RequestDialogIntent,
  type WorkspaceRequestOverlayListContext,
  useWorkspaceRequestOverlayFlow,
} from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import type {
  WorkspaceRequestsSurfaceModel,
  WorkspaceRequestsViewCard,
  WorkspaceRequestsViewVariant,
} from '@/features/workspace/requests/workspaceRequestsView.model';
import type { WorkspaceMyRequestCardDto, WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import { pickRequestImage } from '@/lib/requests/images';

export type { WorkspaceRequestsViewVariant } from '@/features/workspace/requests/workspaceRequestsView.model';

export type WorkspaceRequestsViewProps = {
  surface: WorkspaceRequestsSurfaceModel;
};

type RailProps = {
  locale: Locale;
  panel: WorkspaceRequestsDecisionPanelDto;
  mode: WorkQueueMode;
  activeRequestId: string | null;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
  className?: string;
  variant?: WorkspaceRequestsViewVariant;
};

function RequestsListPagination({
  locale,
  page,
  totalPages,
  onPageChange,
}: {
  locale: Locale;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(safeTotalPages, Math.max(1, page));

  return (
    <div className="requests-pagination">
      <RequestsPageNav
        page={safePage}
        totalPages={safeTotalPages}
        onPrevPage={() => onPageChange(Math.max(1, safePage - 1))}
        onNextPage={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
        ariaLabel={locale === 'de' ? 'Seitennavigation für Anfragen' : 'Requests page navigation'}
        prevAriaLabel={locale === 'de' ? 'Vorherige Seite' : 'Previous page'}
        nextAriaLabel={locale === 'de' ? 'Nächste Seite' : 'Next page'}
        prevTitle={locale === 'de' ? 'Vorherige Seite' : 'Previous page'}
        nextTitle={locale === 'de' ? 'Nächste Seite' : 'Next page'}
      />
    </div>
  );
}

function useStateFilterMutation(scope: 'market' | 'my') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return React.useCallback((nextState: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', 'requests');
    params.set('scope', scope);
    params.set('state', nextState);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, scope, searchParams]);
}

function resolveRequestDialogIntent(action: { key: string }): RequestDialogIntent {
  if (action.key === 'contract') return 'contract';
  if (action.key === 'review') return 'review';
  if (action.key === 'review-responses') return 'responses';
  return action.key === 'edit-request' ? 'edit' : 'view';
}

function resolveCardOpenIntent(
  card: Pick<WorkspaceMyRequestCardDto, 'role' | 'status' | 'canEdit'>,
  variant: WorkspaceRequestsViewVariant,
): RequestDialogIntent {
  if (variant === 'market') return 'view';
  return hasOwnerRequestEditCapability(card) ? 'edit' : 'view';
}

function resolveOwnerMenuActionIcon(icon: WorkspaceMyRequestCardDto['status']['actions'][number]['icon']) {
  if (icon === 'edit') return <IconEdit />;
  if (icon === 'copy') return <IconCopy />;
  if (icon === 'share') return <IconShare />;
  if (icon === 'archive') return <IconArchive />;
  if (icon === 'trash') return <IconTrash />;
  return null;
}

function OwnerMenuActionButton({
  children,
  icon,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
}) {
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={`my-request-card__owner-menu-item ${className ?? ''}`.trim()}
    >
      <span className="my-request-card__owner-menu-item-label">{children}</span>
      {icon ? (
        <span className="my-request-card__owner-menu-item-icon" aria-hidden="true">{icon}</span>
      ) : null}
    </button>
  );
}

function OwnerMenuActionLink({
  children,
  icon,
  className,
  ...props
}: React.ComponentProps<typeof Link> & {
  icon?: React.ReactNode;
}) {
  return (
    <Link
      {...props}
      className={`my-request-card__owner-menu-item ${className ?? ''}`.trim()}
    >
      <span className="my-request-card__owner-menu-item-label">{children}</span>
      {icon ? (
        <span className="my-request-card__owner-menu-item-icon" aria-hidden="true">{icon}</span>
      ) : null}
    </Link>
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
  preferInlineRequestOpen,
}: {
  action: PrivateRequestCardAction;
  variant: 'primary' | 'secondary';
  listContext: WorkspaceRequestOverlayListContext;
  preferInlineRequestOpen: boolean;
}) {
  const className = [
    variant === 'primary' ? 'btn-ghost is-primary' : 'btn-secondary',
    'my-request-card__action-btn',
    `my-request-card__action-btn--${variant}`,
  ].join(' ');

  if (preferInlineRequestOpen && action.kind === 'link' && action.requestId && listContext.onOpenRequest) {
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

  if (!preferInlineRequestOpen && action.kind === 'link' && action.requestId && listContext.onOpenRequest) {
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

  if (action.kind === 'review_responses' && action.requestId && listContext.onOpenRequest) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => listContext.onOpenRequest?.(action.requestId!, 'responses')}
      >
        {action.label}
      </button>
    );
  }

  if (action.kind === 'publish_request' && action.requestId) {
    return (
      <button
        type="button"
        className={className}
        disabled={listContext.ownerRequestActions?.pendingPublishRequestId === action.requestId}
        onClick={() => listContext.ownerRequestActions?.onPublish?.(action.requestId!)}
      >
        {action.label}
      </button>
    );
  }

  if (action.kind === 'unpublish_request' && action.requestId) {
    return (
      <button
        type="button"
        className={className}
        disabled={listContext.ownerRequestActions?.pendingUnpublishRequestId === action.requestId}
        onClick={() => listContext.ownerRequestActions?.onUnpublish?.(action.requestId!)}
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
        onClick={() => listContext.onWithdrawOffer?.(action.offerId!, action.requestId!)}
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
  workspaceVariant,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
  card: WorkspaceRequestsViewCard;
  locale: Locale;
  workspaceVariant: WorkspaceRequestsViewVariant;
}) {
  const noteFromInsights = chrome.insights
    .map((item) => item.description.trim())
    .find(Boolean);
  const noteFromDecision = card.decision.actionReason?.trim();
  const noteFromActivity = card.activity?.label?.trim();

  let fallbackNote: string;
  if (workspaceVariant === 'market') {
    fallbackNote = locale === 'de'
      ? 'Öffne die Details, um diesen Marktvorgang im Kontext zu prüfen.'
      : 'Open the details to review this market item in context.';
  } else if (card.decision.actionType === 'review_offers') {
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
  } else if (card.decision.actionType === 'review_completion') {
    fallbackNote = locale === 'de'
      ? 'Der Auftrag ist abgeschlossen. Hinterlasse jetzt dein Feedback zum Anbieter.'
      : 'The job is completed. Leave your feedback for the provider now.';
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
  workspaceVariant,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
  locale: Locale;
  card: WorkspaceMyRequestCardDto;
  steps: WorkspaceMyRequestCardDto['progress']['steps'];
  ownerRequestActions?: OwnerRequestActions;
  onOpenRequest?: WorkspaceRequestOverlayListContext['onOpenRequest'];
  workspaceVariant: WorkspaceRequestsViewVariant;
}) {
  const statusClassName = card.status.badgeTone ? `status-badge status-badge--${card.status.badgeTone}` : null;
  const showOwnerMenu = workspaceVariant === 'private' && card.role === 'customer';

  return (
    <div className="my-request-card__topslot">
      {(statusClassName || showOwnerMenu) ? (
        <div className="my-request-card__topbar">
          <div className="my-request-card__topbar-start">
            {card.status.badgeLabel && statusClassName ? (
              <span className={`${statusClassName} my-request-card__status-badge`.trim()}>
                {card.status.badgeLabel}
              </span>
            ) : null}
          </div>
          <div className="my-request-card__topbar-end">
            {showOwnerMenu ? (
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
  onOpenRequest?: WorkspaceRequestOverlayListContext['onOpenRequest'];
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
    () => resolveOwnerMenuActions({ card }),
    [card],
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
            const actionIcon = resolveOwnerMenuActionIcon(action.icon);
            if (action.kind === 'link' && action.href) {
              if (action.requestId && onOpenRequest) {
                return (
                  <OwnerMenuActionButton
                    key={action.key}
                    role="menuitem"
                    icon={actionIcon}
                    onClick={() => {
                      closeMenu();
                      onOpenRequest(action.requestId!, resolveRequestDialogIntent(action));
                    }}
                  >
                    {action.label}
                  </OwnerMenuActionButton>
                );
              }

              return (
                <OwnerMenuActionLink
                  key={action.key}
                  href={action.href}
                  prefetch={false}
                  role="menuitem"
                  icon={actionIcon}
                  onClick={closeMenu}
                >
                  {action.label}
                </OwnerMenuActionLink>
              );
            }

            if (action.kind === 'share_request') {
              return (
                <OwnerMenuActionButton
                  key={action.key}
                  role="menuitem"
                  icon={actionIcon}
                  onClick={() => void handleShare(action.href)}
                >
                  {action.label}
                </OwnerMenuActionButton>
              );
            }

            if (action.kind === 'duplicate_request' && action.requestId) {
              return (
                <OwnerMenuActionButton
                  key={action.key}
                  role="menuitem"
                  icon={actionIcon}
                  disabled={ownerRequestActions?.pendingDuplicateRequestId === action.requestId}
                  onClick={() => {
                    closeMenu();
                    ownerRequestActions?.onDuplicate?.(action.requestId!);
                  }}
                >
                  {action.label}
                </OwnerMenuActionButton>
              );
            }

            if (action.kind === 'archive_request' && action.requestId) {
              return (
                <OwnerMenuActionButton
                  key={action.key}
                  role="menuitem"
                  icon={actionIcon}
                  disabled={ownerRequestActions?.pendingArchiveRequestId === action.requestId}
                  onClick={() => {
                    closeMenu();
                    ownerRequestActions?.onArchive?.(action.requestId!);
                  }}
                >
                  {action.label}
                </OwnerMenuActionButton>
              );
            }

            if (action.kind === 'delete_request' && action.requestId) {
              return (
                <OwnerMenuActionButton
                  key={action.key}
                  className="is-danger"
                  role="menuitem"
                  icon={actionIcon}
                  disabled={ownerRequestActions?.pendingDeleteRequestId === action.requestId}
                  onClick={() => handleDelete(action.requestId!)}
                >
                  {action.label}
                </OwnerMenuActionButton>
              );
            }

            return null;
          })}
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceRequestCard({
  workspaceVariant,
  locale,
  card,
  index,
  mode,
  isActive,
  listContext,
  favoriteState = null,
}: {
  workspaceVariant: WorkspaceRequestsViewVariant;
  locale: Locale;
  card: WorkspaceRequestsViewCard;
  index: number;
  mode: WorkQueueMode;
  isActive: boolean;
  listContext: WorkspaceRequestOverlayListContext;
  favoriteState?: WorkspaceRequestsSurfaceModel['favoriteState'];
}) {
  const preview = card.requestPreview;
  const chrome = React.useMemo(
    () => buildPrivateRequestCardChrome({ card, locale }),
    [card, locale],
  );
  const cardOpenIntent = React.useMemo(
    () => resolveCardOpenIntent(card, workspaceVariant),
    [card, workspaceVariant],
  );
  const meta: React.ReactNode[] = [];
  const preferInlineRequestOpen = workspaceVariant === 'private';

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

  if (workspaceVariant === 'market') {
    const marketActions = [chrome.secondaryAction, chrome.primaryAction].filter(Boolean) as PrivateRequestCardAction[];

    return (
      <div className="workspace-guest-request-card-shell" data-request-id={card.requestId}>
        <WorkspaceGuestRequestCard
          prefetch={index < 2}
          href={preview.href}
          className={[
            'workspace-guest-request-card',
            'workspace-guest-request-card--market',
            marketActions.length > 0 ? 'workspace-guest-request-card--with-actions' : '',
          ].filter(Boolean).join(' ')}
          ariaLabel={locale === 'de' ? 'Anfrage öffnen' : 'Open request'}
          imageSrc={preview.imageUrl || pickRequestImage(preview.imageCategoryKey ?? '')}
          imageAlt=""
          imagePriority={index === 0}
          categoryLabel={preview.categoryLabel}
          title={preview.title}
          excerpt={preview.excerpt}
          cityLabel={preview.cityLabel}
          dateLabel={preview.dateLabel}
          priceLabel={preview.priceLabel}
          priceTrend={preview.priceTrend ?? null}
          priceTrendLabel={preview.priceTrendLabel ?? null}
          isActive={isActive}
          badgeLabel={preview.badgeLabel ?? null}
          overlaySlot={favoriteState ? (
            <FavoriteButton
              variant="icon"
              isFavorite={favoriteState.favoriteRequestIds.has(card.requestId)}
              isPending={favoriteState.pendingFavoriteRequestIds.has(card.requestId)}
              onToggle={() => favoriteState.onToggleRequestFavorite(card.requestId)}
              ariaLabel={locale === 'de' ? 'Anfrage merken' : 'Save request'}
              title={locale === 'de' ? 'Anfrage merken' : 'Save request'}
              className="workspace-guest-request-card__favorite-btn"
            />
          ) : null}
          actionSlot={marketActions.length > 0 ? (
            <div className="workspace-guest-request-card__footer">
              <div className="workspace-guest-request-card__action-row">
                  {marketActions.slice(0, 2).map((action, actionIndex) => (
                    <RequestActionControl
                      key={`${action.key}-${actionIndex}`}
                      action={action}
                      variant={actionIndex === marketActions.length - 1 ? 'primary' : 'secondary'}
                      listContext={listContext}
                      preferInlineRequestOpen={false}
                    />
                  ))}
              </div>
            </div>
          ) : null}
        />
      </div>
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
        onOpen={preferInlineRequestOpen ? () => listContext.onOpenRequest?.(card.requestId, cardOpenIntent) : undefined}
        isActive={isActive}
        topSlot={(
          <RequestCardTopSlot
            chrome={chrome}
            locale={locale}
            card={card}
            steps={card.progress.steps}
            ownerRequestActions={listContext.ownerRequestActions}
            onOpenRequest={listContext.onOpenRequest}
            workspaceVariant={workspaceVariant}
          />
        )}
        statusSlot={<WorkspaceRequestStatusSlot chrome={chrome} />}
        actionSlot={(chrome.insights.length > 0 || chrome.primaryAction || chrome.secondaryAction) ? (
          <div className="my-request-card__footer-stack">
            <RequestOwnerInsights chrome={chrome} includeSignals={false} />
            <div className="my-request-card__footer-bar">
              <RequestOwnerFooterNote
                chrome={chrome}
                card={card}
                locale={locale}
                workspaceVariant={workspaceVariant}
              />
              {(chrome.primaryAction || chrome.secondaryAction) ? (
                <div className="my-request-card__action-row">
                  {chrome.secondaryAction ? (
                    <RequestActionControl
                      action={chrome.secondaryAction}
                      variant="secondary"
                      listContext={listContext}
                      preferInlineRequestOpen={preferInlineRequestOpen}
                    />
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary my-request-card__action-btn my-request-card__action-btn--secondary"
                      onClick={() => listContext.onOpenRequest?.(card.requestId, cardOpenIntent)}
                    >
                      {locale === 'de' ? 'Details öffnen' : 'Open details'}
                    </button>
                  )}
                  {chrome.primaryAction ? (
                    <RequestActionControl
                      action={chrome.primaryAction}
                      variant="primary"
                      listContext={listContext}
                      preferInlineRequestOpen={preferInlineRequestOpen}
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
  workspaceVariant,
  emptyCtaHref,
  secondaryCtaHref,
}: {
  locale: Locale;
  mode: 'empty' | 'filtered';
  workspaceVariant: WorkspaceRequestsViewVariant;
  emptyCtaHref?: string;
  secondaryCtaHref?: string;
}) {
  const isMarket = workspaceVariant === 'market';

  return (
    <section className="panel my-requests-empty">
      <h3>{mode === 'empty'
        ? (isMarket
          ? (locale === 'de' ? 'Noch keine Marktvorgänge' : 'No market items yet')
          : (locale === 'de' ? 'Noch keine eigenen Vorgänge' : 'No own workflows yet'))
        : (isMarket
          ? (locale === 'de' ? 'Keine Marktvorgänge für diesen Filter' : 'No market items for this filter')
          : (locale === 'de' ? 'Keine Vorgänge für diesen Filter' : 'No items for this filter'))}
      </h3>
      <p>
        {mode === 'empty'
          ? (isMarket
            ? (locale === 'de'
              ? 'Sobald neue Anfragen im Markt eintreffen, erscheinen sie hier in derselben Arbeitsoberfläche.'
              : 'As new requests enter the market, they will appear here in the same workspace surface.')
            : (locale === 'de'
              ? 'Sobald du eine Anfrage erstellst oder auf passende Aufträge reagierst, erscheint deine Arbeit hier.'
              : 'Once you create a request or respond to matching jobs, your work will appear here.'))
          : (locale === 'de'
            ? 'Passe Status, Rolle oder Zeitraum an.'
            : 'Adjust status, role, or period.')}
      </p>
      <div className="my-requests-empty__actions">
        {emptyCtaHref ? (
          <Link href={emptyCtaHref} prefetch={false} className="btn-primary">
            {isMarket
              ? (locale === 'de' ? 'Markt aktualisieren' : 'Refresh market')
              : (locale === 'de' ? 'Anfrage erstellen' : 'Create request')}
          </Link>
        ) : null}
        {secondaryCtaHref ? (
          <Link href={secondaryCtaHref} prefetch={false} className="btn-secondary">
            {isMarket
              ? (locale === 'de' ? 'Zu Anbietern' : 'Go to providers')
              : (locale === 'de' ? 'Zum Markt' : 'Go to market')}
          </Link>
        ) : null}
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
  variant = 'private',
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
        variant={variant}
      />
    </div>
  );
}

export function WorkspaceRequestsView({
  surface,
}: WorkspaceRequestsViewProps) {
  const {
    variant,
    locale,
    isWorkspaceAuthed,
    guestLoginHref,
    listDensity = null,
    pagination = null,
    model,
    isLoading,
    isError,
    decisionState,
    decisionQueueIds,
    onEnterDecisionMode,
    onOpenDecisionItem,
    onExitDecisionMode,
    listContext,
    emptyCtaHref,
    secondaryCtaHref,
    favoriteState = null,
  } = surface;
  const setStateFilter = useStateFilterMutation(variant === 'market' ? 'market' : 'my');
  const decisionPanel = model.response ? model.response.decisionPanel : null;
  const visibleCards = React.useMemo(() => {
    if (decisionState.mode !== 'decision') return model.cards;
    return sortCardsForDecisionMode(model.cards, decisionPanel);
  }, [decisionPanel, decisionState.mode, model.cards]);
  const cardRefs = React.useRef(new Map<string, HTMLElement>());
  const overlayInputContext = React.useMemo(
    () => ({
      onSendOffer: listContext.onSendOffer,
      onEditOffer: listContext.onEditOffer,
      onWithdrawOffer: listContext.onWithdrawOffer,
      onOpenChatConversation: listContext.onOpenChatConversation,
      pendingOfferRequestId: listContext.pendingOfferRequestId,
      ownerRequestActions: listContext.ownerRequestActions,
    }),
    [
      listContext.onEditOffer,
      listContext.onOpenChatConversation,
      listContext.onSendOffer,
      listContext.onWithdrawOffer,
      listContext.ownerRequestActions,
      listContext.pendingOfferRequestId,
    ],
  );
  const {
    activeChatState,
    activeOfferRequestId,
    activeRequestCard,
    activeRequestState,
    closeChat,
    closeOfferSheet,
    closeRequest,
    effectiveListContext,
    openChatConversation,
    openOfferSheet,
  } = useWorkspaceRequestOverlayFlow({
    locale,
    cards: model.cards,
    listContext: overlayInputContext,
  });
  const resolvedListContext = React.useMemo<WorkspaceRequestOverlayListContext>(
    () => (
      variant === 'private'
        ? effectiveListContext
        : {
            ...overlayInputContext,
            onOpenRequest: listContext.onOpenRequest,
          }
    ),
    [effectiveListContext, listContext.onOpenRequest, overlayInputContext, variant],
  );

  React.useEffect(() => {
    if (decisionState.mode !== 'decision' || !decisionState.activeRequestId) return;
    const node = cardRefs.current.get(decisionState.activeRequestId);
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [decisionState.activeRequestId, decisionState.mode]);

  if (variant === 'private' && !isWorkspaceAuthed) {
    return <AuthGate locale={locale} guestLoginHref={guestLoginHref} />;
  }

  if (isError && model.cards.length === 0 && model.emptyMode !== 'empty') {
    return (
      <section className="panel my-requests-empty">
        <h3>{variant === 'market'
          ? (locale === 'de' ? 'Die Marktansicht konnte nicht geladen werden.' : 'The market view could not be loaded.')
          : (locale === 'de' ? 'Deine Arbeitsansicht konnte nicht geladen werden.' : 'Your work view could not be loaded.')}
        </h3>
        <p>{locale === 'de' ? 'Bitte versuche es erneut.' : 'Please try again.'}</p>
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          {locale === 'de' ? 'Neu laden' : 'Reload'}
        </button>
      </section>
    );
  }

  return (
    <section className="my-requests-view">
      <RequestsWorkspaceSummary
        summaryStripProps={
          !isLoading && model.response
            ? buildRequestsWorkspaceSummaryStripProps({
              locale,
              items: model.response.summary.items,
              onSelect: setStateFilter,
              variant,
            })
            : undefined
        }
        isLoading={isLoading}
      />

      {isLoading ? <CardSkeletonList /> : null}

      {!isLoading && model.emptyMode === 'empty' ? (
        <EmptyState
          locale={locale}
          mode="empty"
          workspaceVariant={variant}
          emptyCtaHref={emptyCtaHref}
          secondaryCtaHref={secondaryCtaHref}
        />
      ) : null}
      {!isLoading && model.emptyMode === 'filtered' ? (
        <EmptyState
          locale={locale}
          mode="filtered"
          workspaceVariant={variant}
          emptyCtaHref={emptyCtaHref}
          secondaryCtaHref={secondaryCtaHref}
        />
      ) : null}
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
          <div
            className={[
              'my-requests-list',
              variant === 'market' && listDensity === 'double' ? 'my-requests-list--market-double' : '',
              variant === 'market' && listDensity === 'single' ? 'my-requests-list--market-single' : '',
            ].filter(Boolean).join(' ')}
          >
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
                <WorkspaceRequestCard
                  workspaceVariant={variant}
                  locale={locale}
                  card={card}
                  index={index}
                  mode={decisionState.mode}
                  isActive={decisionState.activeRequestId === card.requestId}
                  listContext={resolvedListContext}
                  favoriteState={favoriteState}
                />
              </div>
            ))}
          </div>
          {decisionPanel ? (
            <RequestsPrivateActionRail
              {...buildRequestsWorkspaceDecisionRailProps({
                locale,
                panel: decisionPanel,
                mode: decisionState.mode,
                activeRequestId: decisionState.activeRequestId,
                onStartDecisionMode: () => onEnterDecisionMode(),
                onOpenQueueItem: onOpenDecisionItem,
                className: 'my-requests-view__mobile-rail',
                variant,
              })}
            />
          ) : null}
          {pagination ? (
            <RequestsListPagination
              locale={locale}
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          ) : null}
        </>
      ) : null}
      {variant === 'private' && ((activeRequestState && activeRequestCard) || activeOfferRequestId || activeChatState) ? (
        <WorkspacePrivateRequestSessionDialog
          locale={locale}
          activeRequestState={activeRequestState}
          activeRequestCard={activeRequestCard}
          activeOfferRequestId={activeOfferRequestId}
          activeChatState={activeChatState}
          onDismissSession={closeRequest}
          onCloseOfferSheet={closeOfferSheet}
          onCloseChat={closeChat}
          onOpenOfferSheet={openOfferSheet}
          onOpenChatConversation={(payload) => {
            void openChatConversation(payload);
          }}
        />
      ) : null}
      {!isLoading && decisionState.mode === 'decision' && visibleCards.length === 0 && decisionPanel ? (
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
