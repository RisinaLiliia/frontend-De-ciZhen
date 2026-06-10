'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { buildRequestsWorkspaceDecisionRailProps } from '@/features/workspace/requests/requestsWorkspaceSurface.model';
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
import { PublicRequestSessionDialog } from '@/features/workspace/overlays/PublicRequestSessionDialog';
import { useWorkspacePublicRequestOverlayFlow } from '@/features/workspace/overlays/useWorkspacePublicRequestOverlayFlow';
import {
  WorkspaceBadge,
  type WorkspaceBadgeVariant,
} from '@/features/workspace/shared/WorkspaceBadge';
import {
  type RequestDialogIntent,
  type WorkspaceRequestOverlayListContext,
  useWorkspaceRequestOverlayFlow,
} from '@/features/workspace/overlays/useWorkspaceRequestOverlayFlow';
import { WorkspaceCreateRequestOverlay } from '@/features/workspace/requests/create/WorkspaceCreateRequestOverlay';
import type {
  WorkspaceRequestsSurfaceModel,
  WorkspaceRequestsViewCard,
  WorkspaceRequestsViewVariant,
} from '@/features/workspace/requests/workspaceRequestsView.model';
import {
  buildWorkspaceOwnRequestDetailHref,
  buildWorkspaceRequestDetailHref,
  buildWorkspaceRequestOverlayHref,
  clearWorkspaceRequestOverlayHref,
  readWorkspaceRequestRouteState,
} from '@/features/workspace/requests/workspaceRequestRoute.model';
import { workspaceMutedPanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';
import { pickRequestImage } from '@/lib/requests/images';
import {
  AuthGate,
  CardSkeletonList,
  EmptyState,
} from '@/features/workspace/requests/RequestsViewStates';
import { RequestsListPagination } from '@/features/workspace/requests/RequestsListPagination';
import {
  RequestOwnerFooterNote,
  RequestOwnerInsights,
} from '@/features/workspace/requests/RequestsViewInsights';
import { WorkflowProgress } from '@/features/workspace/requests/RequestsWorkflowProgress';

export type { WorkspaceRequestsViewVariant } from '@/features/workspace/requests/workspaceRequestsView.model';

export type WorkspaceRequestsViewProps = {
  surface: WorkspaceRequestsSurfaceModel;
};

function tx(locale: Locale, key: I18nKey) {
  return translate(key, locale);
}

type WorkspaceRequestRouteState = ReturnType<typeof readWorkspaceRequestRouteState>;

function areWorkspaceRequestRouteStatesEqual(
  left: WorkspaceRequestRouteState,
  right: WorkspaceRequestRouteState,
) {
  return (
    left.requestCreate === right.requestCreate &&
    left.requestId === right.requestId &&
    left.requestIntent === right.requestIntent &&
    left.requestPanel === right.requestPanel &&
    left.requestProfile === right.requestProfile
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

function resolveWorkspaceRequestHref(
  card: Pick<WorkspaceRequestsViewCard, 'requestId'>,
  workspaceVariant: WorkspaceRequestsViewVariant,
) {
  if (workspaceVariant === 'market') {
    return buildWorkspaceRequestDetailHref({
      currentSearch: '',
      requestId: card.requestId,
    });
  }

  return buildWorkspaceOwnRequestDetailHref({
    currentSearch: '',
    requestId: card.requestId,
  });
}

function resolveOwnerMenuActionIcon(
  icon: WorkspaceRequestsViewCard['status']['actions'][number]['icon'],
) {
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
        <span className="my-request-card__owner-menu-item-icon" aria-hidden="true">
          {icon}
        </span>
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
    <Link {...props} className={`my-request-card__owner-menu-item ${className ?? ''}`.trim()}>
      <span className="my-request-card__owner-menu-item-label">{children}</span>
      {icon ? (
        <span className="my-request-card__owner-menu-item-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </Link>
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

  if (
    preferInlineRequestOpen &&
    action.kind === 'link' &&
    action.requestId &&
    listContext.onOpenRequest
  ) {
    return (
      <button
        type="button"
        className={className}
        onClick={() =>
          listContext.onOpenRequest?.(action.requestId!, resolveRequestDialogIntent(action))
        }
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

  if (
    !preferInlineRequestOpen &&
    action.kind === 'link' &&
    action.requestId &&
    listContext.onOpenRequest
  ) {
    return (
      <button
        type="button"
        className={className}
        onClick={() =>
          listContext.onOpenRequest?.(action.requestId!, resolveRequestDialogIntent(action))
        }
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
  requestHref,
  steps,
  ownerRequestActions,
  onOpenRequest,
  workspaceVariant,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
  locale: Locale;
  card: WorkspaceRequestsViewCard;
  requestHref: string;
  steps: WorkspaceRequestsViewCard['progress']['steps'];
  ownerRequestActions?: OwnerRequestActions;
  onOpenRequest?: WorkspaceRequestOverlayListContext['onOpenRequest'];
  workspaceVariant: WorkspaceRequestsViewVariant;
}) {
  const statusVariant: WorkspaceBadgeVariant = card.status.badgeVariant ?? 'neutral';
  const showOwnerMenu = workspaceVariant === 'private' && card.role === 'customer';

  return (
    <div className="my-request-card__topslot">
      {card.status.badgeLabel || chrome.priorityLabel || showOwnerMenu ? (
        <div className="my-request-card__topbar">
          <div className="my-request-card__topbar-start">
            {card.status.badgeLabel ? (
              <WorkspaceBadge variant={statusVariant} className="my-request-card__state-chip">
                {card.status.badgeLabel}
              </WorkspaceBadge>
            ) : null}
            {chrome.priorityLabel ? (
              <span className={`my-request-card__priority is-${chrome.priorityTone}`.trim()}>
                {chrome.priorityLabel}
              </span>
            ) : null}
          </div>
          <div className="my-request-card__topbar-end">
            {showOwnerMenu ? (
              <RequestOwnerMenu
                locale={locale}
                card={card}
                requestHref={requestHref}
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
  requestHref,
  ownerRequestActions,
  onOpenRequest,
}: {
  locale: Locale;
  card: WorkspaceRequestsViewCard;
  requestHref: string;
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

  const menuActions = React.useMemo(() => resolveOwnerMenuActions({ card }), [card]);

  const closeMenu = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleShare = React.useCallback(
    async (shareHref?: string | null) => {
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
    },
    [card.requestPreview.title, closeMenu, locale, requestHref],
  );

  const handleDelete = React.useCallback(
    (requestId: string) => {
      closeMenu();

      if (typeof window !== 'undefined') {
        const confirmed = window.confirm(
          tx(locale, I18N_KEYS.requestsPage.workspaceDeleteRequestConfirm),
        );
        if (!confirmed) return;
      }

      ownerRequestActions?.onDelete?.(requestId);
    },
    [closeMenu, locale, ownerRequestActions],
  );

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
                  onClick={() => void handleShare()}
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
  const requestHref = React.useMemo(
    () => resolveWorkspaceRequestHref(card, workspaceVariant),
    [card, workspaceVariant],
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
    const marketActions = [chrome.secondaryAction, chrome.primaryAction].filter(
      Boolean,
    ) as PrivateRequestCardAction[];

    return (
      <div
        className="workspace-list-card-shell workspace-guest-request-card-shell"
        data-request-id={card.requestId}
      >
        <WorkspaceGuestRequestCard
          prefetch={index < 2}
          href={requestHref}
          className={[
            'workspace-guest-request-card',
            'workspace-guest-request-card--market',
            marketActions.length > 0 ? 'workspace-guest-request-card--with-actions' : '',
          ]
            .filter(Boolean)
            .join(' ')}
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
          onOpen={() => listContext.onOpenRequest?.(card.requestId, cardOpenIntent)}
          overlaySlot={
            favoriteState ? (
              <FavoriteButton
                variant="icon"
                isFavorite={favoriteState.favoriteRequestIds.has(card.requestId)}
                isPending={favoriteState.pendingFavoriteRequestIds.has(card.requestId)}
                onToggle={() => favoriteState.onToggleRequestFavorite(card.requestId)}
                ariaLabel={tx(locale, I18N_KEYS.requestsPage.workspaceSaveRequest)}
                title={tx(locale, I18N_KEYS.requestsPage.workspaceSaveRequest)}
                className="workspace-guest-request-card__favorite-btn"
              />
            ) : null
          }
          actionSlot={
            marketActions.length > 0 ? (
              <div className="workspace-guest-request-card__footer">
                <div className="workspace-guest-request-card__action-row">
                  {marketActions.slice(0, 2).map((action, actionIndex) => (
                    <RequestActionControl
                      key={`${action.key}-${actionIndex}`}
                      action={action}
                      variant={actionIndex === marketActions.length - 1 ? 'primary' : 'secondary'}
                      listContext={listContext}
                      preferInlineRequestOpen
                    />
                  ))}
                </div>
              </div>
            ) : null
          }
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
      ]
        .filter(Boolean)
        .join(' ')}
      data-request-id={card.requestId}
    >
      <RequestCard
        prefetch={index < 2}
        href={requestHref}
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
        onOpen={
          preferInlineRequestOpen
            ? () => listContext.onOpenRequest?.(card.requestId, cardOpenIntent)
            : undefined
        }
        isActive={isActive}
        topSlot={
          <RequestCardTopSlot
            chrome={chrome}
            locale={locale}
            card={card}
            requestHref={requestHref}
            steps={card.progress.steps}
            ownerRequestActions={listContext.ownerRequestActions}
            onOpenRequest={listContext.onOpenRequest}
            workspaceVariant={workspaceVariant}
          />
        }
        actionSlot={
          chrome.insights.length > 0 || chrome.primaryAction || chrome.secondaryAction ? (
            <div className="my-request-card__footer-stack">
              <RequestOwnerInsights chrome={chrome} includeSignals={false} />
              <div className="my-request-card__footer-bar">
                <RequestOwnerFooterNote
                  chrome={chrome}
                  card={card}
                  locale={locale}
                  workspaceVariant={workspaceVariant}
                />
                {chrome.primaryAction || chrome.secondaryAction ? (
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
          ) : null
        }
      />
    </div>
  );
}

export { WorkspaceRequestsActionRail as RequestsPrivateActionRail };

export function RequestsView({ surface }: WorkspaceRequestsViewProps) {
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
  const searchParams = useSearchParams();
  const nextRouteOverlayState = React.useMemo(
    () => readWorkspaceRequestRouteState(searchParams),
    [searchParams],
  );
  const [overlayRouteState, setOverlayRouteState] =
    React.useState<WorkspaceRequestRouteState>(nextRouteOverlayState);
  const overlayOpenedInteractivelyRef = React.useRef(false);
  const decisionPanel = model.response ? model.response.decisionPanel : null;
  const visibleCards = React.useMemo(() => {
    if (decisionState.mode !== 'decision') return model.cards;
    return sortCardsForDecisionMode(model.cards, decisionPanel);
  }, [decisionPanel, decisionState.mode, model.cards]);
  const cardRefs = React.useRef(new Map<string, HTMLElement>());

  React.useEffect(() => {
    setOverlayRouteState((previous) =>
      areWorkspaceRequestRouteStatesEqual(previous, nextRouteOverlayState)
        ? previous
        : nextRouteOverlayState,
    );
  }, [nextRouteOverlayState]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handlePopState = () => {
      setOverlayRouteState(
        readWorkspaceRequestRouteState(new URLSearchParams(window.location.search)),
      );
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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
  const initialPrivateRequestState = React.useMemo(
    () =>
      variant === 'private' &&
      overlayRouteState.requestId &&
      overlayRouteState.requestPanel !== 'offer'
        ? {
            requestId: overlayRouteState.requestId,
            intent: overlayRouteState.requestIntent,
          }
        : null,
    [
      overlayRouteState.requestId,
      overlayRouteState.requestIntent,
      overlayRouteState.requestPanel,
      variant,
    ],
  );
  const initialPrivateOfferRequestId = React.useMemo(
    () =>
      variant === 'private' && overlayRouteState.requestPanel === 'offer'
        ? overlayRouteState.requestId
        : null,
    [overlayRouteState.requestId, overlayRouteState.requestPanel, variant],
  );
  const {
    activeChatState,
    activeOfferRequestId,
    activeRequestCard,
    activeRequestState,
    closeChat,
    closeOfferSheet,
    dismissSession,
    effectiveListContext,
    openChatConversation,
    openRequest,
    openOfferSheet,
  } = useWorkspaceRequestOverlayFlow({
    cards: model.cards,
    listContext: overlayInputContext,
    initialRequestState: initialPrivateRequestState,
    initialOfferRequestId: initialPrivateOfferRequestId,
  });
  const initialPublicRequestState = React.useMemo(
    () =>
      variant === 'market' &&
      overlayRouteState.requestId &&
      overlayRouteState.requestPanel !== 'offer'
        ? {
            requestId: overlayRouteState.requestId,
            intent: overlayRouteState.requestIntent,
          }
        : null,
    [
      overlayRouteState.requestId,
      overlayRouteState.requestIntent,
      overlayRouteState.requestPanel,
      variant,
    ],
  );
  const initialPublicOfferRequestId = React.useMemo(
    () =>
      variant === 'market' && overlayRouteState.requestPanel === 'offer'
        ? overlayRouteState.requestId
        : null,
    [overlayRouteState.requestId, overlayRouteState.requestPanel, variant],
  );
  const {
    activeChatState: publicActiveChatState,
    activeOfferRequestId: publicActiveOfferRequestId,
    activeRequestState: publicActiveRequestState,
    closeChat: closePublicChat,
    closeOfferSheet: closePublicOfferSheet,
    dismissSession: dismissPublicSession,
    openChatConversation: openPublicChatConversation,
    openOfferSheet: openPublicOfferSheet,
    openRequest: openPublicRequest,
  } = useWorkspacePublicRequestOverlayFlow({
    requests: React.useMemo(
      () => model.cards.map((card) => ({ id: card.requestId, title: card.requestPreview.title })),
      [model.cards],
    ),
    initialRequestState: initialPublicRequestState,
    initialOfferRequestId: initialPublicOfferRequestId,
  });
  const applyOverlayHref = React.useCallback(
    (href: string, historyMode: 'push' | 'replace' = 'replace') => {
      if (typeof window === 'undefined') return;

      const url = new URL(href, window.location.origin);
      const nextHref = `${url.pathname}${url.search}`;
      const currentBrowserHref = `${window.location.pathname}${window.location.search}`;
      if (nextHref === currentBrowserHref) return;

      window.history[historyMode === 'push' ? 'pushState' : 'replaceState'](
        window.history.state,
        '',
        nextHref,
      );
      setOverlayRouteState(readWorkspaceRequestRouteState(url.searchParams));
    },
    [],
  );
  const openPrivateRequestRoute = React.useCallback(
    (requestId: string, intent: RequestDialogIntent = 'view') => {
      applyOverlayHref(
        buildWorkspaceRequestOverlayHref({
          currentSearch:
            typeof window === 'undefined'
              ? searchParams
              : new URLSearchParams(window.location.search),
          requestId,
          scope: 'my',
          intent,
        }),
        'push',
      );
    },
    [applyOverlayHref, searchParams],
  );
  const openMarketRequestRoute = React.useCallback(
    (requestId: string, intent: RequestDialogIntent = 'view') => {
      applyOverlayHref(
        buildWorkspaceRequestOverlayHref({
          currentSearch:
            typeof window === 'undefined'
              ? searchParams
              : new URLSearchParams(window.location.search),
          requestId,
          scope: 'market',
          intent,
        }),
        'push',
      );
    },
    [applyOverlayHref, searchParams],
  );
  const openPrivateRequestFromList = React.useCallback(
    (requestId: string, intent: RequestDialogIntent = 'view') => {
      overlayOpenedInteractivelyRef.current = true;
      openPrivateRequestRoute(requestId, intent);
    },
    [openPrivateRequestRoute],
  );
  const openMarketRequestFromList = React.useCallback(
    (requestId: string, intent: RequestDialogIntent = 'view') => {
      overlayOpenedInteractivelyRef.current = true;
      openMarketRequestRoute(requestId, intent);
    },
    [openMarketRequestRoute],
  );
  const resolvedListContext = React.useMemo<WorkspaceRequestOverlayListContext>(
    () =>
      variant === 'private'
        ? {
            ...effectiveListContext,
            onOpenRequest: openPrivateRequestFromList,
          }
        : {
            ...overlayInputContext,
            onOpenRequest: openMarketRequestFromList,
            onSendOffer: (requestId) => openPublicOfferSheet(requestId),
            onEditOffer: (requestId) => openPublicOfferSheet(requestId),
            onOpenChatConversation: (payload) => {
              void openPublicChatConversation(payload);
            },
          },
    [
      effectiveListContext,
      openMarketRequestFromList,
      openPrivateRequestFromList,
      openPublicChatConversation,
      openPublicOfferSheet,
      overlayInputContext,
      variant,
    ],
  );
  const routeSyncEnabled = !isLoading;
  const clearOverlayHref = React.useMemo(
    () =>
      clearWorkspaceRequestOverlayHref({
        currentSearch:
          typeof window === 'undefined'
            ? searchParams
            : new URLSearchParams(window.location.search),
      }),
    [searchParams],
  );
  const closeInlineOverlay = React.useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      overlayOpenedInteractivelyRef.current &&
      (overlayRouteState.requestCreate || overlayRouteState.requestId) &&
      window.history.length > 1
    ) {
      overlayOpenedInteractivelyRef.current = false;
      window.history.back();
      return;
    }

    overlayOpenedInteractivelyRef.current = false;
    applyOverlayHref(clearOverlayHref, 'replace');
  }, [
    applyOverlayHref,
    clearOverlayHref,
    overlayRouteState.requestCreate,
    overlayRouteState.requestId,
  ]);
  React.useEffect(() => {
    if (!routeSyncEnabled) return;

    if (overlayRouteState.requestCreate) {
      if (variant === 'private') {
        dismissSession();
      } else {
        dismissPublicSession();
      }
      return;
    }

    if (!overlayRouteState.requestId) {
      if (variant === 'private') {
        if (activeRequestState || activeOfferRequestId) {
          dismissSession();
        }
      } else if (publicActiveRequestState || publicActiveOfferRequestId) {
        dismissPublicSession();
      }
      return;
    }

    if (variant === 'private') {
      if (overlayRouteState.requestPanel === 'offer') {
        if (activeOfferRequestId !== overlayRouteState.requestId) {
          openOfferSheet(overlayRouteState.requestId);
        }
        return;
      }

      if (
        activeRequestState?.requestId !== overlayRouteState.requestId ||
        activeRequestState?.intent !== overlayRouteState.requestIntent ||
        activeOfferRequestId
      ) {
        openRequest(overlayRouteState.requestId, overlayRouteState.requestIntent);
      }
      return;
    }

    if (overlayRouteState.requestPanel === 'offer') {
      if (publicActiveOfferRequestId !== overlayRouteState.requestId) {
        openPublicOfferSheet(overlayRouteState.requestId);
      }
      return;
    }

    if (
      publicActiveRequestState?.requestId !== overlayRouteState.requestId ||
      publicActiveRequestState?.intent !== overlayRouteState.requestIntent ||
      publicActiveOfferRequestId
    ) {
      openPublicRequest(overlayRouteState.requestId, overlayRouteState.requestIntent);
    }
  }, [
    activeOfferRequestId,
    activeRequestState,
    dismissPublicSession,
    dismissSession,
    openOfferSheet,
    openPublicOfferSheet,
    openPublicRequest,
    openRequest,
    publicActiveOfferRequestId,
    publicActiveRequestState,
    overlayRouteState.requestCreate,
    overlayRouteState.requestId,
    overlayRouteState.requestIntent,
    overlayRouteState.requestPanel,
    routeSyncEnabled,
    variant,
  ]);

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
        <h3>
          {variant === 'market'
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

  const inlineOverlayNode = overlayRouteState.requestCreate ? (
    <WorkspaceCreateRequestOverlay onClose={closeInlineOverlay} />
  ) : null;
  const privateInlineSessionActive =
    variant === 'private' &&
    !overlayRouteState.requestCreate &&
    ((activeRequestState && activeRequestCard) || activeOfferRequestId || activeChatState);
  const publicInlineSessionActive =
    variant === 'market' &&
    !overlayRouteState.requestCreate &&
    (publicActiveRequestState || publicActiveOfferRequestId || publicActiveChatState);
  const activeInlineOverlay =
    inlineOverlayNode ??
    (privateInlineSessionActive ? (
      <PrivateRequestSessionDialog
        locale={locale}
        presentation="inline"
        activeRequestState={activeRequestState}
        activeRequestCard={activeRequestCard}
        activeOfferRequestId={activeOfferRequestId}
        activeChatState={activeChatState}
        onDismissSession={closeInlineOverlay}
        onCloseOfferSheet={closeOfferSheet}
        onCloseChat={closeChat}
        onOpenOfferSheet={openOfferSheet}
        onOpenChatConversation={(payload) => {
          void openChatConversation(payload);
        }}
      />
    ) : null) ??
    (publicInlineSessionActive ? (
      <PublicRequestSessionDialog
        locale={locale}
        presentation="inline"
        activeRequestState={publicActiveRequestState}
        activeOfferRequestId={publicActiveOfferRequestId}
        activeChatState={publicActiveChatState}
        onDismissSession={closeInlineOverlay}
        onCloseOfferSheet={closePublicOfferSheet}
        onCloseChat={closePublicChat}
        onOpenRequest={openMarketRequestFromList}
        onOpenOfferSheet={openPublicOfferSheet}
        onOpenChatConversation={openPublicChatConversation}
      />
    ) : null);

  return (
    <section className="my-requests-view">
      {isLoading ? <CardSkeletonList /> : null}
      {!isLoading && activeInlineOverlay ? (
        <div className="my-requests-inline-stage">{activeInlineOverlay}</div>
      ) : null}

      {!isLoading && !activeInlineOverlay && model.emptyMode === 'empty' ? (
        <EmptyState
          locale={locale}
          mode="empty"
          workspaceVariant={variant}
          emptyCtaHref={emptyCtaHref}
          secondaryCtaHref={secondaryCtaHref}
        />
      ) : null}
      {!isLoading && !activeInlineOverlay && model.emptyMode === 'filtered' ? (
        <EmptyState
          locale={locale}
          mode="filtered"
          workspaceVariant={variant}
          emptyCtaHref={emptyCtaHref}
          secondaryCtaHref={secondaryCtaHref}
        />
      ) : null}
      {!isLoading && !activeInlineOverlay && visibleCards.length > 0 ? (
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
              variant === 'market' && listDensity === 'double'
                ? 'my-requests-list--market-double'
                : '',
              variant === 'market' && listDensity === 'single'
                ? 'my-requests-list--market-single'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
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
                summaryItems: model.response?.summary.items ?? null,
                panel: decisionPanel,
                sidePanel: model.response?.sidePanel ?? null,
                mode: decisionState.mode,
                activeRequestId: decisionState.activeRequestId,
                onStartDecisionMode: () => onEnterDecisionMode(),
                onOpenQueueItem:
                  variant === 'market'
                    ? (requestId) => openMarketRequestRoute(requestId, 'view')
                    : onOpenDecisionItem,
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
      {!isLoading &&
      !activeInlineOverlay &&
      decisionState.mode === 'decision' &&
      visibleCards.length === 0 &&
      decisionPanel ? (
        <>
          <WorkspaceDecisionModeBar
            locale={locale}
            completedInSession={decisionState.completedInSession}
            remainingCount={0}
            onExit={onExitDecisionMode}
          />
          <section
            className={workspaceMutedPanelShell('my-requests-empty', 'my-requests-empty--success')}
          >
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
