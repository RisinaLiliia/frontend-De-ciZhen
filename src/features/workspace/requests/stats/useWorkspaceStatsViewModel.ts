'use client';

import * as React from 'react';

import type {
  WorkspacePrivateOverviewDto,
  WorkspaceStatisticsActivityMetricsDto,
  WorkspaceStatisticsCategoryDemandDto,
  WorkspaceStatisticsRange,
  WorkspaceStatisticsViewerMode,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import { getWorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import {
  formatDateLabel,
  formatDateTimeLabel,
} from './statisticsModel.mappers';
import { paginateItems } from './statisticsPagination.utils';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type {
  WorkspaceStatisticsActivitySignalView,
  WorkspaceStatisticsContextMetricView,
  WorkspaceStatisticsCityRowView,
  WorkspaceStatisticsFunnelItemView,
  WorkspaceStatisticsFilters,
  WorkspaceStatisticsGrowthCardView,
  WorkspaceStatisticsInsightView,
  WorkspaceStatisticsKpiView,
  WorkspaceStatisticsModel,
  WorkspaceStatisticsOpportunityRadarItemView,
  WorkspaceStatisticsPriceIntelligenceView,
  WorkspaceStatisticsUserIntelligenceView,
} from './workspaceStatistics.model';
import {
  buildActivitySignals,
  buildActivityTrend,
  buildCategoryFit,
  buildCityComparison,
  buildDecisionLayerSignals,
  buildPersonalizedActivitySignals,
  buildPersonalizedPricingSection,
  buildRecommendationActionSection,
  buildRecommendationPrioritySection,
  buildCityRows,
  buildContext,
  buildContextHealthMetrics,
  buildFunnelComparison,
  buildFunnelConversion,
  buildFunnel,
  buildFunnelDropoff,
  buildFunnelSummary,
  buildGrowthCards,
  buildInsights,
  buildKpis,
  buildOpportunityRadar,
  buildPriceIntelligence,
  buildSectionMeta,
  buildUserIntelligence,
  DEFAULT_ACTIVITY_METRICS,
  ensureSelectedFilterOption,
  exportWorkspaceStatisticsCsv,
  normalizeNullableFilterValue,
  resolveContextPeriodLabel,
  resolveDecisionInsight,
} from './workspaceStatisticsViewModel.helpers';

const CITY_LIST_FALLBACK_PAGE_SIZE = 10;

type UseWorkspaceStatsViewModelParams = {
  locale: Locale;
  privateOverview?: WorkspacePrivateOverviewDto | null;
  filters: WorkspaceStatisticsFilters;
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  setCityId: (next: string | null) => void;
  setCategoryKey: (next: string | null) => void;
  cityListPage: number;
  setCityListPage: (next: number) => void;
  setViewerMode: (next: WorkspaceStatisticsViewerMode) => void;
  resetFilters: () => void;
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  isLoading: boolean;
  isError: boolean;
  hasBackgroundError: boolean;
  isFetching: boolean;
  isPendingFilters: boolean;
};

export function useWorkspaceStatsViewModel({
  locale,
  privateOverview = null,
  filters,
  range,
  setRange,
  setCityId,
  setCategoryKey,
  cityListPage,
  setCityListPage,
  setViewerMode,
  resetFilters,
  data,
  isLoading,
  isError,
  hasBackgroundError,
  isFetching,
  isPendingFilters,
}: UseWorkspaceStatsViewModelParams): WorkspaceStatisticsModel {
  const copy = React.useMemo(() => getWorkspaceStatisticsCopy(locale), [locale]);
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const formatNumber = React.useMemo(() => new Intl.NumberFormat(localeTag), [localeTag]);
  const formatCurrency = React.useMemo(
    () =>
      new Intl.NumberFormat(localeTag, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [localeTag],
  );
  const mode = data?.mode ?? 'platform';
  const viewerMode = mode === 'personalized'
    ? (data?.viewerMode ?? filters.viewerMode ?? 'provider')
    : null;
  const selectedCityId = normalizeNullableFilterValue(filters.cityId);
  const selectedCategoryKey = normalizeNullableFilterValue(filters.categoryKey);
  const isFocusMode = Boolean(selectedCityId || selectedCategoryKey);

  const activityPoints = (() => {
    const points = (data?.activity.points ?? []).slice(-12);
    const comparisonPointsByTimestamp = new Map(
      (data?.activityComparison?.points ?? []).map((point) => [point.timestamp, point]),
    );
    const marketRequestsTotal = Math.max(0, Math.round(data?.activity.totals.requestsTotal ?? 0));
    const marketOffersTotal = Math.max(0, Math.round(data?.activity.totals.offersTotal ?? 0));
    const clientTotal = Math.max(
      0,
      Math.round(data?.profileFunnel.requestsTotal ?? privateOverview?.requestsByStatus.total ?? 0),
    );
    const providerTotal = Math.max(
      0,
      Math.round(data?.profileFunnel.offersTotal ?? privateOverview?.providerOffersByStatus.total ?? 0),
    );
    const canBuildClientOverlay = mode === 'personalized' && clientTotal > 0 && marketRequestsTotal > 0;
    const canBuildProviderOverlay = mode === 'personalized' && providerTotal > 0 && marketOffersTotal > 0;

    return points.map((point) => {
      const comparisonPoint = comparisonPointsByTimestamp.get(point.timestamp);
      if (comparisonPoint) {
        return {
          label: formatDateLabel(point.timestamp, range, locale),
          requests: point.requests,
          offers: point.offers,
          clientActivity: comparisonPoint.clientActivity,
          providerActivity: comparisonPoint.providerActivity,
        };
      }

      const rawClientActivity = canBuildClientOverlay
        ? (point.requests / marketRequestsTotal) * clientTotal
        : null;
      const clientActivity = rawClientActivity === null
        ? null
        : point.requests > 0
          ? Math.max(1, Math.round(rawClientActivity))
          : 0;
      const rawProviderActivity = canBuildProviderOverlay
        ? (point.offers / marketOffersTotal) * providerTotal
        : null;
      const providerActivity = rawProviderActivity === null
        ? null
        : point.offers > 0
          ? Math.max(1, Math.round(rawProviderActivity))
          : 0;

      return {
        label: formatDateLabel(point.timestamp, range, locale),
        requests: point.requests,
        offers: point.offers,
        clientActivity,
        providerActivity,
      };
    });
  })();

  const activityMetrics: WorkspaceStatisticsActivityMetricsDto = React.useMemo(
    () => data?.activity.metrics ?? DEFAULT_ACTIVITY_METRICS,
    [data?.activity.metrics],
  );

  const userIntelligence = React.useMemo<WorkspaceStatisticsUserIntelligenceView | null>(() => {
    return buildUserIntelligence({
      copy,
      source: data?.userIntelligence,
      formatCurrency,
      formatNumber,
      locale,
    });
  }, [copy, data?.userIntelligence, formatCurrency, formatNumber, locale]);

  const activitySignals: WorkspaceStatisticsActivitySignalView[] = (() => {
    if (mode === 'personalized' && data?.decisionLayer) {
      return buildDecisionLayerSignals({
        copy,
        source: data.decisionLayer,
        formatCurrency,
        formatNumber,
        locale,
      });
    }

    if (mode === 'personalized' && (userIntelligence?.formulaMetrics.length || userIntelligence?.decisionMetrics.length)) {
      const marketCompletedJobs = data?.activity.metrics.completedJobs;
      const userCompletedJobs = data?.profileFunnel.completedJobsTotal;
      const completedJobsComparison =
        typeof marketCompletedJobs === 'number' && typeof userCompletedJobs === 'number'
          ? {
            marketValue: formatNumber.format(marketCompletedJobs),
            userValue: formatNumber.format(userCompletedJobs),
            delta: `${userCompletedJobs - marketCompletedJobs > 0 ? '+' : ''}${formatNumber.format(userCompletedJobs - marketCompletedJobs)}`,
          }
          : null;

      return buildPersonalizedActivitySignals({
        copy,
        formulaMetrics: userIntelligence?.formulaMetrics ?? [],
        decisionMetrics: userIntelligence?.decisionMetrics ?? [],
        signals: userIntelligence?.signals ?? [],
        completedJobs: completedJobsComparison,
      });
    }
    return buildActivitySignals({
      activityMetrics,
      copy,
      formatCurrency,
      formatNumber,
      locale,
    });
  })();

  const activityTrend = React.useMemo(
    () => buildActivityTrend({
      copy,
      latestRequests: data?.activity.totals.latestRequests ?? 0,
      previousRequests: data?.activity.totals.previousRequests ?? 0,
    }),
    [copy, data?.activity.totals.latestRequests, data?.activity.totals.previousRequests],
  );

  const kpis = React.useMemo<WorkspaceStatisticsKpiView[]>(() => {
    return buildKpis({ copy, data, formatNumber, locale, mode, range });
  }, [copy, data, formatNumber, locale, mode, range]);

  const rawCityRows = React.useMemo<WorkspaceStatisticsCityRowView[]>(() => {
    return buildCityRows(data?.demand.cities);
  }, [data?.demand.cities]);

  const rawDemandRows = React.useMemo<WorkspaceStatisticsCategoryDemandDto[]>(() => {
    return (data?.demand.categories ?? []).slice();
  }, [data?.demand.categories]);

  const cityOptions = React.useMemo(
    () =>
      ensureSelectedFilterOption({
        options: data?.filterOptions.cities ?? [],
        selectedValue: selectedCityId,
        selectedLabel: data?.decisionContext.city.label,
      }),
    [data?.decisionContext, data?.filterOptions.cities, selectedCityId],
  );

  const categoryOptions = React.useMemo(
    () =>
      ensureSelectedFilterOption({
        options: data?.filterOptions.categories ?? [],
        selectedValue: selectedCategoryKey,
        selectedLabel: data?.decisionContext.category.label,
      }),
    [data?.decisionContext, data?.filterOptions.categories, selectedCategoryKey],
  );

  const selectedCityOption = React.useMemo(
    () => cityOptions.find((item) => item.value === selectedCityId) ?? null,
    [cityOptions, selectedCityId],
  );
  const selectedCategoryOption = React.useMemo(
    () => categoryOptions.find((item) => item.value === selectedCategoryKey) ?? null,
    [categoryOptions, selectedCategoryKey],
  );

  const cityRows = React.useMemo<WorkspaceStatisticsCityRowView[]>(() => {
    return rawCityRows;
  }, [rawCityRows]);
  const demandCityList = data?.demand.cityList;
  const cityListPagination = React.useMemo(() => {
    if (demandCityList) {
      const rows = buildCityRows(demandCityList.items);
      return {
        rows,
        limit: demandCityList.limit,
        totalItems: demandCityList.totalItems,
        totalPages: demandCityList.totalPages,
      };
    }

    const paginated = paginateItems(rawCityRows, cityListPage, CITY_LIST_FALLBACK_PAGE_SIZE);
    return {
      rows: paginated.visibleItems,
      limit: CITY_LIST_FALLBACK_PAGE_SIZE,
      totalItems: rawCityRows.length,
      totalPages: paginated.totalPages,
    };
  }, [cityListPage, demandCityList, rawCityRows]);
  const cityListRows = cityListPagination.rows;
  const cityListLimit = cityListPagination.limit;
  const cityListTotalItems = cityListPagination.totalItems;
  const cityListTotalPages = cityListPagination.totalPages;

  const demandRows = React.useMemo<WorkspaceStatisticsCategoryDemandDto[]>(() => {
    return rawDemandRows;
  }, [rawDemandRows]);

  const opportunityRadar = React.useMemo<WorkspaceStatisticsOpportunityRadarItemView[]>(() => {
    return buildOpportunityRadar({
      copy,
      locale,
      localeTag,
      formatCurrency,
      source: data?.opportunityRadar,
    });
  }, [copy, data?.opportunityRadar, formatCurrency, locale, localeTag]);

  const priceIntelligence = React.useMemo<WorkspaceStatisticsPriceIntelligenceView>(() => {
    const contextCityFallback = data?.decisionContext.city.label ?? selectedCityOption?.label ?? null;
    const contextCategoryFallback = data?.decisionContext.category.label ?? selectedCategoryOption?.label ?? null;
    return buildPriceIntelligence({
      copy,
      source: data?.priceIntelligence,
      contextCityFallback,
      contextCategoryFallback,
      locale,
      localeTag,
      formatCurrency,
    });
  }, [
    copy,
    data?.priceIntelligence,
    data?.decisionContext.category.label,
    data?.decisionContext.city.label,
    formatCurrency,
    locale,
    localeTag,
    selectedCategoryOption,
    selectedCityOption,
  ]);

  const personalizedPricing = React.useMemo(
    () => buildPersonalizedPricingSection({
      copy,
      source: data?.personalizedPricing,
      formatCurrency,
    }),
    [copy, data?.personalizedPricing, formatCurrency],
  );

  const categoryFit = React.useMemo(
    () => buildCategoryFit({
      copy,
      source: data?.categoryFit,
      formatNumber,
    }),
    [copy, data?.categoryFit, formatNumber],
  );

  const cityComparison = React.useMemo(
    () => buildCityComparison({
      copy,
      source: data?.cityComparison,
      formatNumber,
    }),
    [copy, data?.cityComparison, formatNumber],
  );
  const rightRailRisks = React.useMemo(
    () => buildRecommendationPrioritySection({
      copy,
      locale,
      source: data?.risks,
      fallbackTitle: copy.userRisksTitle,
      fallbackSubtitle: copy.userRisksSubtitle,
      fallbackItems: userIntelligence?.risks ?? [],
    }),
    [copy, data?.risks, locale, userIntelligence?.risks],
  );
  const rightRailOpportunities = React.useMemo(
    () => buildRecommendationPrioritySection({
      copy,
      locale,
      source: data?.opportunities,
      fallbackTitle: copy.userOpportunitiesTitle,
      fallbackSubtitle: copy.userOpportunitiesSubtitle,
      fallbackItems: userIntelligence?.opportunities ?? [],
    }),
    [copy, data?.opportunities, locale, userIntelligence?.opportunities],
  );
  const rightRailNextSteps = React.useMemo(
    () => buildRecommendationActionSection({
      copy,
      locale,
      source: data?.nextSteps,
      fallbackTitle: copy.userActionsTitle,
      fallbackSubtitle: copy.userActionsSubtitle,
      fallbackSteps: userIntelligence?.nextSteps ?? [],
    }),
    [copy, data?.nextSteps, locale, userIntelligence?.nextSteps],
  );

  const funnel = React.useMemo<WorkspaceStatisticsFunnelItemView[]>(() => {
    return buildFunnel(data);
  }, [data]);
  const funnelComparison = React.useMemo(
    () => buildFunnelComparison({ data, copy, formatNumber }),
    [copy, data, formatNumber],
  );
  const funnelDropoff = React.useMemo(
    () => buildFunnelDropoff({ copy, data, funnel }),
    [copy, data, funnel],
  );

  const hasFunnelData = React.useMemo(() => {
    if (!funnel.length) return false;
    const hasStageVolume = funnel.some((item) => !item.isCurrency && item.count > 0);
    if (hasStageVolume) return true;
    return Number(data?.profileFunnel.profitAmount ?? 0) > 0;
  }, [data?.profileFunnel.profitAmount, funnel]);

  const funnelPeriodLabel = React.useMemo(
    () => String(data?.profileFunnel.periodLabel ?? '').trim() || '',
    [data?.profileFunnel.periodLabel],
  );

  const contextPeriodLabel = React.useMemo(() => {
    return resolveContextPeriodLabel({
      copy,
      decisionContextPeriod: data?.decisionContext.period,
      range,
    });
  }, [copy, data?.decisionContext.period, range]);

  const contextCityLabel = data?.decisionContext.city.label ?? selectedCityOption?.label ?? copy.contextAllCitiesLabel;
  const contextCategoryLabel = data?.decisionContext.category.label ?? selectedCategoryOption?.label ?? copy.contextAllCategoriesLabel;
  const contextScopeLabel = (data?.decisionContext.mode ?? (isFocusMode ? 'focus' : 'global')) === 'focus'
    ? copy.contextScopeFocusLabel
    : copy.contextScopeGlobalLabel;
  const isLowDataContext = Boolean(data?.decisionContext.lowData?.isLowData);

  const contextHealthMetrics = React.useMemo<WorkspaceStatisticsContextMetricView[]>(() => {
    return buildContextHealthMetrics({
      copy,
      source: data?.decisionContext.health,
    });
  }, [
    copy,
    data?.decisionContext.health,
  ]);

  const insights = React.useMemo<WorkspaceStatisticsInsightView[]>(
    () => {
      return buildInsights({
        copy,
        data,
        contextCategoryLabel,
        contextCityLabel,
        contextPeriodLabel,
        contextScopeLabel,
        formatNumber,
        isLowDataContext,
        locale,
      });
    },
    [
      contextCategoryLabel,
      contextCityLabel,
      contextPeriodLabel,
      contextScopeLabel,
      copy,
      data,
      formatNumber,
      isLowDataContext,
      locale,
    ],
  );

  const decisionInsight = React.useMemo(() => {
    const personalizedInsight = data?.decisionLayer?.primaryInsight?.trim();
    if (mode === 'personalized' && personalizedInsight) {
      return personalizedInsight;
    }
    return resolveDecisionInsight({
      copy,
      data,
      isLowDataContext,
    });
  }, [copy, data, isLowDataContext, mode]);

  const decisionActionLabel = React.useMemo(
    () => {
      const code = data?.decisionLayer?.primaryAction?.code;
      if (code === 'respond_faster') return copy.userActionRespondTitle;
      if (code === 'adjust_price') return copy.userActionPriceTitle;
      if (code === 'focus_market') return copy.userActionFocusTitle;
      if (code === 'complete_profile') return copy.userActionProfileTitle;
      if (code === 'follow_up_unanswered' || code === 'follow_up_requests') return copy.userActionFollowUpTitle;
      return data?.decisionLayer?.primaryAction?.label?.trim() || null;
    },
    [copy, data?.decisionLayer?.primaryAction?.code, data?.decisionLayer?.primaryAction?.label],
  );
  const decisionLayerSubtitle = React.useMemo(
    () => data?.decisionLayer?.subtitle?.trim() || null,
    [data?.decisionLayer?.subtitle],
  );

  const growthCards = React.useMemo<WorkspaceStatisticsGrowthCardView[]>(
    () => {
      return buildGrowthCards({
        copy,
        source: data?.growthCards,
      });
    },
    [copy, data?.growthCards],
  );

  const onExport = React.useCallback(() => {
    exportWorkspaceStatisticsCsv({
      activitySignals,
      cityRows,
      data,
      funnel,
      kpis,
      range,
    });
  }, [activitySignals, cityRows, data, funnel, kpis, range]);

  const activityTitle = data?.activityComparison
    ? data.activityComparison.title ?? copy.activityTitle
    : copy.activityTitle;

  const activitySubtitle = data?.activityComparison
    ? data.activityComparison.subtitle ?? copy.activitySubtitle
    : copy.activitySubtitle;

  const activitySummary = data?.activityComparison ? data.activityComparison.summary ?? null : null;

  const activityMeta = {
    peak: formatDateTimeLabel(
      data?.activityComparison ? data.activityComparison.peakTimestamp ?? null : data?.activity.totals.peakTimestamp,
      locale,
    ),
    bestWindow: formatDateTimeLabel(
      data?.activityComparison
        ? data.activityComparison.bestWindowTimestamp ?? null
        : data?.activity.totals.bestWindowTimestamp,
      locale,
    ),
    updatedAt: formatDateTimeLabel(
      data?.activityComparison ? data.activityComparison.updatedAt ?? null : data?.updatedAt,
      locale,
    ),
  };

  const context = React.useMemo(() => {
    return buildContext({
      copy,
      data,
      contextCategoryLabel,
      contextCityLabel,
      contextHealthMetrics,
      contextPeriodLabel,
      contextScopeLabel,
      isFocusMode,
      isLowDataContext,
    });
  }, [
    copy,
    data,
    contextCityLabel,
    contextHealthMetrics,
    contextPeriodLabel,
    contextScopeLabel,
    contextCategoryLabel,
    isFocusMode,
    isLowDataContext,
  ]);

  const sectionMeta = React.useMemo(
    () => buildSectionMeta(data),
    [data],
  );

  return {
    copy,
    filters,
    range,
    setRange,
    setCityId,
    setCategoryKey,
    cityListPage,
    setCityListPage,
    viewerMode,
    setViewerMode,
    resetFilters,
    isLoading: isLoading && !data,
    isError: isError && !data,
    hasBackgroundError,
    isUpdating: isPendingFilters || isFetching,
    mode,
    modeLabel: mode === 'personalized' ? copy.modePersonalized : copy.modePlatform,
    cityOptions,
    categoryOptions,
    context,
    sectionMeta,
    kpis,
    activityTitle,
    activitySubtitle,
    activitySummary,
    activityPoints,
    activityMeta,
    activityTrend,
    decisionLayerSubtitle,
    decisionInsight,
    decisionActionLabel,
    activitySignals,
    demandRows,
    cityRows,
    cityListRows,
    cityListLimit,
    cityListTotalItems,
    cityListTotalPages,
    opportunityRadar,
    priceIntelligence,
    personalizedPricing,
    categoryFit,
    cityComparison,
    rightRailRisks,
    rightRailOpportunities,
    rightRailNextSteps,
    funnel,
    funnelComparison,
    funnelPeriodLabel,
    funnelSummary: buildFunnelSummary({
      copy,
      data,
      funnel,
      funnelComparison,
      formatNumber,
    }),
    hasFunnelData,
    funnelDropoff,
    conversion: buildFunnelConversion({
      data,
      funnelComparison,
    }),
    insights,
    growthCards,
    userIntelligence,
    onExport,
  };
}
