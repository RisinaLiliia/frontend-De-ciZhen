'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { RequestsListItem } from '@/components/requests/RequestsListItem';
import type { RequestsListProps } from '@/components/requests/requestsList.types';
import type {
  MyRequestsSummaryItem,
  MyRequestsViewCard,
  MyRequestsViewModel,
} from '@/features/workspace/requests/myRequestsView.model';
import type { WorkspaceMyRequestCardDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

type RequestsPrivateViewProps = {
  t: RequestsListProps['t'];
  locale: Locale;
  isWorkspaceAuthed: boolean;
  guestLoginHref: string;
  model: MyRequestsViewModel;
  isLoading: boolean;
  isError: boolean;
  listContext: Pick<
    RequestsListProps,
    | 'serviceByKey'
    | 'categoryByKey'
    | 'cityById'
    | 'formatDate'
    | 'formatPrice'
    | 'offersByRequest'
    | 'onSendOffer'
    | 'onEditOffer'
    | 'onWithdrawOffer'
    | 'onOpenChatThread'
    | 'pendingOfferRequestId'
    | 'ownerRequestActions'
  >;
};

type RailProps = {
  locale: Locale;
  rail: NonNullable<MyRequestsViewModel['response']['sidePanel']>;
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

function MyRequestCard({
  t,
  locale,
  card,
  index,
  listContext,
}: {
  t: RequestsListProps['t'];
  locale: Locale;
  card: MyRequestsViewCard;
  index: number;
  listContext: RequestsPrivateViewProps['listContext'];
}) {
  const isProviderCard = card.role === 'provider';

  return (
    <article className="panel my-request-card">
      <WorkflowProgress locale={locale} steps={card.item.progress.steps} />
      {card.item.activity ? (
        <div className={`my-request-card__activity is-${card.item.activity.tone ?? 'neutral'}`.trim()}>
          {card.item.activity.label}
        </div>
      ) : null}
      <RequestsListItem
        item={card.request}
        index={index}
        t={t}
        locale={locale}
        serviceByKey={listContext.serviceByKey}
        categoryByKey={listContext.categoryByKey}
        cityById={listContext.cityById}
        formatDate={listContext.formatDate}
        formatPrice={listContext.formatPrice}
        enableOfferActions={isProviderCard}
        showFavoriteButton={false}
        hideRecurringBadge={isProviderCard}
        offersByRequest={isProviderCard ? listContext.offersByRequest : undefined}
        onSendOffer={isProviderCard ? listContext.onSendOffer : undefined}
        onEditOffer={isProviderCard ? listContext.onEditOffer : undefined}
        onWithdrawOffer={isProviderCard ? listContext.onWithdrawOffer : undefined}
        onOpenChatThread={isProviderCard ? listContext.onOpenChatThread : undefined}
        pendingOfferRequestId={listContext.pendingOfferRequestId ?? null}
        ownerRequestActions={isProviderCard ? undefined : listContext.ownerRequestActions}
      />
    </article>
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
  rail,
  className,
}: RailProps) {
  return (
    <div className={['my-requests-rail', className ?? ''].filter(Boolean).join(' ')}>
      {rail.focus ? (
        <section className="panel my-requests-rail__panel">
          <span className="my-requests-rail__eyebrow">{locale === 'de' ? 'Aktueller Fokus' : 'Current focus'}</span>
          <h3>{rail.focus.title}</h3>
          <p>{rail.focus.description}</p>
          {rail.focus.cta?.href ? (
            <Link href={rail.focus.cta.href} prefetch={false} className="btn-primary">
              {rail.focus.cta.label}
            </Link>
          ) : null}
        </section>
      ) : null}

      {rail.recommendation ? (
        <section className="panel my-requests-rail__panel">
          <span className="my-requests-rail__eyebrow">{locale === 'de' ? 'KI-Empfehlung' : 'AI recommendation'}</span>
          <h3>{rail.recommendation.title}</h3>
          <p>{rail.recommendation.description}</p>
          {rail.recommendation.cta?.href ? (
            <Link href={rail.recommendation.cta.href} prefetch={false} className="btn-secondary">
              {rail.recommendation.cta.label}
            </Link>
          ) : null}
        </section>
      ) : null}

      {(rail.contextItems ?? []).map((item) => (
        <section key={item.title} className="panel my-requests-rail__panel">
          <h3>{item.title}</h3>
          {item.description ? <p>{item.description}</p> : null}
          {item.meta?.length ? (
            <dl className="my-requests-rail__meta">
              {item.meta.map((entry) => (
                <div key={entry.label}>
                  <dt>{entry.label}</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {item.cta?.href ? (
            <Link href={item.cta.href} prefetch={false} className="btn-secondary">
              {item.cta.label}
            </Link>
          ) : null}
        </section>
      ))}

      {(rail.nextSteps?.length ?? 0) > 0 ? (
        <section className="panel my-requests-rail__panel">
          <span className="my-requests-rail__eyebrow">{locale === 'de' ? 'Nächste Schritte' : 'Next steps'}</span>
          <ol className="my-requests-rail__steps">
            {rail.nextSteps?.map((step) => (
              <li key={step.id}>{step.title}</li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

export function RequestsPrivateView({
  t,
  locale,
  isWorkspaceAuthed,
  guestLoginHref,
  model,
  isLoading,
  isError,
  listContext,
}: RequestsPrivateViewProps) {
  const setStateFilter = useStateFilterMutation();

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

      {!isLoading && model.cards.length > 0 ? (
        <>
          <div className="my-requests-list">
            {model.cards.map((card, index) => (
              <MyRequestCard
                key={card.id}
                t={t}
                locale={locale}
                card={card}
                index={index}
                listContext={listContext}
              />
            ))}
          </div>
          {model.response.sidePanel ? (
            <RequestsPrivateActionRail
              locale={locale}
              rail={model.response.sidePanel}
              className="my-requests-view__mobile-rail"
            />
          ) : null}
        </>
      ) : null}
    </section>
  );
}
