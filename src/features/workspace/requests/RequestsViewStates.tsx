import Link from 'next/link';

import { workspaceMutedPanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import type { WorkspaceRequestsViewVariant } from '@/features/workspace/requests/workspaceRequestsView.model';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

function tx(locale: Locale, key: I18nKey) {
  return translate(key, locale);
}

export function CardSkeletonList() {
  return (
    <div className="my-requests-list">
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          key={`card-skeleton-${index}`}
          className={workspaceMutedPanelShell('my-request-card', 'my-request-card--skeleton')}
        >
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

export function EmptyState({
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
    <section className={workspaceMutedPanelShell('my-requests-empty')}>
      <h3>
        {mode === 'empty'
          ? isMarket
            ? tx(locale, I18N_KEYS.requestsPage.workspaceMarketEmptyTitle)
            : tx(locale, I18N_KEYS.requestsPage.workspacePrivateEmptyTitle)
          : isMarket
            ? tx(locale, I18N_KEYS.requestsPage.workspaceMarketFilteredTitle)
            : tx(locale, I18N_KEYS.requestsPage.workspacePrivateFilteredTitle)}
      </h3>
      <p>
        {mode === 'empty'
          ? isMarket
            ? tx(locale, I18N_KEYS.requestsPage.workspaceMarketEmptyHint)
            : tx(locale, I18N_KEYS.requestsPage.workspacePrivateEmptyHint)
          : tx(locale, I18N_KEYS.requestsPage.workspaceFilteredHint)}
      </p>
      <div className="my-requests-empty__actions">
        {emptyCtaHref ? (
          <Link href={emptyCtaHref} prefetch={false} className="btn-primary">
            {isMarket
              ? tx(locale, I18N_KEYS.requestsPage.workspaceRefreshMarketCta)
              : tx(locale, I18N_KEYS.requestsPage.workspaceMyRequestsEmptyCta)}
          </Link>
        ) : null}
        {secondaryCtaHref ? (
          <Link href={secondaryCtaHref} prefetch={false} className="btn-secondary">
            {isMarket
              ? tx(locale, I18N_KEYS.requestsPage.workspaceGoToProvidersCta)
              : tx(locale, I18N_KEYS.requestsPage.workspaceGoToMarketCta)}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function AuthGate({ locale, guestLoginHref }: { locale: Locale; guestLoginHref: string }) {
  return (
    <section className={workspaceMutedPanelShell('my-requests-auth-gate')}>
      <h3>{tx(locale, I18N_KEYS.requestsPage.workspaceAuthGateTitle)}</h3>
      <p>{tx(locale, I18N_KEYS.requestsPage.workspaceAuthGateHint)}</p>
      <div className="my-requests-empty__actions">
        <Link href={guestLoginHref} prefetch={false} className="btn-primary">
          {tx(locale, I18N_KEYS.auth.loginCta)}
        </Link>
        <Link
          href="/workspace?section=requests&scope=market"
          prefetch={false}
          className="btn-secondary"
        >
          {tx(locale, I18N_KEYS.requestsPage.workspaceGoToMarketCta)}
        </Link>
      </div>
    </section>
  );
}
