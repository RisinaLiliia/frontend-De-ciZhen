'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { RequestCard } from '@/components/requests/RequestCard';
import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { LocationMeta } from '@/components/ui/LocationMeta';
import {
  IconBriefcase,
  IconCalendar,
  IconChat,
  IconEdit,
} from '@/components/ui/icons/icons';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import type { OwnerRequestActions, RequestsListProps } from '@/components/requests/requestsList.types';
import { DecisionModeBar } from '@/features/workspace/requests/components/DecisionModeBar';
import { DecisionPanel } from '@/features/workspace/requests/components/DecisionPanel';
import type {
  MyRequestsSummaryItem,
  MyRequestsViewCard,
  MyRequestsViewModel,
} from '@/features/workspace/requests/myRequestsView.model';
import type { ActiveDecisionState, WorkQueueMode } from '@/features/workspace/requests/requestsDecision.model';
import { sortCardsForDecisionMode } from '@/features/workspace/requests/requestsDecision.model';
import type { WorkspaceMyRequestCardDto, WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import { pickRequestImage } from '@/lib/requests/images';

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
  steps,
}: {
  locale: Locale;
  steps: WorkspaceMyRequestCardDto['progress']['steps'];
}) {
  return (
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
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function DecisionActionBanner({
  locale,
  card,
  listContext,
}: {
  locale: Locale;
  card: MyRequestsViewCard;
  listContext: RequestsPrivateViewProps['listContext'];
}) {
  const action = card.decision.primaryAction;
  if (!card.decision.needsAction || !action) return null;

  const description = card.decision.actionReason
    ?? (locale === 'de' ? 'Dieser Vorgang wartet auf deinen nächsten Schritt.' : 'This workflow is waiting for your next step.');

  const ctaLabel = card.decision.actionLabel ?? action.label;

  return (
    <div className={`my-request-card__decision is-${card.decision.actionPriorityLevel}`.trim()}>
      <div className="my-request-card__decision-copy">
        <strong>{ctaLabel}</strong>
        <span>{description}</span>
      </div>
      {action.kind === 'link' && action.href ? (
        <Link href={action.href} prefetch={false} className="btn-primary my-request-card__decision-cta">
          {ctaLabel}
        </Link>
      ) : null}
      {action.kind === 'open_chat' && action.chatInput ? (
        <button
          type="button"
          className="btn-primary my-request-card__decision-cta"
          onClick={() => listContext.onOpenChatConversation?.(action.chatInput!)}
        >
          {ctaLabel}
        </button>
      ) : null}
      {action.kind === 'delete_request' && action.requestId ? (
        <button
          type="button"
          className="btn-primary my-request-card__decision-cta"
          onClick={() => listContext.ownerRequestActions?.onDelete?.(action.requestId!)}
        >
          {ctaLabel}
        </button>
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
  listContext: RequestsPrivateViewProps['listContext'];
}) {
  const preview = card.requestPreview;
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
    <article
      className={[
        'panel',
        'my-request-card',
        mode === 'decision' ? 'my-request-card--decision' : '',
        isActive ? 'my-request-card--active' : '',
        mode === 'decision' && !isActive ? 'my-request-card--idle' : '',
      ].filter(Boolean).join(' ')}
      data-request-id={card.requestId}
    >
      <WorkflowProgress locale={locale} steps={card.progress.steps} />
      {mode === 'decision' && isActive ? (
        <DecisionActionBanner locale={locale} card={card} listContext={listContext} />
      ) : null}
      {card.activity ? (
        <div className={`my-request-card__activity is-${card.activity.tone ?? 'neutral'}`.trim()}>
          {card.activity.label}
        </div>
      ) : null}
      <RequestCard
        prefetch={index < 2}
        href={preview.href}
        ariaLabel={locale === 'de' ? 'Anfrage öffnen' : 'Open request'}
        imageSrc={preview.imageUrl || pickRequestImage(preview.imageCategoryKey ?? '')}
        imageAlt=""
        imagePriority={index === 0}
        badges={preview.badgeLabel ? [{ label: preview.badgeLabel, variant: 'neutral', tone: 'outline', size: 'sm' }] : []}
        category={preview.categoryLabel}
        title={preview.title}
        excerpt={preview.excerpt}
        meta={meta}
        priceLabel={preview.priceLabel}
        priceTrend={preview.priceTrend ?? null}
        priceTrendLabel={preview.priceTrendLabel ?? null}
        tags={preview.tags}
        mode="link"
        statusSlot={<WorkspaceRequestStatusSlot card={card} listContext={listContext} />}
        actionSlot={null}
      />
    </article>
  );
}

function WorkspaceRequestStatusSlot({
  card,
  listContext,
}: {
  card: MyRequestsViewCard;
  listContext: RequestsPrivateViewProps['listContext'];
}) {
  const statusClassName = card.status.badgeTone ? `status-badge status-badge--${card.status.badgeTone}` : null;

  return (
    <span className="request-card__status-actions">
      {card.status.badgeLabel && statusClassName ? (
        <span className={statusClassName}>{card.status.badgeLabel}</span>
      ) : null}
      {card.status.actions.map((action) => {
        const actionClassName = [
          action.tone === 'primary' ? 'btn-primary' : 'btn-secondary',
          'offer-action-btn',
          'offer-action-btn--icon-only',
          'request-card__status-action',
          action.key === 'contract' ? 'request-card__status-action--contract' : '',
          action.key === 'chat' ? 'request-card__status-action--chat' : '',
          action.key === 'edit-request' || action.key === 'edit-offer' ? 'request-card__status-action--edit' : '',
          action.kind === 'delete_request' || action.kind === 'withdraw_offer' ? 'request-card__status-action--danger' : '',
        ].filter(Boolean).join(' ');

        if (action.kind === 'link' && action.href) {
          return (
            <Link
              key={action.key}
              href={action.href}
              prefetch={false}
              className={actionClassName}
              aria-label={action.label}
              title={action.label}
            >
              <i className="offer-action-btn__icon">
                {renderStatusActionIcon(action.icon)}
              </i>
            </Link>
          );
        }

        if (action.kind === 'send_offer' && action.requestId) {
          return (
            <OfferActionButton
              key={action.key}
              kind="submit"
              label={action.label}
              ariaLabel={action.label}
              title={action.label}
              iconOnly
              className="request-card__status-action request-card__status-action--submit"
              onClick={() => listContext.onSendOffer?.(action.requestId!)}
            />
          );
        }

        if (action.kind === 'edit_offer' && action.requestId) {
          return (
            <OfferActionButton
              key={action.key}
              kind="edit"
              label={action.label}
              ariaLabel={action.label}
              title={action.label}
              iconOnly
              className="request-card__status-action request-card__status-action--edit"
              onClick={() => listContext.onEditOffer?.(action.requestId!)}
            />
          );
        }

        if (action.kind === 'withdraw_offer' && action.offerId) {
          return (
            <OfferActionButton
              key={action.key}
              kind="delete"
              label={action.label}
              ariaLabel={action.label}
              title={action.label}
              iconOnly
              className="request-card__status-action request-card__status-action--danger"
              disabled={listContext.pendingOfferRequestId === action.requestId}
              onClick={() => listContext.onWithdrawOffer?.(action.offerId!)}
            />
          );
        }

        if (action.kind === 'delete_request' && action.requestId) {
          return (
            <OfferActionButton
              key={action.key}
              kind="delete"
              label={action.label}
              ariaLabel={action.label}
              title={action.label}
              iconOnly
              className="request-card__status-action request-card__status-action--danger"
              disabled={listContext.ownerRequestActions?.pendingDeleteRequestId === action.requestId}
              onClick={() => listContext.ownerRequestActions?.onDelete?.(action.requestId!)}
            />
          );
        }

        if (action.kind === 'open_chat' && action.chatInput) {
          return (
            <button
              key={action.key}
              type="button"
              className={actionClassName}
              aria-label={action.label}
              title={action.label}
              onClick={() => listContext.onOpenChatConversation?.(action.chatInput!)}
            >
              <i className="offer-action-btn__icon">
                {renderStatusActionIcon(action.icon)}
              </i>
            </button>
          );
        }

        return null;
      })}
    </span>
  );
}

function renderStatusActionIcon(icon: WorkspaceMyRequestCardDto['status']['actions'][number]['icon']) {
  if (icon === 'chat') return <IconChat />;
  if (icon === 'edit') return <IconEdit />;
  return <IconBriefcase />;
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
  const visibleCards = React.useMemo(() => {
    if (decisionState.mode !== 'decision') return model.cards;
    return sortCardsForDecisionMode(model.cards, model.response.decisionPanel);
  }, [decisionState.mode, model.cards, model.response.decisionPanel]);
  const cardRefs = React.useRef(new Map<string, HTMLElement>());

  React.useEffect(() => {
    if (decisionState.mode !== 'decision' || !decisionState.activeRequestId) return;
    const node = cardRefs.current.get(decisionState.activeRequestId);
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [decisionState.activeRequestId, decisionState.mode]);

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
                  listContext={listContext}
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
