import type {
  WorkspaceStatisticsContextHealthDto,
  WorkspaceStatisticsGrowthCardDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import {
  getWorkspaceStatisticsCopy,
  resolveGrowthCard,
  resolveInsightText,
  type WorkspaceStatisticsCopy,
} from './workspaceStatistics.copy';
import { inferInsightType } from './statisticsInsights.utils';
import { formatInsightEvidence } from './statisticsModel.mappers';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type {
  WorkspaceStatisticsContextMetricView,
  WorkspaceStatisticsGrowthCardView,
  WorkspaceStatisticsInsightView,
  WorkspaceStatisticsModel,
} from './workspaceStatistics.model';

export function normalizeNullableFilterValue(value: string | null | undefined): string | null {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : null;
}

export function ensureSelectedFilterOption(params: {
  options: Array<{ value: string; label: string }>;
  selectedValue: string | null;
  selectedLabel: string | null | undefined;
}) {
  const { options, selectedValue, selectedLabel } = params;
  if (!selectedValue) return options.slice();
  if (options.some((item) => item.value === selectedValue)) return options.slice();

  const normalizedLabel = String(selectedLabel ?? '').trim();
  if (normalizedLabel.length === 0) return options.slice();

  return [
    { value: selectedValue, label: normalizedLabel },
    ...options,
  ];
}

function resolveHealthMetricValue(
  metric: WorkspaceStatisticsContextHealthDto,
  copy: ReturnType<typeof getWorkspaceStatisticsCopy>,
) {
  if (metric.key === 'demand') {
    if (metric.value === 'rising') return copy.contextHealthDemandRising;
    if (metric.value === 'stable') return copy.contextHealthDemandStable;
    return copy.contextHealthDemandLimited;
  }

  if (metric.key === 'competition') {
    if (metric.value === 'low') return copy.contextHealthCompetitionLow;
    if (metric.value === 'high') return copy.contextHealthCompetitionHigh;
    return copy.contextHealthCompetitionBalanced;
  }

  if (metric.value === 'high') return copy.contextHealthActivityHigh;
  if (metric.value === 'low') return copy.contextHealthActivityLow;
  return copy.contextHealthActivityStable;
}

export function resolveContextPeriodLabel(params: {
  copy: WorkspaceStatisticsCopy;
  decisionContextPeriod: WorkspaceStatisticsDecisionDashboardDto['decisionContext']['period'] | undefined;
  range: WorkspaceStatisticsRange;
}) {
  const { copy, decisionContextPeriod, range } = params;
  const selectedPeriod = decisionContextPeriod ?? range;
  if (selectedPeriod === '24h') return copy.range24h;
  if (selectedPeriod === '7d') return copy.range7d;
  if (selectedPeriod === '30d') return copy.range30d;
  return copy.range90d;
}

export function buildContextHealthMetrics(params: {
  copy: WorkspaceStatisticsCopy;
  source: WorkspaceStatisticsContextHealthDto[] | undefined;
}): WorkspaceStatisticsContextMetricView[] {
  const { copy, source } = params;
  return (source ?? []).map((metric) => ({
    key: metric.key,
    label:
      metric.key === 'demand'
        ? copy.contextHealthDemandLabel
        : metric.key === 'competition'
          ? copy.contextHealthCompetitionLabel
          : copy.contextHealthActivityLabel,
    value: resolveHealthMetricValue(metric, copy),
    tone: metric.tone,
  }));
}

export function buildInsights(params: {
  copy: WorkspaceStatisticsCopy;
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  contextCategoryLabel: string;
  contextCityLabel: string;
  contextPeriodLabel: string;
  contextScopeLabel: string;
  formatNumber: Intl.NumberFormat;
  isLowDataContext: boolean;
  locale: Locale;
}): WorkspaceStatisticsInsightView[] {
  const {
    copy,
    data,
    contextCategoryLabel,
    contextCityLabel,
    contextPeriodLabel,
    contextScopeLabel,
    formatNumber,
    isLowDataContext,
    locale,
  } = params;

  if (isLowDataContext) {
    return [{
      key: 'context-low-data',
      level: 'warning',
      kind: 'risk',
      code: 'focus_low_data',
      context: `${contextCityLabel} · ${contextCategoryLabel}`,
      title: data?.decisionContext.lowData?.title ?? copy.contextLowDataTitle,
      text: data?.decisionContext.lowData?.body ?? copy.contextLowDataBody,
      evidence: `${contextPeriodLabel} · ${contextScopeLabel}`,
    }];
  }

  if (!data) return [];
  return (data.insights ?? []).map((item, index) => ({
    key: item.id ?? `${item.code}-${index}`,
    level: item.level,
    kind: inferInsightType(item),
    code: item.code,
    priority: item.priority,
    score: item.score,
    metrics: item.metrics,
    context: item.context,
    title: (item.title ?? '').trim() || undefined,
    text: resolveInsightText(copy, item),
    evidence: formatInsightEvidence(item.metrics, locale, formatNumber),
  }));
}

export function resolveDecisionInsight(params: {
  copy: WorkspaceStatisticsCopy;
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  isLowDataContext: boolean;
}) {
  const { copy, data, isLowDataContext } = params;
  if (isLowDataContext) return copy.contextLowDataBody;

  const backendDecisionInsight =
    typeof data?.decisionInsight === 'string' ? data.decisionInsight.trim() : '';
  if (backendDecisionInsight.length > 0) return backendDecisionInsight;

  return copy.decisionKiFallbackInsight;
}

export function buildGrowthCards(params: {
  copy: WorkspaceStatisticsCopy;
  source: WorkspaceStatisticsGrowthCardDto[] | undefined;
}): WorkspaceStatisticsGrowthCardView[] {
  const { copy, source } = params;
  return (source ?? []).map((card) => {
    const resolved = resolveGrowthCard(copy, card);
    return {
      key: card.key,
      title: card.title ?? resolved.title,
      body: card.body ?? resolved.body,
      benefit: card.benefit ?? resolved.benefit,
      tone: card.tone ?? resolved.tone,
      badge: card.badge ?? resolved.badge,
      recommendedFor: card.recommendedFor,
      href: resolved.href,
    };
  });
}

export function buildContext(params: {
  copy: WorkspaceStatisticsCopy;
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  contextCategoryLabel: string;
  contextCityLabel: string;
  contextHealthMetrics: WorkspaceStatisticsContextMetricView[];
  contextPeriodLabel: string;
  contextScopeLabel: string;
  isFocusMode: boolean;
  isLowDataContext: boolean;
}): WorkspaceStatisticsModel['context'] {
  const {
    copy,
    data,
    contextCategoryLabel,
    contextCityLabel,
    contextHealthMetrics,
    contextPeriodLabel,
    contextScopeLabel,
    isFocusMode,
    isLowDataContext,
  } = params;

  const stickyLabel =
    data?.decisionContext.stickyLabel?.trim()
    || `${contextPeriodLabel} · ${contextCityLabel} · ${contextCategoryLabel}`;
  const mode = data?.decisionContext.mode ?? (isFocusMode ? 'focus' : 'global');
  const title = data?.decisionContext.title?.trim()
    || (mode === 'focus'
      ? `${copy.contextScopeFocusLabel}: ${contextCityLabel} · ${contextCategoryLabel}`
      : copy.contextScopeGlobalLabel);
  const subtitle = isLowDataContext
    ? (data?.decisionContext.lowData?.body ?? copy.contextLowDataBody)
    : (data?.decisionContext.subtitle?.trim() || copy.contextSubtitle);

  return {
    mode,
    periodLabel: contextPeriodLabel,
    cityLabel: contextCityLabel,
    categoryLabel: contextCategoryLabel,
    scopeLabel: contextScopeLabel,
    stickyLabel,
    title,
    subtitle,
    healthMetrics: contextHealthMetrics,
    isLowData: isLowDataContext,
    lowDataTitle: isLowDataContext ? (data?.decisionContext.lowData?.title ?? copy.contextLowDataTitle) : null,
    lowDataBody: isLowDataContext ? (data?.decisionContext.lowData?.body ?? copy.contextLowDataBody) : null,
  };
}

export function buildSectionMeta(
  data: WorkspaceStatisticsDecisionDashboardDto | undefined,
): WorkspaceStatisticsModel['sectionMeta'] {
  return {
    decisionSubtitle: data?.sectionMeta.decisionSubtitle ?? null,
    demandSubtitle: data?.sectionMeta.demandSubtitle ?? null,
    citiesSubtitle: data?.sectionMeta.citiesSubtitle ?? null,
    opportunityTitle: data?.sectionMeta.opportunityTitle ?? null,
    priceTitle: data?.sectionMeta.priceTitle ?? null,
    insightsSubtitle: data?.sectionMeta.insightsSubtitle ?? null,
    growthSubtitle: data?.sectionMeta.growthSubtitle ?? null,
  };
}
