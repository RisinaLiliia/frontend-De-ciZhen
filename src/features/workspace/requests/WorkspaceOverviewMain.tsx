'use client';

import * as React from 'react';
import Link from 'next/link';

import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { RequestsList } from '@/components/requests/RequestsList';
import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { RequestCard } from '@/components/requests/RequestCard';
import { buildRequestListPresentation } from '@/components/requests/requestListItem.model';
import type { RequestsListProps } from '@/components/requests/requestsList.types';
import { ProviderList } from '@/components/providers/ProviderList';
import { Badge } from '@/components/ui/Badge';
import { LocationMeta } from '@/components/ui/LocationMeta';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { IconCalendar } from '@/components/ui/icons/icons';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { buildWorkspaceHref } from '@/features/workspace/shell/workspaceLinks';
import type { WorkspaceStatisticsModel } from './stats/useWorkspaceStatisticsModel';
import { StatisticsDecisionAiCard } from './stats/components/StatisticsDecisionAiCard';
import { StatisticsMetricSignalCard } from './stats/components/StatisticsMetricSignalCard';
import { StatisticsDemandPanelSection } from './stats/WorkspaceStatisticsSections';

type WorkspaceOverviewMainProps = {
  locale: Locale;
  t: (key: I18nKey) => string;
  currentSearch: string;
  statisticsModel: WorkspaceStatisticsModel;
  heroRef?: React.Ref<HTMLDivElement>;
  gridRef?: React.Ref<HTMLDivElement>;
  actionsRef?: React.Ref<HTMLElement>;
  primaryAction: {
    href: string;
    label: string;
  };
  onPrimaryActionClick: () => void;
  activeOffersListProps: RequestsListProps;
  topProviders: ReadonlyArray<TopProviderItem>;
  topProvidersTitle: string;
  topProvidersSubtitle: string;
  topProvidersCtaLabel: string;
  favoriteProviderIds: ReadonlySet<string>;
  pendingFavoriteProviderIds: ReadonlySet<string>;
  onToggleProviderFavorite: (providerId: string) => void;
};

function getOverviewCopy(locale: Locale) {
  if (locale === 'en') {
    return {
      snapshotTitle: 'Platform overview',
      snapshotSubtitle: 'What matters now, where the opportunity is, and what to do next.',
      focusLabel: 'Focus mode',
      quickActionsTitle: 'Quick actions',
      quickActionsSubtitle: 'Jump to the next decision without leaving this workspace.',
      quickActionsSecondary: {
        requests: 'Open requests',
        providers: 'Find providers',
        analysis: 'Open analysis',
      },
      offersTitle: 'Active offers',
      offersSubtitle: 'Recent demand with market signals for faster analysis.',
      offersCta: 'Open analysis',
      topProvidersTitle: 'Top providers',
      topProvidersSubtitle: 'Verified providers with fast replies and visible activity here.',
      opportunityBadge: 'Opportunity',
      demandHigh: 'High demand',
      demandMedium: 'Stable demand',
      demandLow: 'Selective demand',
      competitionLow: 'Few providers',
      competitionBalanced: 'Balanced supply',
      competitionHigh: 'Higher competition',
    };
  }

  return {
    snapshotTitle: 'Plattformüberblick',
    snapshotSubtitle: 'Was jetzt passiert, wo Chancen liegen und was als Nächstes zu tun ist.',
    focusLabel: 'Focus Mode',
    quickActionsTitle: 'Schnellaktionen',
    quickActionsSubtitle: 'Direkt zur nächsten Entscheidung, ohne den Workspace-Kontext zu verlassen.',
    quickActionsSecondary: {
      requests: 'Aufträge öffnen',
      providers: 'Anbieter suchen',
      analysis: 'Analyse öffnen',
    },
    offersTitle: 'Aktive Angebote',
    offersSubtitle: 'Neue Nachfrage mit Marktsignalen für den direkten Analyse-Einstieg.',
    offersCta: 'Analyse öffnen',
    topProvidersTitle: 'Top Anbieter',
    topProvidersSubtitle: 'Verifiziert, schnell in der Antwort und aktiv im aktuellen Kontext.',
    opportunityBadge: 'Chance',
    demandHigh: 'Hohe Nachfrage',
    demandMedium: 'Stabile Nachfrage',
    demandLow: 'Selektive Nachfrage',
    competitionLow: 'Wenig Anbieter',
    competitionBalanced: 'Ausgeglichen',
    competitionHigh: 'Mehr Wettbewerb',
  };
}

function getRequestCreatedAtTs(request: Pick<RequestResponseDto, 'createdAt'>) {
  const timestamp = new Date(request.createdAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortRequestsByCreatedAtDesc(requests: RequestResponseDto[]) {
  return requests
    .slice()
    .sort((left, right) => getRequestCreatedAtTs(right) - getRequestCreatedAtTs(left));
}

function buildPlatformSnapshotItems(model: WorkspaceStatisticsModel) {
  const liveItems = model.kpis.slice(0, 4).map((item) => ({
    key: item.key,
    label: item.label,
    value: item.value,
    hint: item.hint,
    tone: item.tone,
  }));

  if (liveItems.length > 0) return liveItems;

  return [
    {
      key: 'requests-total',
      label: model.copy.requestsLabel,
      value: '—',
      hint: model.copy.kpiActiveRequestsHintSuffix,
      tone: 'neutral' as const,
    },
    {
      key: 'offers-total',
      label: model.copy.offersLabel,
      value: '—',
      hint: model.copy.kpiLast7DaysHintSuffix,
      tone: 'neutral' as const,
    },
    {
      key: 'completed-total',
      label: model.copy.stage4LabelPlatform,
      value: '—',
      hint: model.copy.kpiNoCompletedJobs,
      tone: 'neutral' as const,
    },
    {
      key: 'active-providers',
      label: model.copy.kpiActiveProvidersLabel,
      value: '—',
      hint: model.copy.kpiWithDemandHint,
      tone: 'neutral' as const,
    },
  ];
}

function resolveRequestCategoryKey(request: RequestResponseDto, listProps: RequestsListProps) {
  return request.categoryKey ?? listProps.serviceByKey.get(request.serviceKey)?.categoryKey ?? null;
}

function resolveOpportunityMatch(params: {
  request: RequestResponseDto;
  categoryKey: string | null;
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
}) {
  const { request, categoryKey, opportunityRadar } = params;

  return opportunityRadar.find((item) => item.cityId === request.cityId && item.categoryKey === categoryKey)
    ?? opportunityRadar.find((item) => item.cityId === request.cityId)
    ?? opportunityRadar.find((item) => item.categoryKey === categoryKey)
    ?? opportunityRadar[0]
    ?? null;
}

function resolveDemandLabel(params: {
  copy: ReturnType<typeof getOverviewCopy>;
  opportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
}) {
  const { copy, opportunity } = params;
  if (!opportunity) return copy.demandMedium;
  if (opportunity.demandScore >= 7) return copy.demandHigh;
  if (opportunity.demandScore >= 4.5) return copy.demandMedium;
  return copy.demandLow;
}

function resolveCompetitionLabel(params: {
  copy: ReturnType<typeof getOverviewCopy>;
  opportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
}) {
  const { copy, opportunity } = params;
  if (!opportunity) return copy.competitionBalanced;
  if (opportunity.providers !== null && opportunity.providers <= 3) return copy.competitionLow;
  if (opportunity.tone === 'balanced' || opportunity.tone === 'high') return copy.competitionBalanced;
  return copy.competitionHigh;
}

function WorkspaceOpportunityCards({
  locale,
  copy,
  requestsListProps,
  statisticsModel,
}: {
  locale: Locale;
  copy: ReturnType<typeof getOverviewCopy>;
  requestsListProps: RequestsListProps;
  statisticsModel: WorkspaceStatisticsModel;
}) {
  const recentRequests = React.useMemo(
    () => sortRequestsByCreatedAtDesc(requestsListProps.requests).slice(0, 2),
    [requestsListProps.requests],
  );

  const cards = React.useMemo(
    () =>
      recentRequests.map((request, index) => {
        const categoryKey = resolveRequestCategoryKey(request, requestsListProps);
        const presentation = buildRequestListPresentation({
          item: request,
          t: requestsListProps.t,
          locale,
          serviceByKey: requestsListProps.serviceByKey,
          categoryByKey: requestsListProps.categoryByKey,
          cityById: requestsListProps.cityById,
          formatPrice: requestsListProps.formatPrice,
          enableOfferActions: false,
          favoriteRequestIds: requestsListProps.favoriteRequestIds,
          pendingOfferRequestId: null,
          pendingFavoriteRequestIds: requestsListProps.pendingFavoriteRequestIds,
        });
        const opportunity = resolveOpportunityMatch({
          request,
          categoryKey,
          opportunityRadar: statisticsModel.opportunityRadar,
        });

        return {
          key: request.id,
          prefetch: index < 2,
          href: `/requests/${request.id}`,
          preferredDate: request.preferredDate,
          presentation,
          demandLabel: resolveDemandLabel({ copy, opportunity }),
          competitionLabel: resolveCompetitionLabel({ copy, opportunity }),
        };
      }),
    [copy, locale, recentRequests, requestsListProps, statisticsModel.opportunityRadar],
  );

  if (requestsListProps.isLoading || requestsListProps.isError || recentRequests.length === 0) {
    return (
      <div className="requests-list is-single workspace-overview__list">
        <RequestsList
          {...requestsListProps}
          requests={recentRequests}
        />
      </div>
    );
  }

  return (
    <div className="workspace-overview__opportunities">
      {cards.map((card) => (
        <RequestCard
          key={card.key}
          href={card.href}
          ariaLabel={card.presentation.card.title}
          prefetch={card.prefetch}
          imageSrc={card.presentation.card.imageSrc}
          imageAlt=""
          badges={[]}
          category={card.presentation.card.categoryLabel}
          title={card.presentation.card.title}
          excerpt={card.presentation.card.excerpt}
          meta={[
            <LocationMeta key="city" label={card.presentation.card.cityLabel} />,
            <React.Fragment key="date">
              <IconCalendar />
              {requestsListProps.formatDate.format(new Date(card.preferredDate))}
            </React.Fragment>,
          ]}
          bottomMeta={[card.demandLabel, card.competitionLabel]}
          priceLabel={card.presentation.card.priceLabel}
          priceTrend={card.presentation.card.priceTrend}
          priceTrendLabel={card.presentation.card.priceTrendLabel}
          mode="link"
          statusSlot={<Badge variant="opportunity" tone="soft" size="sm">{copy.opportunityBadge}</Badge>}
          overlaySlot={
            requestsListProps.showFavoriteButton ? (
              <FavoriteButton
                variant="icon"
                isFavorite={card.presentation.favorite.isFavorite}
                isPending={card.presentation.favorite.isFavoritePending}
                onToggle={() => requestsListProps.onToggleFavorite?.(card.key)}
                ariaLabel={requestsListProps.t(I18N_KEYS.requestDetails.ctaSave)}
              />
            ) : null
          }
        />
      ))}
    </div>
  );
}

export function WorkspaceOverviewMain({
  locale,
  t,
  currentSearch,
  statisticsModel,
  heroRef,
  gridRef,
  actionsRef,
  primaryAction,
  onPrimaryActionClick,
  activeOffersListProps,
  topProviders,
  topProvidersTitle,
  topProvidersSubtitle,
  topProvidersCtaLabel,
  favoriteProviderIds,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
}: WorkspaceOverviewMainProps) {
  const copy = React.useMemo(() => getOverviewCopy(locale), [locale]);
  const snapshotItems = React.useMemo(
    () => buildPlatformSnapshotItems(statisticsModel),
    [statisticsModel],
  );
  const topProviderItems = React.useMemo(
    () => topProviders.slice(0, 3),
    [topProviders],
  );
  const resolvedTopProvidersSubtitle = copy.topProvidersSubtitle || topProvidersSubtitle;
  const requestsHref = React.useMemo(
    () => buildWorkspaceHref({ currentSearch, section: 'requests', removeKeys: ['page'] }),
    [currentSearch],
  );
  const providersHref = React.useMemo(
    () => buildWorkspaceHref({ currentSearch, section: 'providers', removeKeys: ['page'] }),
    [currentSearch],
  );
  const analysisHref = React.useMemo(
    () => buildWorkspaceHref({ currentSearch, section: 'stats', removeKeys: ['page'] }),
    [currentSearch],
  );
  const quickActionLinks = React.useMemo(
    () => [
      { href: requestsHref, label: copy.quickActionsSecondary.requests },
      { href: providersHref, label: copy.quickActionsSecondary.providers },
      { href: analysisHref, label: copy.quickActionsSecondary.analysis },
    ],
    [analysisHref, copy.quickActionsSecondary.analysis, copy.quickActionsSecondary.providers, copy.quickActionsSecondary.requests, providersHref, requestsHref],
  );
  const isFocusMode = statisticsModel.context.mode === 'focus';

  return (
    <section className="workspace-statistics-layout workspace-overview">
      <div ref={heroRef} className="workspace-overview__hero">
        <section className="panel workspace-overview__panel workspace-overview__panel--snapshot">
          <div className="panel-header">
            <div className="section-heading workspace-statistics__tile-header">
              <p className="section-title">{copy.snapshotTitle}</p>
              <p className="section-subtitle">
                {isFocusMode ? statisticsModel.context.subtitle : copy.snapshotSubtitle}
              </p>
              {isFocusMode ? (
                <div className="chip-row workspace-overview__focus-row">
                  <span className="status-badge status-badge--info">
                    {copy.focusLabel}: {statisticsModel.context.stickyLabel}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="workspace-overview__kpis">
            {snapshotItems.map((item) => (
              <StatisticsMetricSignalCard
                key={item.key}
                label={item.label}
                value={item.value}
                hint={item.hint}
                tone={item.tone}
              />
            ))}
          </div>
          <StatisticsDecisionAiCard
            copy={statisticsModel.copy}
            decisionInsight={statisticsModel.decisionInsight}
            className="workspace-overview__snapshot-ai"
          />
        </section>

        <StatisticsDemandPanelSection
          model={statisticsModel}
          t={t}
          className="workspace-overview__panel"
          onSelectCategory={statisticsModel.setCategoryKey}
        />
      </div>

      <div ref={gridRef} className="workspace-overview__grid">
        <section className="panel workspace-overview__panel">
          <div className="panel-header">
            <div className="section-heading workspace-statistics__tile-header">
              <p className="section-title">{topProvidersTitle}</p>
              <p className="section-subtitle">{resolvedTopProvidersSubtitle}</p>
            </div>
            <MoreDotsLink href={providersHref} label={topProvidersCtaLabel} />
          </div>
          <ProviderList
            className="provider-list workspace-overview__providers"
            providers={topProviderItems}
            favoriteProviderIds={favoriteProviderIds}
            pendingFavoriteProviderIds={pendingFavoriteProviderIds}
            onToggleFavorite={onToggleProviderFavorite}
          />
        </section>

        <section className="panel workspace-overview__panel">
          <div className="panel-header">
            <div className="section-heading workspace-statistics__tile-header">
              <p className="section-title">{copy.offersTitle}</p>
              <p className="section-subtitle">{copy.offersSubtitle}</p>
            </div>
            <MoreDotsLink href={analysisHref} label={copy.offersCta} />
          </div>
          <WorkspaceOpportunityCards
            locale={locale}
            copy={copy}
            requestsListProps={activeOffersListProps}
            statisticsModel={statisticsModel}
          />
        </section>
      </div>

      <section ref={actionsRef} className="panel workspace-overview__panel workspace-overview__panel--actions">
        <div className="panel-header">
          <div className="section-heading workspace-statistics__tile-header">
            <p className="section-title">{copy.quickActionsTitle}</p>
            <p className="section-subtitle">{copy.quickActionsSubtitle}</p>
          </div>
        </div>
        <div className="workspace-overview__actions">
          <CreateRequestCard href={primaryAction.href} variant="compact" onClick={onPrimaryActionClick} />
          <div className="workspace-overview__action-links">
            {quickActionLinks.map((action) => (
              <Link key={action.href} href={action.href} prefetch={false} className="btn-ghost is-primary">
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
