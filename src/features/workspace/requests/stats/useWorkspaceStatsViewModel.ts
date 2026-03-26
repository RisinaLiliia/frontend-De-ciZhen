'use client';

import * as React from 'react';

import type {
  WorkspaceStatisticsActivityMetricsDto,
  WorkspaceStatisticsCategoryDemandDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import { getWorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import {
  formatDateLabel,
  formatDateTimeLabel,
  formatPercent,
} from './statisticsModel.mappers';
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
} from './workspaceStatistics.model';
import {
  buildActivitySignals,
  buildActivityTrend,
  buildCityRows,
  buildContext,
  buildContextHealthMetrics,
  buildFunnel,
  buildFunnelDropoff,
  buildGrowthCards,
  buildInsights,
  buildKpis,
  buildOpportunityRadar,
  buildPriceIntelligence,
  buildSectionMeta,
  DEFAULT_ACTIVITY_METRICS,
  ensureSelectedFilterOption,
  exportWorkspaceStatisticsCsv,
  normalizeNullableFilterValue,
  resolveContextPeriodLabel,
  resolveDecisionInsight,
} from './workspaceStatisticsViewModel.helpers';

type UseWorkspaceStatsViewModelParams = {
  locale: Locale;
  filters: WorkspaceStatisticsFilters;
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  setCityId: (next: string | null) => void;
  setCategoryKey: (next: string | null) => void;
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
  filters,
  range,
  setRange,
  setCityId,
  setCategoryKey,
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
  const selectedCityId = normalizeNullableFilterValue(filters.cityId);
  const selectedCategoryKey = normalizeNullableFilterValue(filters.categoryKey);
  const isFocusMode = Boolean(selectedCityId || selectedCategoryKey);

  const activityPoints = React.useMemo(
    () =>
      (data?.activity.points ?? []).slice(-12).map((point) => ({
        label: formatDateLabel(point.timestamp, range, locale),
        requests: point.requests,
        offers: point.offers,
      })),
    [data?.activity.points, locale, range],
  );

  const activityMetrics: WorkspaceStatisticsActivityMetricsDto = React.useMemo(
    () => data?.activity.metrics ?? DEFAULT_ACTIVITY_METRICS,
    [data?.activity.metrics],
  );

  const activitySignals = React.useMemo<WorkspaceStatisticsActivitySignalView[]>(() => {
    return buildActivitySignals({
      activityMetrics,
      copy,
      formatCurrency,
      formatNumber,
      locale,
    });
  }, [activityMetrics, copy, formatCurrency, formatNumber, locale]);

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

  const funnel = React.useMemo<WorkspaceStatisticsFunnelItemView[]>(() => {
    return buildFunnel(data);
  }, [data]);
  const funnelDropoff = React.useMemo(
    () => buildFunnelDropoff({ copy, funnel }),
    [copy, funnel],
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
    return resolveDecisionInsight({
      copy,
      data,
      isLowDataContext,
    });
  }, [copy, data, isLowDataContext]);

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

  const activityMeta = React.useMemo(
    () => ({
      peak: formatDateTimeLabel(data?.activity.totals.peakTimestamp, locale),
      bestWindow: formatDateTimeLabel(data?.activity.totals.bestWindowTimestamp, locale),
      updatedAt: formatDateTimeLabel(data?.updatedAt, locale),
    }),
    [data?.activity.totals.bestWindowTimestamp, data?.activity.totals.peakTimestamp, data?.updatedAt, locale],
  );

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
    activityPoints,
    activityMeta,
    activityTrend,
    decisionInsight,
    activitySignals,
    demandRows,
    cityRows,
    opportunityRadar,
    priceIntelligence,
    funnel,
    funnelPeriodLabel,
    funnelSummary:
      String(data?.profileFunnel.summaryText ?? '').trim() ||
      `${copy.funnelSummaryPrefix} ${funnel.find((item) => item.key === 'requests')?.value ?? '0'} ${copy.funnelSummaryMiddle} ${funnel.find((item) => item.key === 'completed')?.value ?? '0'} ${copy.funnelSummarySuffix}`,
    hasFunnelData,
    funnelDropoff,
    conversion: formatPercent(
      Number.isFinite(data?.profileFunnel.totalConversionPercent)
        ? Number(data?.profileFunnel.totalConversionPercent)
        : Number.isFinite(data?.profileFunnel.conversionRate)
          ? Number(data?.profileFunnel.conversionRate)
        : 0,
    ),
    insights,
    growthCards,
    onExport,
  };
}
