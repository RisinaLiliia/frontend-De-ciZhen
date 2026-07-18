'use client';

import * as React from 'react';
import Link from 'next/link';

import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { WorkspaceGuestRequestCard } from '@/components/requests/WorkspaceGuestRequestCard';
import { ProviderList } from '@/components/providers/ProviderList';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';
import { buildWorkspaceRequestDetailHref } from '@/features/workspace/requests/workspaceRequestRoute.model';
import { CardSkeletonList } from '@/features/workspace/requests/RequestsViewStates';
import type { WorkspaceRequestsViewCard } from '@/features/workspace/requests/workspaceRequestsView.model';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import type { WorkspaceStatisticsModel } from '@/features/workspace/stats';
import { StatisticsDemandPanelSection } from '@/features/workspace/stats/StatisticsSections';

type WorkspaceOverviewMainProps = {
  locale: Locale;
  t: (key: I18nKey) => string;
  currentSearch: string;
  statisticsModel: WorkspaceStatisticsModel;
  mapPanel?: React.ReactNode;
  primaryAction: {
    href: string;
    label: string;
  };
  onPrimaryActionClick: () => void;
  activeOffersState: {
    cards: WorkspaceRequestsViewCard[];
    isLoading: boolean;
    isError: boolean;
    favoriteRequestIds: ReadonlySet<string>;
    pendingFavoriteRequestIds: ReadonlySet<string>;
    onToggleFavorite: (requestId: string) => void;
  };
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

function getRequestCreatedAtTs(card: Pick<WorkspaceRequestsViewCard, 'createdAtIso'>) {
  const timestamp = new Date(card.createdAtIso ?? '').getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortRequestsByCreatedAtDesc(cards: WorkspaceRequestsViewCard[]) {
  return cards
    .slice()
    .sort((left, right) => getRequestCreatedAtTs(right) - getRequestCreatedAtTs(left));
}

function resolveOpportunityMatch(params: {
  card: WorkspaceRequestsViewCard;
  categoryKey: string | null;
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
}) {
  const { card, categoryKey, opportunityRadar } = params;
  const cityLabel = card.requestPreview.cityLabel ?? null;

  return opportunityRadar.find((item) => item.city === cityLabel && item.categoryKey === categoryKey)
    ?? opportunityRadar.find((item) => item.city === cityLabel)
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
  currentSearch,
  copy,
  requestsState,
  statisticsModel,
}: {
  locale: Locale;
  currentSearch: string;
  copy: ReturnType<typeof getOverviewCopy>;
  requestsState: WorkspaceOverviewMainProps['activeOffersState'];
  statisticsModel: WorkspaceStatisticsModel;
}) {
  const recentCards = React.useMemo(
    () => sortRequestsByCreatedAtDesc(requestsState.cards).slice(0, 2),
    [requestsState.cards],
  );

  const opportunityCards = React.useMemo(
    () =>
      recentCards.map((card, index) => {
        const preview = card.requestPreview;
        const categoryKey = card.category ?? null;
        const opportunity = resolveOpportunityMatch({
          card,
          categoryKey,
          opportunityRadar: statisticsModel.opportunityRadar,
        });

        return {
          key: card.requestId,
          prefetch: index < 2,
          href: buildWorkspaceRequestDetailHref({ currentSearch, requestId: card.requestId }),
          preview,
          demandLabel: resolveDemandLabel({ copy, opportunity }),
          competitionLabel: resolveCompetitionLabel({ copy, opportunity }),
        };
      }),
    [copy, currentSearch, recentCards, statisticsModel.opportunityRadar],
  );

  if (requestsState.isLoading && recentCards.length === 0) {
    return (
      <div className="workspace-overview__list">
        <CardSkeletonList />
      </div>
    );
  }

  if (requestsState.isError || recentCards.length === 0) {
    return null;
  }

  return (
    <div className="workspace-overview__opportunities">
      {opportunityCards.map((card) => (
        <WorkspaceGuestRequestCard
          key={card.key}
          href={card.href}
          ariaLabel={card.preview.title}
          className="workspace-guest-request-card workspace-guest-request-card--overview"
          prefetch={card.prefetch}
          imageSrc={card.preview.imageUrl ?? ''}
          imageAlt=""
          categoryLabel={card.preview.categoryLabel}
          title={card.preview.title}
          excerpt={card.preview.excerpt}
          cityLabel={card.preview.cityLabel}
          dateLabel={card.preview.dateLabel}
          bottomMeta={[card.demandLabel, card.competitionLabel]}
          priceLabel={card.preview.priceLabel}
          priceTrend={card.preview.priceTrend ?? null}
          priceTrendLabel={card.preview.priceTrendLabel ?? null}
          badgeLabel={copy.opportunityBadge}
          overlaySlot={(
            <FavoriteButton
              variant="icon"
              isFavorite={requestsState.favoriteRequestIds.has(card.key)}
              isPending={requestsState.pendingFavoriteRequestIds.has(card.key)}
              onToggle={() => requestsState.onToggleFavorite(card.key)}
              ariaLabel={copy.offersCta}
            />
          )}
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
  mapPanel,
  primaryAction,
  onPrimaryActionClick,
  activeOffersState,
  topProviders,
  topProvidersTitle,
  topProvidersSubtitle,
  topProvidersCtaLabel,
  favoriteProviderIds,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
}: WorkspaceOverviewMainProps) {
  const copy = React.useMemo(() => getOverviewCopy(t), [t]);
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

  return (
    <section className="workspace-overview">
      <div className="workspace-overview__hero">
        {mapPanel}
        <StatisticsDemandPanelSection
          model={statisticsModel}
          t={t}
          className="workspace-overview__panel workspace-overview__panel--demand workspace-overview__demand-panel"
          headerClassName="workspace-overview__tile-header"
          onSelectCategory={statisticsModel.setCategoryKey}
        />
      </div>

      <div className="workspace-overview__grid">
        <section className={workspacePanelShell('workspace-overview__panel', 'workspace-overview__panel--providers')}>
          <div className="panel-header">
            <div className="section-heading workspace-overview__tile-header">
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
          className={workspacePanelShell('workspace-overview__panel', 'workspace-overview__panel--offers')}
        >
          <div className="panel-header">
            <div className="section-heading workspace-overview__tile-header">
              <p className="section-title">{copy.offersTitle}</p>
              <p className="section-subtitle">{copy.offersSubtitle}</p>
            </div>
            <MoreDotsLink href={analysisHref} label={copy.offersCta} />
          </div>
          <WorkspaceOpportunityCards
            locale={locale}
            currentSearch={currentSearch}
            copy={copy}
            requestsState={activeOffersState}
            statisticsModel={statisticsModel}
          />
        </section>
      </div>

      <section
        className={workspacePanelShell('workspace-overview__panel', 'workspace-overview__panel--actions')}
      >
        <div className="panel-header">
          <div className="section-heading workspace-overview__tile-header">
            <p className="section-title">{copy.quickActionsTitle}</p>
            <p className="section-subtitle">{copy.quickActionsSubtitle}</p>
          </div>
        </div>
        <div className="workspace-overview__actions">
          <CreateRequestCard
            href={primaryAction.href}
            title={primaryAction.label}
            variant="compact"
            className="workspace-overview__primary-action"
            onClick={onPrimaryActionClick}
          />
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
