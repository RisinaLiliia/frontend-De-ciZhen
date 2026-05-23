'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { RequestCard } from '@/components/requests/RequestCard';
import { WorkspaceGuestRequestCard } from '@/components/requests/WorkspaceGuestRequestCard';
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
import { WorkspaceRequestsActionRail } from '@/features/workspace/ai-rail/WorkspaceRequestsActionRail';
import { WorkspaceDecisionModeBar } from '@/features/workspace/ai-rail/WorkspaceDecisionModeBar';
import { WorkspaceRequestsSectionSummary } from '@/features/workspace/ai-rail/WorkspaceRequestsSectionSummary';
import {
  buildRequestsWorkspaceDecisionRailProps,
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
import { PrivateRequestSessionDialog } from '@/features/workspace/overlays/PrivateRequestSessionDialog';
import { WorkspaceBadge, type WorkspaceBadgeVariant } from '@/features/workspace/shared/WorkspaceBadge';
import {
  type RequestDialogIntent,
  type WorkspaceRequestOverlayListContext,
  useWorkspaceRequestOverlayFlow,
} from '@/features/workspace/overlays/useWorkspaceRequestOverlayFlow';
import type {
  WorkspaceRequestsSurfaceModel,
  WorkspaceRequestsViewCard,
  WorkspaceRequestsViewVariant,
} from '@/features/workspace/requests/workspaceRequestsView.model';
import { workspaceMutedPanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';
import { pickRequestImage } from '@/lib/requests/images';
import { AuthGate, CardSkeletonList, EmptyState } from '@/features/workspace/requests/RequestsViewStates';
import { RequestsListPagination } from '@/features/workspace/requests/RequestsListPagination';
import {
  RequestOwnerFooterNote,
  RequestOwnerInsights,
} from '@/features/workspace/requests/RequestsViewInsights';

export type { WorkspaceRequestsViewVariant } from '@/features/workspace/requests/workspaceRequestsView.model';

export type WorkspaceRequestsViewProps = {
  surface: WorkspaceRequestsSurfaceModel;
};

function tx(locale: Locale, key: I18nKey) {
  return translate(key, locale);
}

function fillLocaleTemplate(locale: Locale, key: I18nKey, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [token, value]) => result.replace(`{${token}}`, value),
    tx(locale, key),
  );
}

function resolveRequestDialogIntent(action: { key: string }): RequestDialogIntent {
  if (action.key === 'contract') return 'contract';
  if (action.key === 'review') return 'review';
  if (action.key === 'review-responses') return 'responses';
  return action.key === 'edit-request' ? 'edit' : 'view';
}

function resolveCardOpenIntent(
  card: Pick<WorkspaceRequestsViewCard, 'role' | 'status' | 'canEdit'>,
  variant: WorkspaceRequestsViewVariant,
): RequestDialogIntent {
  if (variant === 'market') return 'view';
  return hasOwnerRequestEditCapability(card) ? 'edit' : 'view';
}

function resolveOwnerMenuActionIcon(icon: WorkspaceRequestsViewCard['status']['actions'][number]['icon']) {
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
  card: WorkspaceRequestsViewCard;
  steps: WorkspaceRequestsViewCard['progress']['steps'];
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

  const resolveStepMeta = React.useCallback((step: WorkspaceRequestsViewCard['progress']['steps'][number]) => {
    if (step.key === 'request') {
      return card.createdAt?.trim()
        || tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowCreatedMeta);
    }

    if (step.key === 'offers') {
      if (card.decision.actionType === 'review_offers' && card.decision.actionLabel?.trim()) {
        return card.decision.actionLabel.trim();
      }

      if (step.status === 'done') {
        return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowReceivedMeta);
      }

      if (step.status === 'current') {
        return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowPendingMeta);
      }

      return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowNotStartedMeta);
    }

    if (step.key === 'selection') {
      if (step.status === 'done') {
        return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowSelectedMeta);
      }

      if (step.status === 'current') {
        return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowPendingMeta);
      }

      return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowNotStartedMeta);
    }

    if (step.key === 'contract') {
      if (step.status === 'done') {
        return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowConfirmedMeta);
      }

      if (step.status === 'current') {
        return card.nextEventAt?.trim()
          ? fillLocaleTemplate(locale, I18N_KEYS.requestsPage.workspaceWorkflowActiveWithDate, { date: card.nextEventAt })
          : tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowActiveMeta);
      }

      return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowNotCreatedMeta);
    }

    if (card.state === 'completed') {
      return tx(locale, I18N_KEYS.requestsPage.statusCompleted);
    }

    if (card.state === 'active') {
      return tx(locale, I18N_KEYS.requestsPage.statusInProgress);
    }

    return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowNotStartedMeta);
  }, [card, locale]);

  return (
    <div className="my-request-card__progress-scroll">
      <div className="my-request-card__progress-shell">
        <div
          className="my-request-card__progress"
          role="list"
          aria-label={tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowProgressLabel)}
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
  card: WorkspaceRequestsViewCard;
  steps: WorkspaceRequestsViewCard['progress']['steps'];
  ownerRequestActions?: OwnerRequestActions;
  onOpenRequest?: WorkspaceRequestOverlayListContext['onOpenRequest'];
  workspaceVariant: WorkspaceRequestsViewVariant;
}) {
  const statusVariant: WorkspaceBadgeVariant = card.status.badgeVariant ?? 'neutral';
  const showOwnerMenu = workspaceVariant === 'private' && card.role === 'customer';

  return (
    <div className="my-request-card__topslot">
      {(card.status.badgeLabel || showOwnerMenu) ? (
        <div className="my-request-card__topbar">
          <div className="my-request-card__topbar-start">
            {card.status.badgeLabel ? (
              <WorkspaceBadge variant={statusVariant} className="my-request-card__state-chip">
                {card.status.badgeLabel}
              </WorkspaceBadge>
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
  card: WorkspaceRequestsViewCard;
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
        toast.success(tx(locale, I18N_KEYS.requestDetails.workspaceLinkCopied));
      } else {
        window.prompt(tx(locale, I18N_KEYS.requestDetails.workspaceShareLink), shareUrl);
      }
    } catch {
      toast.error(tx(locale, I18N_KEYS.requestDetails.workspaceShareFailed));
    }
  }, [card.requestPreview.title, closeMenu, locale, requestHref]);

  const handleDelete = React.useCallback((requestId: string) => {
    closeMenu();

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        tx(locale, I18N_KEYS.requestsPage.workspaceDeleteRequestConfirm),
      );
      if (!confirmed) return;
    }

    ownerRequestActions?.onDelete?.(requestId);
  }, [closeMenu, locale, ownerRequestActions]);

  return (
    <div ref={menuRef} className="my-request-card__owner-menu" data-card-action="true">
      <MoreDotsLink
        label={tx(locale, I18N_KEYS.requestsPage.workspaceOpenRequestMenu)}
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
          ariaLabel={tx(locale, I18N_KEYS.requestsPage.openRequest)}
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
              ariaLabel={tx(locale, I18N_KEYS.requestsPage.workspaceSaveRequest)}
              title={tx(locale, I18N_KEYS.requestsPage.workspaceSaveRequest)}
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
        ariaLabel={tx(locale, I18N_KEYS.requestsPage.openRequest)}
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
                      {tx(locale, I18N_KEYS.requestsPage.workspaceOpenDetails)}
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

export { WorkspaceRequestsActionRail as RequestsPrivateActionRail };

export function RequestsView({
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
      <section className={workspaceMutedPanelShell('my-requests-empty')}>
        <h3>{variant === 'market'
          ? tx(locale, I18N_KEYS.requestsPage.workspaceMarketLoadErrorTitle)
          : tx(locale, I18N_KEYS.requestsPage.workspacePrivateLoadErrorTitle)}
        </h3>
        <p>{tx(locale, I18N_KEYS.requestsPage.workspaceReloadHint)}</p>
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          {tx(locale, I18N_KEYS.common.retry)}
        </button>
      </section>
    );
  }

  return (
    <section className="my-requests-view">
      <WorkspaceRequestsSectionSummary
        locale={locale}
        items={model.response?.summary.items}
        variant={variant}
        isLoading={isLoading}
        className="workspace-summary-grid--mobile-only"
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
            <WorkspaceDecisionModeBar
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
            <WorkspaceRequestsActionRail
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
        <PrivateRequestSessionDialog
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
          <WorkspaceDecisionModeBar
            locale={locale}
            completedInSession={decisionState.completedInSession}
            remainingCount={0}
            onExit={onExitDecisionMode}
          />
          <section className={workspaceMutedPanelShell('my-requests-empty', 'my-requests-empty--success')}>
            <h3>{tx(locale, I18N_KEYS.requestsPage.workspaceDecisionDoneTitle)}</h3>
            <p>{tx(locale, I18N_KEYS.requestsPage.workspaceDecisionDoneHint)}</p>
            <div className="my-requests-empty__actions">
              <button type="button" className="btn-primary" onClick={onExitDecisionMode}>
                {tx(locale, I18N_KEYS.requestsPage.workspaceDecisionDoneCta)}
              </button>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
