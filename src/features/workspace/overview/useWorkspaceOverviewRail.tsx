'use client';

import * as React from 'react';

import {
  getWorkspaceChipValue,
  useWorkspaceContext,
} from '@/features/workspace/context';
import { WorkspacePublicDemandMapPanel } from '@/features/workspace/demand-map';
import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';
import {
  WorkspaceSectionAside,
  type WorkspaceUnifiedRailModel,
  type WorkspaceUnifiedRailQueueItem,
  type WorkspaceUnifiedRailRecommendationItem,
} from '@/features/workspace/shared';
import type { WorkspacePublicCityActivityDto, WorkspacePublicSummaryDto } from '@/lib/api/dto/workspace';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';
import { useWorkspaceStatisticsModel, type WorkspaceStatisticsModel } from '@/features/workspace/stats';

type Translator = (key: I18nKey) => string;

const MAX_OVERVIEW_QUEUE_ITEMS = 4;
const MAX_OVERVIEW_RECOMMENDATIONS = 4;

type UseWorkspaceOverviewRailParams = {
  isOverviewMode: boolean;
  t: Translator;
  locale: Locale;
  currentSearch: string;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  publicSummaryView: {
    cityActivity: WorkspacePublicCityActivityDto | null | undefined;
    summary?: WorkspacePublicSummaryDto | null;
    isMapLoading?: boolean;
    isMapError?: boolean;
  };
};

function resolveRecommendationTone(
  index: number,
): NonNullable<WorkspaceUnifiedRailRecommendationItem['tone']> {
  if (index === 0) return 'opportunity';
  if (index === 1) return 'positive';
  return 'neutral';
}

function getOverviewRailPrimaryLabel(locale: Locale) {
  return locale === 'de' ? 'Markt prüfen' : 'Review market';
}

function getOverviewQueueTitle(locale: Locale, count: number) {
  if (locale !== 'de') {
    return `${count} market ${count === 1 ? 'opportunity' : 'opportunities'}`;
  }

  return count === 1 ? '1 Marktchance' : `${count} Marktchancen`;
}

function formatOverviewNumber(value: number | null | undefined, locale: Locale) {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(Math.max(0, value ?? 0));
}

function getOverviewMarketLabels(locale: Locale) {
  if (locale !== 'de') {
    return {
      activeRequests: 'Active requests',
      activeProviders: 'Active providers',
      responseRate: 'Response rate',
      averageReply: 'Avg reply',
      marketSize: 'Market size',
      opportunitiesEyebrow: 'Market Opportunities',
      recommendationsTitle: 'AI Recommendations',
      demandPrefix: 'High demand in',
      providerGapPrefix: 'Low provider coverage in',
      demandTrend: 'Rising demand',
      categoryFocus: 'Focus',
      bestRegion: 'Best region',
      bestWindow: 'Best time',
      noMarketSignals: 'No market signals available yet.',
      requestsMetric: 'active requests',
    };
  }

  return {
    activeRequests: 'Aktive Anfragen',
    activeProviders: 'Aktive Anbieter',
    responseRate: 'Antwortquote',
    averageReply: 'Ø Antwortzeit',
    marketSize: 'Marktgröße',
    opportunitiesEyebrow: 'Market Opportunities',
    recommendationsTitle: 'AI Empfehlungen',
    demandPrefix: 'Hohe Nachfrage in',
    providerGapPrefix: 'Wenig Anbieter in',
    demandTrend: 'Steigende Nachfrage',
    categoryFocus: 'Fokus',
    bestRegion: 'Beste Region',
    bestWindow: 'Beste Zeit',
    noMarketSignals: 'Noch keine Marktsignale verfügbar.',
    requestsMetric: 'aktive Anfragen',
  };
}

function buildOverviewDecisionMetrics(params: {
  labels: ReturnType<typeof getOverviewMarketLabels>;
  locale: Locale;
  statisticsModel: WorkspaceStatisticsModel;
  publicSummaryView: UseWorkspaceOverviewRailParams['publicSummaryView'];
}) {
  const { labels, locale, publicSummaryView, statisticsModel } = params;
  const requestCount =
    publicSummaryView.summary?.totalPublishedRequests ??
    publicSummaryView.cityActivity?.totalActiveRequests ??
    statisticsModel.cityRows.reduce((sum, city) => sum + city.count, 0);
  const providerCount =
    publicSummaryView.summary?.totalActiveProviders ??
    statisticsModel.kpis.find((item) => item.key === 'active-providers')?.value ??
    0;
  const responseRate =
    statisticsModel.activitySignals.find((item) => item.key === 'offer-rate')?.value ?? '—';
  const averageReply =
    statisticsModel.activitySignals.find((item) => item.key === 'response-median')?.value ?? '—';

  return [
    {
      key: 'active-requests',
      label: labels.activeRequests,
      value: formatOverviewNumber(requestCount, locale),
      icon: 'requests' as const,
      tone: 'primary' as const,
    },
    {
      key: 'active-providers',
      label: labels.activeProviders,
      value: typeof providerCount === 'number' ? formatOverviewNumber(providerCount, locale) : providerCount,
      icon: 'providers' as const,
      tone: 'accent' as const,
    },
    {
      key: 'response-rate',
      label: labels.responseRate,
      value: responseRate,
      icon: 'responseRate' as const,
      tone: 'success' as const,
    },
    {
      key: 'average-reply',
      label: labels.averageReply,
      value: averageReply,
      icon: 'responseTime' as const,
      tone: 'warning' as const,
    },
  ];
}

function buildOverviewMarketOpportunities(params: {
  analysisHref: string;
  labels: ReturnType<typeof getOverviewMarketLabels>;
  locale: Locale;
  statisticsModel: WorkspaceStatisticsModel;
}): WorkspaceUnifiedRailQueueItem[] {
  const { analysisHref, labels, locale, statisticsModel } = params;
  const opportunities: WorkspaceUnifiedRailQueueItem[] = [];
  const topCity = statisticsModel.cityRows.find((city) => city.count > 0) ?? statisticsModel.cityRows[0] ?? null;
  const providerGapCity =
    statisticsModel.cityRows.find((city) => city.count > 0 && (city.providersActive ?? 0) <= 3) ??
    topCity;
  const trendValue = statisticsModel.activityTrend.value;

  if (topCity) {
    opportunities.push({
      id: `city-demand-${topCity.key}`,
      title: `${labels.demandPrefix} ${topCity.name}`,
      meta: `${formatOverviewNumber(topCity.count, locale)} ${labels.requestsMetric}`,
      priorityTone: 'high',
      priorityBadgeVariant: 'opportunity',
      priorityLabel: 'Chance',
      action: { kind: 'link', label: labels.opportunitiesEyebrow, href: analysisHref },
    });
  }

  if (providerGapCity && providerGapCity.key !== topCity?.key) {
    opportunities.push({
      id: `provider-gap-${providerGapCity.key}`,
      title: `${labels.providerGapPrefix} ${providerGapCity.name}`,
      meta: `${formatOverviewNumber(providerGapCity.count, locale)} ${labels.requestsMetric}`,
      priorityTone: 'medium',
      priorityBadgeVariant: 'opportunity',
      priorityLabel: 'Chance',
      action: { kind: 'link', label: labels.opportunitiesEyebrow, href: analysisHref },
    });
  }

  if (trendValue.trim().length > 0) {
    opportunities.push({
      id: 'market-trend',
      title: labels.demandTrend,
      meta: trendValue,
      priorityTone: trendValue.includes('↓') ? 'low' : 'medium',
      priorityBadgeVariant: 'warning',
      priorityLabel: 'Trend',
      action: { kind: 'link', label: labels.opportunitiesEyebrow, href: analysisHref },
    });
  }

  return opportunities.slice(0, MAX_OVERVIEW_QUEUE_ITEMS);
}

export function useWorkspaceOverviewRail({
  isOverviewMode,
  t,
  locale,
  currentSearch,
  activePublicSection,
  activeWorkspaceTab,
  publicSummaryView,
}: UseWorkspaceOverviewRailParams) {
  const statisticsModel = useWorkspaceStatisticsModel({ locale });
  const focusModel = useWorkspaceContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
  });
  const overviewHref = React.useMemo(
    () => buildWorkspaceHref({ currentSearch, section: 'overview', removeKeys: ['page'] }),
    [currentSearch],
  );
  const analysisHref = React.useMemo(
    () => buildWorkspaceHref({ currentSearch, section: 'stats', removeKeys: ['page'] }),
    [currentSearch],
  );
  const marketLabels = React.useMemo(() => getOverviewMarketLabels(locale), [locale]);
  const decisionMetrics = React.useMemo(
    () => buildOverviewDecisionMetrics({
      labels: marketLabels,
      locale,
      publicSummaryView,
      statisticsModel,
    }),
    [locale, marketLabels, publicSummaryView, statisticsModel],
  );
  const actionQueueItems = React.useMemo<WorkspaceUnifiedRailQueueItem[]>(
    () => buildOverviewMarketOpportunities({
      analysisHref,
      labels: marketLabels,
      locale,
      statisticsModel,
    }),
    [analysisHref, locale, marketLabels, statisticsModel],
  );
  const recommendationItems = React.useMemo<WorkspaceUnifiedRailRecommendationItem[]>(() => {
    const cityValue = getWorkspaceChipValue(focusModel.chips, 'city');
    const categoryValue = getWorkspaceChipValue(focusModel.chips, 'category');
    const serviceValue = getWorkspaceChipValue(focusModel.chips, 'service');
    const bestCategory = statisticsModel.demandRows[0] ?? null;
    const bestCity = statisticsModel.cityRows.find((city) => city.count > 0) ?? statisticsModel.cityRows[0] ?? null;
    const categoryLabel = serviceValue || categoryValue || bestCategory?.categoryName || focusModel.copy.contextFallbacks.category;
    const regionLabel = cityValue || bestCity?.name || statisticsModel.context.cityLabel;

    return [
      {
        id: 'focus-category',
        title: `${marketLabels.categoryFocus}: ${categoryLabel}`,
        description: bestCategory
          ? `${Math.round(bestCategory.sharePercent)}% der Nachfrage`
          : statisticsModel.context.scopeLabel,
        metric: bestCategory ? formatOverviewNumber(bestCategory.requestCount, locale) : null,
      },
      {
        id: 'best-region',
        title: `${marketLabels.bestRegion}: ${regionLabel}`,
        description: bestCity
          ? `${formatOverviewNumber(bestCity.count, locale)} ${marketLabels.requestsMetric}`
          : statisticsModel.context.stickyLabel,
        metric: bestCity?.score != null ? Math.round(bestCity.score) : null,
      },
      {
        id: 'best-window',
        title: marketLabels.bestWindow,
        description: statisticsModel.activityMeta.bestWindow,
        metric: statisticsModel.context.periodLabel,
      },
    ]
      .filter((item) => item.description.trim().length > 0)
      .slice(0, MAX_OVERVIEW_RECOMMENDATIONS)
      .map((item, index) => ({
        ...item,
        tone: resolveRecommendationTone(index),
      }));
  }, [
    focusModel.chips,
    focusModel.copy.contextFallbacks.category,
    locale,
    marketLabels.bestRegion,
    marketLabels.bestWindow,
    marketLabels.categoryFocus,
    marketLabels.requestsMetric,
    statisticsModel.activityMeta.bestWindow,
    statisticsModel.context.cityLabel,
    statisticsModel.context.periodLabel,
    statisticsModel.context.scopeLabel,
    statisticsModel.context.stickyLabel,
    statisticsModel.cityRows,
    statisticsModel.demandRows,
  ]);
  const railModel = React.useMemo<WorkspaceUnifiedRailModel>(() => ({
    decisionPanel: {
      eyebrow: t(I18N_KEYS.requestsPage.decisionPanelTitle),
      value: decisionMetrics[0]?.value ?? '—',
      contextLabel: marketLabels.marketSize,
      title: marketLabels.activeRequests,
      layout: 'metricGrid',
      visualization: 'none',
      metrics: decisionMetrics,
      primaryAction: {
        kind: 'link',
        label: getOverviewRailPrimaryLabel(locale),
        href: overviewHref,
      },
      secondaryAction: {
        kind: 'link',
        label: t(I18N_KEYS.requestsPage.workspaceRailAnalysisCta),
        href: analysisHref,
      },
    },
    actionQueue: {
      eyebrow: marketLabels.opportunitiesEyebrow,
      title: getOverviewQueueTitle(locale, actionQueueItems.length),
      items: actionQueueItems,
      emptyText: marketLabels.noMarketSignals,
      footerAction: {
        kind: 'link',
        label: t(I18N_KEYS.requestsPage.workspaceRailQueueCta),
        href: analysisHref,
      },
    },
    recommendations: {
      eyebrow: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsEyebrow),
      title: marketLabels.recommendationsTitle,
      items: recommendationItems,
      emptyText: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsEmpty),
      footerAction: {
        kind: 'link',
        label: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsCta),
        href: analysisHref,
      },
    },
  }), [
    actionQueueItems,
    analysisHref,
    decisionMetrics,
    locale,
    marketLabels.activeRequests,
    marketLabels.marketSize,
    marketLabels.noMarketSignals,
    marketLabels.opportunitiesEyebrow,
    marketLabels.recommendationsTitle,
    overviewHref,
    recommendationItems,
    t,
  ]);

  const mapPanel = isOverviewMode ? (
    <WorkspacePublicDemandMapPanel
      t={t}
      locale={locale}
      cityActivity={publicSummaryView.cityActivity}
      summary={publicSummaryView.summary}
      isLoading={publicSummaryView.isMapLoading}
      isError={publicSummaryView.isMapError}
      className="workspace-overview__panel workspace-overview__panel--map"
      headerClassName="workspace-overview__tile-header"
      onSelectCity={statisticsModel.setCityId}
    />
  ) : null;

  const aiRail = isOverviewMode ? (
    <WorkspaceSectionAside model={railModel} />
  ) : undefined;

  return {
    statisticsModel,
    mapPanel,
    aiRail,
  };
}
