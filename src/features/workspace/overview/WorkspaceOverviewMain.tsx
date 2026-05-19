'use client';

import * as React from 'react';
import Link from 'next/link';

import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { RequestsList } from '@/components/requests/RequestsList';
import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { buildPublicRequestCardPresentation } from '@/components/requests/publicRequestCard.model';
import type { RequestsListProps } from '@/components/requests/requestsList.types';
import { ProviderList } from '@/components/providers/ProviderList';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { buildWorkspaceHref } from '@/features/workspace/shell/workspaceLinks';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import type { WorkspaceStatisticsModel } from '@/features/workspace/stats';
import { StatisticsDecisionAiCard } from '@/features/workspace/stats/components/StatisticsDecisionAiCard';
import { StatisticsMetricSignalCard } from '@/features/workspace/stats/components/StatisticsMetricSignalCard';
import { StatisticsDemandPanelSection } from '@/features/workspace/stats/WorkspaceStatisticsSections';
import { WorkspaceGuestRequestCard } from '@/features/workspace/requests/components/WorkspaceGuestRequestCard';
import { WorkspaceBadge } from '@/features/workspace/shared/WorkspaceBadge';

type WorkspaceOverviewMainProps = {
  locale: Locale;
  t: (key: I18nKey) => string;
  currentSearch: string;
  statisticsModel: WorkspaceStatisticsModel;
  heroRef?: React.Ref<HTMLDivElement>;
  offersPanelRef?: React.Ref<HTMLElement>;
  actionsStyle?: React.CSSProperties;
  mobileRailTopSlot?: React.ReactNode;
  mobileRailBottomSlot?: React.ReactNode;
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

function getOverviewCopy(t: WorkspaceOverviewMainProps['t']) {
  return {
    snapshotTitle: t(I18N_KEYS.workspace.overviewSnapshotTitle),
    snapshotSubtitle: t(I18N_KEYS.workspace.overviewSnapshotSubtitle),
    focusLabel: t(I18N_KEYS.workspace.overviewFocusLabel),
    quickActionsTitle: t(I18N_KEYS.workspace.overviewQuickActionsTitle),
    quickActionsSubtitle: t(I18N_KEYS.workspace.overviewQuickActionsSubtitle),
    quickActionsSecondary: {
      requests: t(I18N_KEYS.workspace.overviewQuickActionRequests),
      providers: t(I18N_KEYS.workspace.overviewQuickActionProviders),
      analysis: t(I18N_KEYS.workspace.overviewQuickActionAnalysis),
    },
    offersTitle: t(I18N_KEYS.workspace.overviewOffersTitle),
    offersSubtitle: t(I18N_KEYS.workspace.overviewOffersSubtitle),
    offersCta: t(I18N_KEYS.workspace.openAnalysisCta),
    topProvidersSubtitle: t(I18N_KEYS.workspace.overviewTopProvidersSubtitle),
    opportunityBadge: t(I18N_KEYS.workspace.overviewOpportunityBadge),
    demandHigh: t(I18N_KEYS.workspace.overviewDemandHigh),
    demandMedium: t(I18N_KEYS.workspace.overviewDemandMedium),
    demandLow: t(I18N_KEYS.workspace.overviewDemandLow),
    competitionLow: t(I18N_KEYS.workspace.overviewCompetitionLow),
    competitionBalanced: t(I18N_KEYS.workspace.overviewCompetitionBalanced),
    competitionHigh: t(I18N_KEYS.workspace.overviewCompetitionHigh),
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
        const presentation = buildPublicRequestCardPresentation({
          item: request,
          t: requestsListProps.t,
          locale,
          serviceByKey: requestsListProps.serviceByKey,
          categoryByKey: requestsListProps.categoryByKey,
          cityById: requestsListProps.cityById,
          formatPrice: requestsListProps.formatPrice,
          formatDate: requestsListProps.formatDate,
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
        <WorkspaceGuestRequestCard
          key={card.key}
          href={card.href}
          ariaLabel={card.presentation.card.title}
          className="workspace-guest-request-card workspace-guest-request-card--overview"
          prefetch={card.prefetch}
          imageSrc={card.presentation.card.imageSrc}
          imageAlt=""
          categoryLabel={card.presentation.card.categoryLabel}
          title={card.presentation.card.title}
          excerpt={card.presentation.card.excerpt}
          cityLabel={card.presentation.card.cityLabel}
          dateLabel={card.presentation.card.dateLabel}
          bottomMeta={[card.demandLabel, card.competitionLabel]}
          priceLabel={card.presentation.card.priceLabel}
          priceTrend={card.presentation.card.priceTrend}
          priceTrendLabel={card.presentation.card.priceTrendLabel}
          badgeLabel={copy.opportunityBadge}
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
  offersPanelRef,
  actionsStyle,
  mobileRailTopSlot,
  mobileRailBottomSlot,
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
  const copy = React.useMemo(() => getOverviewCopy(t), [t]);
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
        <section className={workspacePanelShell('workspace-overview__panel', 'workspace-overview__panel--snapshot')}>
          <div className="panel-header">
            <div className="section-heading workspace-statistics__tile-header">
              <p className="section-title">{copy.snapshotTitle}</p>
              <p className="section-subtitle">
                {isFocusMode ? statisticsModel.context.subtitle : copy.snapshotSubtitle}
              </p>
              {isFocusMode ? (
                <div className="chip-row workspace-overview__focus-row">
                  <WorkspaceBadge variant="info">
                    {copy.focusLabel}: {statisticsModel.context.stickyLabel}
                  </WorkspaceBadge>
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

      {mobileRailTopSlot ? (
        <div className="workspace-overview__mobile-rail workspace-overview__mobile-rail--top">
          {mobileRailTopSlot}
        </div>
      ) : null}

      <div className="workspace-overview__grid">
        <section className={workspacePanelShell('workspace-overview__panel', 'workspace-overview__panel--providers')}>
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

        <section
          ref={offersPanelRef}
          className={workspacePanelShell('workspace-overview__panel', 'workspace-overview__panel--offers')}
        >
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

      <section
        className={workspacePanelShell('workspace-overview__panel', 'workspace-overview__panel--actions')}
        style={actionsStyle}
      >
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

      {mobileRailBottomSlot ? (
        <div className="workspace-overview__mobile-rail workspace-overview__mobile-rail--bottom">
          {mobileRailBottomSlot}
        </div>
      ) : null}
    </section>
  );
}
