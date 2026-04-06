'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { WorkspaceChipToggleGroup } from '@/features/workspace/requests/WorkspaceChipToggleGroup';
import type {
  MyRequestsRailModel,
  MyRequestsSummaryItem,
  MyRequestsTabItem,
  MyRequestsViewCard,
  MyRequestsViewModel,
} from '@/features/workspace/requests/myRequestsView.model';
import type { Locale } from '@/lib/i18n/t';

type RequestsPrivateViewProps = {
  locale: Locale;
  isWorkspaceAuthed: boolean;
  guestLoginHref: string;
  model: MyRequestsViewModel;
  isLoading: boolean;
  isError: boolean;
};

type RailProps = {
  locale: Locale;
  rail: MyRequestsRailModel;
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
  item,
  onSelect,
}: {
  item: MyRequestsSummaryItem;
  onSelect: (nextState: string) => void;
}) {
  return (
    <button
      type="button"
      className={`my-requests-summary__card${item.isHighlighted ? ' is-active' : ''}`.trim()}
      onClick={() => onSelect(item.key)}
    >
      <span className="my-requests-summary__label">{item.label}</span>
      <strong className="my-requests-summary__value">{item.value}</strong>
    </button>
  );
}

function renderUrgencyLabel(locale: Locale, urgency: MyRequestsViewCard['urgency']) {
  if (!urgency) return null;
  if (locale === 'de') {
    if (urgency === 'high') return 'Dringend';
    if (urgency === 'medium') return 'Bald fällig';
    return 'Im Blick';
  }

  if (urgency === 'high') return 'Urgent';
  if (urgency === 'medium') return 'Due soon';
  return 'Watch';
}

function MyRequestCard({
  locale,
  card,
}: {
  locale: Locale;
  card: MyRequestsViewCard;
}) {
  return (
    <article className="panel my-request-card">
      <div className="my-request-card__topline">
        <span className="my-request-card__badge my-request-card__badge--category">{card.category}</span>
        <span className="my-request-card__badge">{card.roleLabel}</span>
        <span className={`my-request-card__badge my-request-card__badge--state is-${card.state}`}>{card.stateLabel}</span>
        {card.urgency ? (
          <span className={`my-request-card__badge my-request-card__badge--urgency is-${card.urgency}`}>
            {renderUrgencyLabel(locale, card.urgency)}
          </span>
        ) : null}
      </div>

      <div className="my-request-card__header">
        <div className="my-request-card__copy">
          <h3 className="my-request-card__title">{card.title}</h3>
          <div className="my-request-card__meta">
            {card.city ? <span>{card.city}</span> : null}
            {card.createdAt ? <span>{locale === 'de' ? `Erstellt ${card.createdAt}` : `Created ${card.createdAt}`}</span> : null}
            {card.nextEventAt ? <span>{locale === 'de' ? `Nächster Schritt ${card.nextEventAt}` : `Next ${card.nextEventAt}`}</span> : null}
            {card.budgetLabel ? <span>{card.budgetLabel}</span> : null}
          </div>
        </div>
      </div>

      <div className="my-request-card__progress">
        {card.progressSteps.map((step) => (
          <div
            key={step.key}
            className={`my-request-card__progress-step is-${step.status}`.trim()}
          >
            <span className="my-request-card__progress-dot" />
            <span>{step.label}</span>
          </div>
        ))}
      </div>

      {card.activity ? (
        <div className={`my-request-card__activity is-${card.activity.tone}`.trim()}>
          {card.activity.label}
        </div>
      ) : null}

      <div className="my-request-card__actions">
        <Link href={card.primaryAction.href} prefetch={false} className="btn-primary">
          {card.primaryAction.label}
        </Link>
        {card.secondaryActions.map((action) => (
          <Link key={action.key} href={action.href} prefetch={false} className="btn-secondary my-request-card__secondary-action">
            {action.label}
          </Link>
        ))}
      </div>
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
          <Link href={rail.focus.href} prefetch={false} className="btn-primary">
            {rail.focus.ctaLabel}
          </Link>
        </section>
      ) : null}

      {rail.recommendation ? (
        <section className="panel my-requests-rail__panel">
          <span className="my-requests-rail__eyebrow">{locale === 'de' ? 'KI-Empfehlung' : 'AI recommendation'}</span>
          <h3>{rail.recommendation.title}</h3>
          <p>{rail.recommendation.description}</p>
        </section>
      ) : null}

      {rail.contextItems.map((item) => (
        <section key={item.title} className="panel my-requests-rail__panel">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
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
        </section>
      ))}

      {rail.nextSteps.length ? (
        <section className="panel my-requests-rail__panel">
          <span className="my-requests-rail__eyebrow">{locale === 'de' ? 'Nächste Schritte' : 'Next steps'}</span>
          <ol className="my-requests-rail__steps">
            {rail.nextSteps.map((step) => (
              <li key={step.id}>{step.title}</li>
            ))}
          </ol>
        </section>
      ) : null}
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
}: RequestsPrivateViewProps) {
  const setStateFilter = useStateFilterMutation();

  const stateTabs = model.tabs.map((item: MyRequestsTabItem) => ({
    key: item.key,
    label: `${item.label} ${item.count}`,
  }));

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
          {model.summary.map((item) => (
            <SummaryCard key={item.key} item={item} onSelect={setStateFilter} />
          ))}
        </div>
      )}

      <WorkspaceChipToggleGroup
        items={stateTabs}
        selectedKey={model.activeState}
        onSelect={(key) => setStateFilter(String(key))}
        ariaLabel={locale === 'de' ? 'Statusfilter' : 'Status filter'}
      />

      {isLoading ? <CardSkeletonList /> : null}

      {!isLoading && model.emptyMode === 'empty' ? <EmptyState locale={locale} mode="empty" /> : null}
      {!isLoading && model.emptyMode === 'filtered' ? <EmptyState locale={locale} mode="filtered" /> : null}

      {!isLoading && model.cards.length > 0 ? (
        <>
          <div className="my-requests-list">
            {model.cards.map((card) => (
              <MyRequestCard key={card.id} locale={locale} card={card} />
            ))}
          </div>
          <RequestsPrivateActionRail
            locale={locale}
            rail={model.rail}
            className="my-requests-view__mobile-rail"
          />
        </>
      ) : null}
    </section>
  );
}
