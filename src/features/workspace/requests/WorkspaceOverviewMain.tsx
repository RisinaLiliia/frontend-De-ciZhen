'use client';

import * as React from 'react';
import Link from 'next/link';

import { RequestsList } from '@/components/requests/RequestsList';
import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import type { RequestsListProps } from '@/components/requests/requestsList.types';
import type { TabPayload } from '@/components/requests/requestsStatsPanel.types';
import { ProviderList } from '@/components/providers/ProviderList';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import { KpiCard } from '@/components/ui/KpiCard';
import { ActivityInsight } from '@/components/ui/ActivityInsight';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import type { Locale } from '@/lib/i18n/t';

type WorkspaceOverviewMainProps = {
  locale: Locale;
  primaryAction: {
    href: string;
    label: string;
  };
  onPrimaryActionClick: () => void;
  insightText: string;
  activityProgress: number;
  providerStatsPayload: TabPayload;
  clientStatsPayload: TabPayload;
  myRequestsListProps: RequestsListProps;
  myOffersListProps: RequestsListProps;
  topProviders: ReadonlyArray<TopProviderItem>;
  topProvidersTitle: string;
  topProvidersSubtitle: string;
  topProvidersCtaLabel: string;
  topProvidersCtaHref: string;
  favoriteProviderIds: ReadonlySet<string>;
  pendingFavoriteProviderIds: ReadonlySet<string>;
  onToggleProviderFavorite: (providerId: string) => void;
};

function getOverviewCopy(locale: Locale) {
  if (locale === 'en') {
    return {
      snapshotTitle: 'Health overview',
      snapshotSubtitle: 'Current workload, response, and active delivery in one glance.',
      quickActionsTitle: 'Quick actions',
      quickActionsSubtitle: 'Jump into the next decision without opening another mode first.',
      quickActionsSecondary: [
        { href: '/workspace?section=requests', label: 'Open requests mode' },
        { href: '/workspace?section=providers', label: 'Find providers' },
        { href: '/workspace?section=stats', label: 'Open analysis' },
      ],
      insightsTitle: 'AI insights',
      insightsSubtitle: 'Two or three signals worth acting on now.',
      requestsTitle: 'New requests',
      requestsSubtitle: 'A short queue preview, not the full operating list.',
      requestsCta: 'View all requests',
      offersTitle: 'Active offers',
      offersSubtitle: 'Current offer flow that still needs attention.',
      offersCta: 'View offers',
      topProvidersTitle: 'Top providers',
      topProvidersSubtitle: 'Best-matching providers in the current shared context.',
      insightLabels: ['Signal', 'Provider tip', 'Client tip'],
    };
  }

  return {
    snapshotTitle: 'Health Overview',
    snapshotSubtitle: 'Aktuelle Auslastung, Reaktionslage und laufende Arbeit auf einen Blick.',
    quickActionsTitle: 'Schnellaktionen',
    quickActionsSubtitle: 'Direkt in die naechste Entscheidung springen, ohne den Workspace zu verlassen.',
    quickActionsSecondary: [
      { href: '/workspace?section=requests', label: 'Auftraege oeffnen' },
      { href: '/workspace?section=providers', label: 'Anbieter suchen' },
      { href: '/workspace?section=stats', label: 'Analyse oeffnen' },
    ],
    insightsTitle: 'AI Insights',
    insightsSubtitle: 'Die wichtigsten Signale fuer die naechsten Schritte.',
    requestsTitle: 'Neue Anfragen',
    requestsSubtitle: 'Nur ein kurzer Queue-Preview, keine lange Arbeitsliste.',
    requestsCta: 'Alle Anfragen',
    offersTitle: 'Aktive Angebote',
    offersSubtitle: 'Angebote, die noch Aufmerksamkeit brauchen.',
    offersCta: 'Meine Angebote',
    topProvidersTitle: 'Top Anbieter',
    topProvidersSubtitle: 'Passende Anbieter im aktuellen gemeinsamen Kontext.',
    insightLabels: ['Signal', 'Anbieter-Tipp', 'Kunden-Tipp'],
  };
}

function buildSnapshotItems(clientPayload: TabPayload, providerPayload: TabPayload) {
  return [
    {
      key: 'client-total',
      label: clientPayload.kpis[0]?.label ?? clientPayload.secondary.leftLabel,
      value: clientPayload.kpis[0]?.value ?? clientPayload.secondary.leftValue,
      meta: clientPayload.chartTitle,
      tone: 'accent' as const,
    },
    {
      key: 'client-open',
      label: clientPayload.kpis[1]?.label ?? clientPayload.secondary.centerLabel,
      value: clientPayload.kpis[1]?.value ?? clientPayload.secondary.centerValue,
      meta: clientPayload.secondary.progressLabel,
      tone: 'neutral' as const,
    },
    {
      key: 'provider-sent',
      label: providerPayload.secondary.leftLabel,
      value: providerPayload.secondary.leftValue,
      meta: providerPayload.chartTitle,
      tone: 'success' as const,
    },
    {
      key: 'provider-active',
      label: providerPayload.secondary.rightLabel,
      value: providerPayload.secondary.rightValue,
      meta: providerPayload.secondary.responseLabel,
      tone: 'neutral' as const,
    },
  ];
}

export function WorkspaceOverviewMain({
  locale,
  primaryAction,
  onPrimaryActionClick,
  insightText,
  activityProgress,
  providerStatsPayload,
  clientStatsPayload,
  myRequestsListProps,
  myOffersListProps,
  topProviders,
  topProvidersTitle,
  topProvidersSubtitle,
  topProvidersCtaLabel,
  topProvidersCtaHref,
  favoriteProviderIds,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
}: WorkspaceOverviewMainProps) {
  const copy = React.useMemo(() => getOverviewCopy(locale), [locale]);
  const snapshotItems = React.useMemo(
    () => buildSnapshotItems(clientStatsPayload, providerStatsPayload),
    [clientStatsPayload, providerStatsPayload],
  );
  const insights = React.useMemo(
    () => [
      {
        key: 'workspace-signal',
        label: copy.insightLabels[0],
        text: insightText,
        ctaHref: '/workspace?section=stats',
        ctaLabel: locale === 'de' ? 'Analyse ansehen' : 'Open analysis',
      },
      {
        key: 'provider-hint',
        label: copy.insightLabels[1],
        text: providerStatsPayload.hint.text,
        ctaHref: providerStatsPayload.hint.ctaHref,
        ctaLabel: providerStatsPayload.hint.ctaLabel,
      },
      {
        key: 'client-hint',
        label: copy.insightLabels[2],
        text: clientStatsPayload.hint.text,
        ctaHref: clientStatsPayload.hint.ctaHref,
        ctaLabel: clientStatsPayload.hint.ctaLabel,
      },
    ].filter((item) => item.text.trim().length > 0).slice(0, 3),
    [clientStatsPayload.hint.ctaHref, clientStatsPayload.hint.ctaLabel, clientStatsPayload.hint.text, copy.insightLabels, insightText, locale, providerStatsPayload.hint.ctaHref, providerStatsPayload.hint.ctaLabel, providerStatsPayload.hint.text],
  );
  const recentRequestsListProps = React.useMemo<RequestsListProps>(
    () => ({
      ...myRequestsListProps,
      requests: myRequestsListProps.requests.slice(0, 2),
    }),
    [myRequestsListProps],
  );
  const activeOffersListProps = React.useMemo<RequestsListProps>(
    () => ({
      ...myOffersListProps,
      requests: myOffersListProps.requests.slice(0, 2),
    }),
    [myOffersListProps],
  );
  const topProviderItems = React.useMemo(
    () => topProviders.slice(0, 3),
    [topProviders],
  );

  return (
    <section className="workspace-overview">
      <div className="workspace-overview__hero">
        <section className="panel workspace-overview__panel workspace-overview__panel--snapshot">
          <div className="panel-header">
            <div>
              <p className="section-title">{copy.snapshotTitle}</p>
              <p className="section-subtitle">{copy.snapshotSubtitle}</p>
            </div>
          </div>
          <div className="workspace-overview__kpis">
            {snapshotItems.map((item) => (
              <KpiCard
                key={item.key}
                label={item.label}
                value={item.value}
                meta={item.meta}
                tone={item.tone}
              />
            ))}
          </div>
          <ActivityInsight text={insightText} progressPercent={activityProgress} className="workspace-overview__health" />
        </section>

        <section className="panel workspace-overview__panel workspace-overview__panel--actions">
          <div className="panel-header">
            <div>
              <p className="section-title">{copy.quickActionsTitle}</p>
              <p className="section-subtitle">{copy.quickActionsSubtitle}</p>
            </div>
          </div>
          <div className="workspace-overview__actions">
            <CreateRequestCard href={primaryAction.href} variant="compact" onClick={onPrimaryActionClick} />
            <div className="workspace-overview__action-links">
              {copy.quickActionsSecondary.map((action) => (
                <Link key={action.href} href={action.href} prefetch={false} className="btn-ghost is-primary">
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="workspace-overview__grid">
        <section className="panel workspace-overview__panel">
          <div className="panel-header">
            <div>
              <p className="section-title">{copy.insightsTitle}</p>
              <p className="section-subtitle">{copy.insightsSubtitle}</p>
            </div>
          </div>
          <div className="workspace-overview__insights">
            {insights.map((item) => (
              <article key={item.key} className="workspace-overview__insight-card">
                <span className="workspace-overview__insight-label">{item.label}</span>
                <p className="workspace-overview__insight-text">{item.text}</p>
                <Link href={item.ctaHref} prefetch={false} className="btn-ghost is-primary workspace-overview__insight-cta">
                  {item.ctaLabel}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="panel workspace-overview__panel">
          <div className="panel-header">
            <div>
              <p className="section-title">{topProvidersTitle}</p>
              <p className="section-subtitle">{topProvidersSubtitle}</p>
            </div>
            <MoreDotsLink href={topProvidersCtaHref} label={topProvidersCtaLabel} />
          </div>
          <ProviderList
            providers={topProviderItems}
            favoriteProviderIds={favoriteProviderIds}
            pendingFavoriteProviderIds={pendingFavoriteProviderIds}
            onToggleFavorite={onToggleProviderFavorite}
          />
        </section>
      </div>

      <div className="workspace-overview__grid">
        <section className="panel workspace-overview__panel">
          <div className="panel-header">
            <div>
              <p className="section-title">{copy.requestsTitle}</p>
              <p className="section-subtitle">{copy.requestsSubtitle}</p>
            </div>
            <MoreDotsLink href="/workspace?section=requests" label={copy.requestsCta} />
          </div>
          <div className="requests-list is-single workspace-overview__list">
            <RequestsList {...recentRequestsListProps} />
          </div>
        </section>

        <section className="panel workspace-overview__panel">
          <div className="panel-header">
            <div>
              <p className="section-title">{copy.offersTitle}</p>
              <p className="section-subtitle">{copy.offersSubtitle}</p>
            </div>
            <MoreDotsLink href="/workspace?tab=my-offers" label={copy.offersCta} />
          </div>
          <div className="requests-list is-single workspace-overview__list">
            <RequestsList {...activeOffersListProps} />
          </div>
        </section>
      </div>
    </section>
  );
}
