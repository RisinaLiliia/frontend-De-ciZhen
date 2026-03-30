import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type {
  WorkspaceStatisticsActionSectionView,
  WorkspaceStatisticsActionStepView,
  WorkspaceStatisticsActivitySignalView,
  WorkspaceStatisticsBenchmarkMetricView,
  WorkspaceStatisticsCategoryFitItemView,
  WorkspaceStatisticsCityComparisonItemView,
  WorkspaceStatisticsDecisionSignalView,
  WorkspaceStatisticsPersonalizedPricingView,
  WorkspaceStatisticsPricingGapView,
  WorkspaceStatisticsPriorityItemView,
  WorkspaceStatisticsPrioritySectionView,
  WorkspaceStatisticsProfileGapView,
  WorkspaceStatisticsUserIntelligenceView,
} from './workspaceStatistics.model';

type UserIntelligenceSource = NonNullable<WorkspaceStatisticsDecisionDashboardDto['userIntelligence']>;

function formatMetricValue(params: {
  value: number | null;
  unit: 'percent' | 'minutes' | 'count';
  formatNumber: Intl.NumberFormat;
  locale: Locale;
}) {
  const { value, unit, formatNumber, locale } = params;
  if (value === null || !Number.isFinite(value)) return '—';
  if (unit === 'percent') return `${Math.round(value)}%`;
  if (unit === 'minutes') return locale === 'de' ? `${Math.round(value)} Min.` : `${Math.round(value)} min`;
  return formatNumber.format(Math.round(value));
}

function formatDelta(params: {
  userValue: number | null;
  marketValue: number | null;
  unit: 'percent' | 'minutes' | 'count';
  formatNumber: Intl.NumberFormat;
  locale: Locale;
}) {
  const { userValue, marketValue, unit, formatNumber, locale } = params;
  if (userValue === null || marketValue === null) return '—';
  const delta = userValue - marketValue;
  if (Math.abs(delta) < 0.01) return locale === 'de' ? 'Auf Marktniveau' : 'At market level';
  if (unit === 'percent') return `${delta > 0 ? '+' : ''}${Math.round(delta)} pp`;
  if (unit === 'minutes') return `${delta > 0 ? '+' : ''}${Math.round(delta)} ${locale === 'de' ? 'Min.' : 'min'}`;
  return `${delta > 0 ? '+' : ''}${formatNumber.format(Math.round(delta))}`;
}

function formatCurrencyMetric(value: number | null, formatCurrency: Intl.NumberFormat) {
  if (value === null || !Number.isFinite(value)) return '—';
  return formatCurrency.format(value);
}

function formatCurrencyDelta(params: {
  userValue: number | null;
  marketValue: number | null;
  formatCurrency: Intl.NumberFormat;
  locale: Locale;
}) {
  const { userValue, marketValue, formatCurrency, locale } = params;
  if (userValue === null || marketValue === null) return '—';
  const delta = userValue - marketValue;
  if (Math.abs(delta) < 0.01) return locale === 'de' ? 'Auf Marktniveau' : 'At market level';
  const absLabel = formatCurrency.format(Math.abs(delta));
  return delta > 0 ? `+${absLabel}` : `-${absLabel}`;
}

function resolveComparisonLabel(copy: WorkspaceStatisticsCopy, key: string) {
  if (key === 'offer_rate') return copy.activityOfferRateLabel;
  if (key === 'avg_response_time') return copy.activityResponseMedianLabel;
  if (key === 'cancellation_rate') return copy.activityCancellationLabel;
  if (key === 'avg_order_value') return copy.activityAverageOrderValueLabel;
  if (key === 'revenue') return copy.activityRevenueLabel;
  if (key === 'conversion_rate') return copy.conversionLabel;
  if (key === 'response_rate') return copy.stage3LabelPersonalized;
  if (key === 'response_time') return copy.activityResponseMedianLabel;
  return copy.activityUnansweredLabel;
}

function resolveStatusLabel(copy: WorkspaceStatisticsCopy, status: 'high' | 'medium' | 'low' | null) {
  if (status === 'high') return copy.userRiskSeverityHigh;
  if (status === 'medium') return copy.userRiskSeverityMedium;
  if (status === 'low') return copy.userRiskSeverityLow;
  return null;
}

function resolvePositionHeadline(copy: WorkspaceStatisticsCopy, percentile: number | null, bucket: 'top' | 'average' | 'below') {
  if (bucket === 'top') {
    const topShare = percentile === null ? 30 : Math.max(5, 100 - Math.round(percentile));
    return `${copy.userPositionTopPrefix} ${topShare}% ${copy.userPositionTopSuffix}`;
  }
  if (bucket === 'below') return copy.userPositionBelowLabel;
  return copy.userPositionAverageLabel;
}

function resolvePositionSummary(copy: WorkspaceStatisticsCopy, percentile: number | null) {
  if (percentile === null) return copy.userPositionSummaryFallback;
  return copy.userPositionSummaryTemplate.replace('{percentile}', String(Math.round(percentile)));
}

function resolveRiskItem(
  copy: WorkspaceStatisticsCopy,
  item: UserIntelligenceSource['risks'][number],
  formatCurrency: Intl.NumberFormat,
): WorkspaceStatisticsPriorityItemView {
  if (item.code === 'slow_response') {
    return {
      key: item.id,
      title: copy.userRiskSlowResponseTitle,
      body: copy.userRiskSlowResponseBody
        .replace('{user}', String(Math.round(item.value ?? 0)))
        .replace('{market}', String(Math.round(item.secondaryValue ?? 0))),
      metric: item.value !== null && item.value !== undefined ? `${Math.round(item.value)} Min.` : null,
      tone: 'warning',
    };
  }
  if (item.code === 'high_unanswered') {
    return {
      key: item.id,
      title: copy.userRiskUnansweredTitle,
      body: copy.userRiskUnansweredBody.replace('{count}', String(Math.round(item.value ?? 0))),
      metric: item.value !== null && item.value !== undefined ? `${Math.round(item.value)}` : null,
      tone: 'warning',
    };
  }
  if (item.code === 'price_above_market') {
    return {
      key: item.id,
      title: copy.userActionPriceTitle,
      body: copy.userPricingEffectAbove,
      metric: item.value !== null && item.value !== undefined ? formatCurrency.format(item.value) : null,
      tone: 'warning',
    };
  }
  return {
    key: item.id,
    title: copy.userRiskVisibilityTitle,
    body: copy.userRiskVisibilityBody.replace('{profile}', String(Math.round(item.value ?? 0))),
    metric: item.value !== null && item.value !== undefined ? `${Math.round(item.value)}%` : null,
    tone: 'neutral',
  };
}

function resolveOpportunityItem(
  copy: WorkspaceStatisticsCopy,
  item: UserIntelligenceSource['opportunities'][number],
  formatNumber: Intl.NumberFormat,
  formatCurrency: Intl.NumberFormat,
): WorkspaceStatisticsPriorityItemView {
  if (item.code === 'high_demand_city') {
    return {
      key: item.id,
      title: copy.userOpportunityDemandTitle,
      body: copy.userOpportunityDemandBody
        .replace('{city}', item.cityLabel ?? copy.contextAllCitiesLabel)
        .replace('{category}', item.categoryLabel ?? copy.contextAllCategoriesLabel),
      metric: item.value !== null && item.value !== undefined ? formatNumber.format(Math.round(item.value)) : null,
      tone: 'positive',
      cityLabel: item.cityLabel ?? null,
      categoryLabel: item.categoryLabel ?? null,
    };
  }
  if (item.code === 'low_competition_segment') {
    return {
      key: item.id,
      title: copy.userOpportunityCompetitionTitle,
      body: copy.userOpportunityCompetitionBody
        .replace('{city}', item.cityLabel ?? copy.contextAllCitiesLabel)
        .replace('{category}', item.categoryLabel ?? copy.contextAllCategoriesLabel),
      metric: item.secondaryValue !== null && item.secondaryValue !== undefined ? `${item.secondaryValue.toFixed(1)}x` : null,
      tone: 'positive',
      cityLabel: item.cityLabel ?? null,
      categoryLabel: item.categoryLabel ?? null,
    };
  }
  if (item.code === 'price_below_market') {
    return {
      key: item.id,
      title: copy.userActionPriceTitle,
      body: copy.userPricingEffectBelow,
      metric: item.value !== null && item.value !== undefined ? formatCurrency.format(item.value) : null,
      tone: 'positive',
      cityLabel: item.cityLabel ?? null,
      categoryLabel: item.categoryLabel ?? null,
    };
  }
  if (item.code === 'strong_position') {
    return {
      key: item.id,
      title: copy.userPositionTitle,
      body: copy.userPositionSummaryTemplate.replace('{percentile}', String(Math.round(item.value ?? 0))),
      metric: item.value !== null && item.value !== undefined ? `${Math.round(item.value)}%` : null,
      tone: 'positive',
      cityLabel: item.cityLabel ?? null,
      categoryLabel: item.categoryLabel ?? null,
    };
  }
  return {
    key: item.id,
    title: copy.userOpportunityCategoryTitle,
    body: copy.userOpportunityCategoryBody.replace('{category}', item.categoryLabel ?? copy.contextAllCategoriesLabel),
    metric: item.secondaryValue !== null && item.secondaryValue !== undefined ? `${Math.round(item.secondaryValue)}%` : null,
    tone: 'positive',
    cityLabel: item.cityLabel ?? null,
    categoryLabel: item.categoryLabel ?? null,
  };
}

function resolveActionStep(copy: WorkspaceStatisticsCopy, item: UserIntelligenceSource['nextSteps'][number]): WorkspaceStatisticsActionStepView {
  const priorityTone = item.priority === 'high' ? 'warning' : item.priority === 'medium' ? 'info' : 'success';
  const priorityLabel = item.priority === 'high'
    ? copy.userActionPriorityHigh
    : item.priority === 'medium'
      ? copy.userActionPriorityMedium
      : copy.userActionPriorityLow;
  const impactLabel = item.priority === 'high'
    ? copy.userActionImpactHigh
    : item.priority === 'medium'
      ? copy.userActionImpactMedium
      : copy.userActionImpactLow;

  if (item.code === 'respond_faster') {
    return {
      key: item.id,
      code: item.code,
      title: copy.userActionRespondTitle,
      detail: copy.userActionRespondDetail.replace('{target}', String(Math.round(item.targetValue ?? 120))),
      priorityLabel,
      priorityTone,
      impactLabel,
      effectLabel: copy.userActionRespondEffect,
    };
  }
  if (item.code === 'adjust_price') {
    return {
      key: item.id,
      code: item.code,
      title: copy.userActionPriceTitle,
      detail: copy.userActionPriceDetail.replace('{price}', item.targetValue ? String(Math.round(item.targetValue)) : '—'),
      priorityLabel,
      priorityTone,
      impactLabel,
      effectLabel: copy.userActionPriceEffect,
    };
  }
  if (item.code === 'focus_market') {
    return {
      key: item.id,
      code: item.code,
      title: copy.userActionFocusTitle,
      detail: copy.userActionFocusDetail
        .replace('{city}', item.cityLabel ?? copy.contextAllCitiesLabel)
        .replace('{category}', item.categoryLabel ?? copy.contextAllCategoriesLabel),
      priorityLabel,
      priorityTone,
      impactLabel,
      effectLabel: copy.userActionFocusEffect,
    };
  }
  if (item.code === 'complete_profile') {
    return {
      key: item.id,
      code: item.code,
      title: copy.userActionProfileTitle,
      detail: copy.userActionProfileDetail.replace('{target}', String(Math.round(item.targetValue ?? 90))),
      priorityLabel,
      priorityTone,
      impactLabel,
      effectLabel: copy.userActionProfileEffect,
    };
  }
  return {
    key: item.id,
    code: item.code,
    title: copy.userActionFollowUpTitle,
    detail: copy.userActionFollowUpDetail.replace('{count}', String(Math.round(item.targetValue ?? 0))),
    priorityLabel,
    priorityTone,
    impactLabel,
    effectLabel: copy.userActionFollowUpEffect,
  };
}

function resolveSignalActionLabel(copy: WorkspaceStatisticsCopy, signal: UserIntelligenceSource['signals'][number]): string | null {
  if (signal.actionCode === 'respond_faster') return copy.userActionRespondTitle;
  if (signal.actionCode === 'adjust_price') return copy.userActionPriceTitle;
  if (signal.actionCode === 'focus_market') return copy.userActionFocusTitle;
  if (signal.actionCode === 'complete_profile') return copy.userActionProfileTitle;
  if (signal.actionCode === 'follow_up_unanswered' || signal.actionCode === 'follow_up_requests') {
    return copy.userActionFollowUpTitle;
  }
  return null;
}

function resolveActionCodeLabel(copy: WorkspaceStatisticsCopy, actionCode: UserIntelligenceSource['nextSteps'][number]['code'] | null | undefined): string | null {
  if (actionCode === 'respond_faster') return copy.userActionRespondTitle;
  if (actionCode === 'adjust_price') return copy.userActionPriceTitle;
  if (actionCode === 'focus_market') return copy.userActionFocusTitle;
  if (actionCode === 'complete_profile') return copy.userActionProfileTitle;
  if (actionCode === 'follow_up_unanswered' || actionCode === 'follow_up_requests') return copy.userActionFollowUpTitle;
  return null;
}

export function buildDecisionLayerSignals(params: {
  copy: WorkspaceStatisticsCopy;
  source: WorkspaceStatisticsDecisionDashboardDto['decisionLayer'] | undefined | null;
  formatCurrency: Intl.NumberFormat;
  formatNumber: Intl.NumberFormat;
  locale: Locale;
}): WorkspaceStatisticsActivitySignalView[] {
  const { copy, source, formatCurrency, formatNumber, locale } = params;
  if (!source) return [];

  return source.metrics.map((metric) => {
    const unit = metric.unit === 'currency' ? 'currency' : metric.unit === 'minutes' ? 'minutes' : metric.unit === 'percent' ? 'percent' : 'count';
    const marketValue = unit === 'currency'
      ? formatCurrencyMetric(metric.marketValue, formatCurrency)
      : formatMetricValue({
        value: metric.marketValue,
        unit,
        formatNumber,
        locale,
      });
    const userValue = unit === 'currency'
      ? formatCurrencyMetric(metric.userValue, formatCurrency)
      : formatMetricValue({
        value: metric.userValue,
        unit,
        formatNumber,
        locale,
      });

    const gapLabel = metric.gapPercent !== null && metric.unit === 'percent'
      ? `${metric.gapPercent > 0 ? '+' : ''}${Math.round(metric.gapPercent)} pp`
      : unit === 'currency'
        ? formatCurrencyDelta({
          userValue: metric.userValue,
          marketValue: metric.marketValue,
          formatCurrency,
          locale,
        })
        : formatDelta({
          userValue: metric.userValue,
          marketValue: metric.marketValue,
          unit,
          formatNumber,
          locale,
        });
    const actionLabel = resolveActionCodeLabel(copy, metric.primaryActionCode);
    const tone: WorkspaceStatisticsActivitySignalView['tone'] = metric.status === 'good'
      ? 'positive'
      : metric.status === 'critical' || metric.status === 'warning'
        ? 'warning'
        : 'neutral';

    return {
      key: metric.id,
      label: metric.label?.trim() || (
        metric.id === 'average_order_value'
          ? copy.activityAverageOrderValueLabel
          : metric.id === 'completed_jobs'
            ? copy.activityCompletedLabel
            : metric.id === 'unanswered_over_24h'
              ? copy.activityUnansweredLabel
              : metric.id === 'avg_response_time'
                ? copy.activityResponseMedianLabel
                : metric.id === 'revenue'
                  ? copy.activityRevenueLabel
                  : copy.activityOfferRateLabel
      ),
      value: userValue,
      marketValue,
      userValue,
      hint: metric.summary?.trim() || `${gapLabel}${actionLabel ? ` · ${actionLabel}` : ''}`,
      tone,
    };
  }).slice(0, 6);
}

function resolveFitLabel(copy: WorkspaceStatisticsCopy, value: 'high' | 'medium' | 'low' | 'unknown') {
  if (value === 'high') return copy.userFitHighLabel;
  if (value === 'medium') return copy.userRiskSeverityMedium;
  if (value === 'low') return copy.userRiskSeverityLow;
  return '—';
}

function resolveOpportunityLabel(copy: WorkspaceStatisticsCopy, value: 'high' | 'medium' | 'low' | 'unknown') {
  if (value === 'high') return copy.userRiskSeverityHigh;
  if (value === 'medium') return copy.userRiskSeverityMedium;
  if (value === 'low') return copy.userRiskSeverityLow;
  return '—';
}

function resolveActivityLabel(copy: WorkspaceStatisticsCopy, value: 'high' | 'medium' | 'low' | 'unknown') {
  if (value === 'high') return copy.contextHealthActivityHigh;
  if (value === 'medium') return copy.contextHealthActivityStable;
  if (value === 'low') return copy.contextHealthActivityLow;
  return '—';
}

function resolveRecommendationTone(
  type: 'risk' | 'opportunity' | 'performance' | 'growth' | 'promotion' | 'demand',
): WorkspaceStatisticsPriorityItemView['tone'] {
  if (type === 'risk') return 'warning';
  if (type === 'opportunity' || type === 'demand') return 'positive';
  return 'neutral';
}

function resolveRecommendationReliabilityLabel(
  locale: Locale,
  reliability: 'high' | 'medium' | 'low',
): string {
  if (locale === 'de') {
    if (reliability === 'high') return 'Hohe Sicherheit';
    if (reliability === 'medium') return 'Mittlere Sicherheit';
    return 'Niedrige Sicherheit';
  }
  if (reliability === 'high') return 'High confidence';
  if (reliability === 'medium') return 'Medium confidence';
  return 'Low confidence';
}

function resolveRecommendationPriorityLabel(
  copy: WorkspaceStatisticsCopy,
  priority: 'high' | 'medium' | 'low',
): string {
  if (priority === 'high') return copy.userActionPriorityHigh;
  if (priority === 'medium') return copy.userActionPriorityMedium;
  return copy.userActionPriorityLow;
}

function resolveRecommendationPriorityTone(
  priority: 'high' | 'medium' | 'low',
): WorkspaceStatisticsActionStepView['priorityTone'] {
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'info';
  return 'success';
}

export function buildRecommendationPrioritySection(params: {
  copy: WorkspaceStatisticsCopy;
  locale: Locale;
  source: WorkspaceStatisticsDecisionDashboardDto['risks'] | WorkspaceStatisticsDecisionDashboardDto['opportunities'] | undefined | null;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackItems: WorkspaceStatisticsPriorityItemView[];
}): WorkspaceStatisticsPrioritySectionView | null {
  const { locale, source, fallbackTitle, fallbackSubtitle, fallbackItems } = params;
  if (!source) {
    return fallbackItems.length > 0
      ? {
        title: fallbackTitle,
        subtitle: fallbackSubtitle,
        hasReliableItems: true,
        items: fallbackItems,
      }
      : null;
  }

  const items: WorkspaceStatisticsPriorityItemView[] = source.items.map((item, index) => ({
    key: `${item.code}-${index}`,
    title: item.title,
    body: item.description,
    metric: item.context?.trim() || resolveRecommendationReliabilityLabel(locale, item.reliability),
    tone: resolveRecommendationTone(item.type),
  }));

  if (items.length === 0) return null;

  return {
    title: source.title?.trim() || fallbackTitle,
    subtitle: source.subtitle?.trim() || fallbackSubtitle,
    hasReliableItems: source.hasReliableItems,
    items,
  };
}

export function buildRecommendationActionSection(params: {
  copy: WorkspaceStatisticsCopy;
  locale: Locale;
  source: WorkspaceStatisticsDecisionDashboardDto['nextSteps'] | undefined | null;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackSteps: WorkspaceStatisticsActionStepView[];
}): WorkspaceStatisticsActionSectionView | null {
  const { copy, locale, source, fallbackTitle, fallbackSubtitle, fallbackSteps } = params;
  if (!source) {
    return fallbackSteps.length > 0
      ? {
        title: fallbackTitle,
        subtitle: fallbackSubtitle,
        hasReliableItems: true,
        steps: fallbackSteps,
      }
      : null;
  }

  const steps: WorkspaceStatisticsActionStepView[] = source.items.map((item, index) => {
    const priorityTone = resolveRecommendationPriorityTone(item.priority);
    return {
      key: `${item.code}-${index}`,
      code: item.actionCode ?? item.action?.code ?? item.code,
      title: item.title,
      detail: item.description,
      priorityLabel: resolveRecommendationPriorityLabel(copy, item.priority),
      priorityTone,
      impactLabel: item.priority === 'high'
        ? copy.userActionImpactHigh
        : item.priority === 'medium'
          ? copy.userActionImpactMedium
          : copy.userActionImpactLow,
      effectLabel: item.action?.label?.trim() || item.context?.trim() || resolveRecommendationReliabilityLabel(locale, item.reliability),
    };
  });

  if (steps.length === 0) return null;

  return {
    title: source.title?.trim() || fallbackTitle,
    subtitle: source.subtitle?.trim() || fallbackSubtitle,
    hasReliableItems: source.hasReliableItems,
    steps,
  };
}

export function buildPersonalizedPricingSection(params: {
  copy: WorkspaceStatisticsCopy;
  source: WorkspaceStatisticsDecisionDashboardDto['personalizedPricing'] | undefined | null;
  formatCurrency: Intl.NumberFormat;
}): WorkspaceStatisticsPersonalizedPricingView | null {
  const { copy, source, formatCurrency } = params;
  if (!source) return null;

  const recommendedRange =
    source.recommendedMin === null || source.recommendedMax === null
      ? '—'
      : `${formatCurrency.format(source.recommendedMin)} – ${formatCurrency.format(source.recommendedMax)}`;

  return {
    title: source.title,
    subtitle: source.subtitle,
    contextLabel: source.contextLabel,
    currentPrice: source.userPrice === null ? '—' : formatCurrency.format(source.userPrice),
    recommendedRange,
    marketAverage: source.marketAverage === null ? '—' : formatCurrency.format(source.marketAverage),
    statusLabel:
      source.position === 'above'
        ? copy.userPricingStatusAbove
        : source.position === 'below'
          ? copy.userPricingStatusBelow
          : source.position === 'within'
            ? copy.userPricingStatusWithin
            : copy.userPricingStatusUnknown,
    summary: copy.userPricingSummary,
    effect:
      source.effect === 'warning'
        ? copy.userPricingEffectAbove
        : source.effect === 'positive'
          ? copy.userPricingEffectWithin
          : copy.userPricingEffectUnknown,
    gap: source.gapAbsolute === null ? '—' : `${source.gapAbsolute > 0 ? '+' : ''}${formatCurrency.format(source.gapAbsolute)}`,
    action: resolveActionCodeLabel(copy, source.actionCode),
    tone: source.effect === 'warning' ? 'warning' : source.effect === 'positive' ? 'positive' : 'neutral',
  };
}

export function buildCategoryFit(params: {
  copy: WorkspaceStatisticsCopy;
  source: WorkspaceStatisticsDecisionDashboardDto['categoryFit'] | undefined | null;
  formatNumber: Intl.NumberFormat;
}): WorkspaceStatisticsCategoryFitItemView[] {
  const { copy, source, formatNumber } = params;
  if (!source) return [];

  return source.items.map((item) => ({
    key: item.categoryKey ?? item.label,
    label: item.label,
    marketDemandShare: item.marketDemandShare === null ? '—' : `${formatNumber.format(Math.round(item.marketDemandShare))}%`,
    userFitLabel: resolveFitLabel(copy, item.userFit),
    opportunityLabel: resolveOpportunityLabel(copy, item.opportunity),
    recommendation: item.summary ?? resolveActionCodeLabel(copy, item.actionCode),
  }));
}

export function buildCityComparison(params: {
  copy: WorkspaceStatisticsCopy;
  source: WorkspaceStatisticsDecisionDashboardDto['cityComparison'] | undefined | null;
  formatNumber: Intl.NumberFormat;
}): WorkspaceStatisticsCityComparisonItemView[] {
  const { copy, source, formatNumber } = params;
  if (!source) return [];

  return source.items.map((item) => ({
    key: item.cityId ?? item.city,
    cityId: item.cityId,
    city: item.city,
    marketRequests: item.marketRequests === null ? '—' : formatNumber.format(item.marketRequests),
    userActivityLabel: resolveActivityLabel(copy, item.userActivity),
    userConversion: item.userConversion === null ? '—' : `${Math.round(item.userConversion)}%`,
    recommendation: item.recommendation ?? resolveActionCodeLabel(copy, item.actionCode),
  }));
}

function resolveActionTone(priorityTone: WorkspaceStatisticsActionStepView['priorityTone']): WorkspaceStatisticsActivitySignalView['tone'] {
  if (priorityTone === 'warning') return 'warning';
  if (priorityTone === 'success') return 'positive';
  return 'neutral';
}

export function buildPersonalizedActivitySignals(params: {
  copy: WorkspaceStatisticsCopy;
  formulaMetrics: WorkspaceStatisticsBenchmarkMetricView[];
  decisionMetrics: WorkspaceStatisticsBenchmarkMetricView[];
  signals: WorkspaceStatisticsDecisionSignalView[];
  completedJobs?: {
    marketValue: string;
    userValue: string;
    delta: string;
  } | null;
}): WorkspaceStatisticsActivitySignalView[] {
  const { copy, formulaMetrics, decisionMetrics, signals, completedJobs = null } = params;
  const signalMap = new Map(signals.map((item) => [item.code, item]));
  const buildFormulaCard = (key: string): WorkspaceStatisticsActivitySignalView | null => {
    const metric = formulaMetrics.find((item) => item.key === key) ?? null;
    if (!metric || metric.marketValue === '—') return null;
    const relatedSignal = Array.from(signalMap.values()).find((signal) => signal.key === metric.key) ?? null;
    const actionLabel = relatedSignal?.actionLabel;
    return {
      key: metric.key,
      label: metric.label,
      value: metric.userValue,
      marketValue: metric.marketValue,
      userValue: metric.userValue,
      hint: `${metric.delta}${actionLabel ? ` · ${actionLabel}` : ''}`,
      tone: metric.tone,
    };
  };

  const unansweredMetric = decisionMetrics.find((metric) => metric.key === 'unanswered');
  const unansweredSignal = signalMap.get('high_unanswered');
  const unansweredCard = unansweredMetric && unansweredSignal
    ? {
      key: unansweredMetric.key,
      label: unansweredMetric.label,
      value: unansweredMetric.userValue,
      marketValue: unansweredMetric.marketValue,
      userValue: unansweredMetric.userValue,
      hint: `${unansweredMetric.delta}${unansweredSignal.actionLabel ? ` · ${unansweredSignal.actionLabel}` : ''}${unansweredMetric.statusLabel ? ` · ${unansweredMetric.statusLabel}` : ''}`,
      tone: unansweredMetric.tone,
    }
    : null;

  const completedCard = completedJobs
    ? {
      key: 'completed_jobs',
      label: copy.activityCompletedLabel,
      value: completedJobs.userValue,
      marketValue: completedJobs.marketValue,
      userValue: completedJobs.userValue,
      hint: completedJobs.delta,
      tone: 'positive' as const,
    }
    : null;

  return [
    buildFormulaCard('offer_rate'),
    buildFormulaCard('avg_response_time'),
    unansweredCard,
    completedCard,
    buildFormulaCard('revenue'),
    buildFormulaCard('avg_order_value'),
    buildFormulaCard('cancellation_rate'),
  ].filter((item): item is WorkspaceStatisticsActivitySignalView => Boolean(item)).slice(0, 6);
}

function buildFunnelSignals(params: {
  copy: WorkspaceStatisticsCopy;
  decisionMetrics: WorkspaceStatisticsBenchmarkMetricView[];
  profileGap: WorkspaceStatisticsProfileGapView | null;
  nextSteps: WorkspaceStatisticsActionStepView[];
}): WorkspaceStatisticsActivitySignalView[] {
  const { copy, decisionMetrics, profileGap, nextSteps } = params;
  const responseMetric = decisionMetrics.find((metric) => metric.key === 'response_time');
  const unansweredMetric = decisionMetrics.find((metric) => metric.key === 'unanswered');
  const firstStep = nextSteps[0] ?? null;

  const metrics: WorkspaceStatisticsActivitySignalView[] = [];

  if (responseMetric) {
    metrics.push({
      key: 'funnel-response-time',
      label: responseMetric.label,
      value: responseMetric.userValue,
      hint: responseMetric.delta,
      tone: responseMetric.tone,
    });
  }

  if (unansweredMetric) {
    metrics.push({
      key: 'funnel-unanswered',
      label: unansweredMetric.label,
      value: unansweredMetric.userValue,
      hint: `${unansweredMetric.delta}${unansweredMetric.statusLabel ? ` · ${unansweredMetric.statusLabel}` : ''}`,
      tone: unansweredMetric.tone,
    });
  }

  if (profileGap) {
    metrics.push({
      key: 'funnel-gap',
      label: profileGap.title,
      value: profileGap.tone === 'warning' ? 'High' : profileGap.tone === 'positive' ? 'Low' : 'Medium',
      hint: profileGap.summary,
      tone: profileGap.tone,
    });
  }

  if (firstStep) {
    metrics.push({
      key: 'funnel-action',
      label: copy.decisionNextStepsLabel,
      value: firstStep.title,
      hint: firstStep.detail,
      tone: resolveActionTone(firstStep.priorityTone),
    });
  }

  return metrics.slice(0, 4);
}

export function buildUserIntelligence(params: {
  copy: WorkspaceStatisticsCopy;
  source: WorkspaceStatisticsDecisionDashboardDto['userIntelligence'] | undefined | null;
  formatCurrency: Intl.NumberFormat;
  formatNumber: Intl.NumberFormat;
  locale: Locale;
}): WorkspaceStatisticsUserIntelligenceView | null {
  const { copy, source, formatCurrency, formatNumber, locale } = params;
  if (!source) return null;

  const formulaMetrics: WorkspaceStatisticsBenchmarkMetricView[] = source.formulaMetrics.map((metric) => ({
    key: metric.key,
    label: resolveComparisonLabel(copy, metric.key),
    userValue: metric.unit === 'currency'
      ? formatCurrencyMetric(metric.userValue, formatCurrency)
      : formatMetricValue({
        value: metric.userValue,
        unit: metric.unit,
        formatNumber,
        locale,
      }),
    marketValue: metric.unit === 'currency'
      ? formatCurrencyMetric(metric.marketValue, formatCurrency)
      : formatMetricValue({
        value: metric.marketValue,
        unit: metric.unit,
        formatNumber,
        locale,
      }),
    delta: metric.unit === 'currency'
      ? formatCurrencyDelta({
        userValue: metric.userValue,
        marketValue: metric.marketValue,
        formatCurrency,
        locale,
      })
      : formatDelta({
        userValue: metric.userValue,
        marketValue: metric.marketValue,
        unit: metric.unit,
        formatNumber,
        locale,
      }),
    tone: metric.tone,
    statusLabel: null,
  }));

  const decisionMetrics: WorkspaceStatisticsBenchmarkMetricView[] = source.decisionMetrics.map((metric) => ({
    key: metric.key,
    label: resolveComparisonLabel(copy, metric.key),
    userValue: formatMetricValue({
      value: metric.userValue,
      unit: metric.unit,
      formatNumber,
      locale,
    }),
    marketValue: formatMetricValue({
      value: metric.marketValue,
      unit: metric.unit,
      formatNumber,
      locale,
    }),
    delta: formatDelta({
      userValue: metric.userValue,
      marketValue: metric.marketValue,
      unit: metric.unit,
      formatNumber,
      locale,
    }),
    tone: metric.tone,
    statusLabel: resolveStatusLabel(copy, metric.status),
  }));

  const signals: WorkspaceStatisticsDecisionSignalView[] = source.signals.map((signal) => ({
    key: signal.metricKey ?? signal.code,
    type: signal.type,
    code: signal.code,
    severity: signal.severity,
    actionLabel: resolveSignalActionLabel(copy, signal),
  }));

  const performancePosition = source.performancePosition ? {
    headline: resolvePositionHeadline(copy, source.performancePosition.percentile, source.performancePosition.bucket),
    summary: resolvePositionSummary(copy, source.performancePosition.percentile),
    overall: source.performancePosition.percentile === null
      ? '—'
      : `${copy.userPositionOverallLabel}: ${Math.round(source.performancePosition.percentile)}%`,
    category: source.performancePosition.categoryPercentile === null
      ? '—'
      : `${copy.userPositionCategoryLabel}: ${Math.round(source.performancePosition.categoryPercentile)}%${source.performancePosition.categoryLabel ? ` · ${source.performancePosition.categoryLabel}` : ''}`,
    city: source.performancePosition.cityPercentile === null
      ? '—'
      : `${copy.userPositionCityLabel}: ${Math.round(source.performancePosition.cityPercentile)}%${source.performancePosition.cityLabel ? ` · ${source.performancePosition.cityLabel}` : ''}`,
    bucket: source.performancePosition.bucket,
  } : null;

  const profileGap: WorkspaceStatisticsProfileGapView | null = source.profileGap
    ? {
      title: copy.userGapTitle,
      summary: copy.userGapSummaryTemplate
        .replace('{percent}', String(Math.round(source.profileGap.lossPercent ?? 0)))
        .replace('{count}', String(Math.round(source.profileGap.lostCount ?? 0))),
      tone: source.profileGap.tone,
    }
    : null;

  const risks = source.risks.map((item) => resolveRiskItem(copy, item, formatCurrency));
  const opportunities = source.opportunities.map((item) => resolveOpportunityItem(copy, item, formatNumber, formatCurrency));
  const nextSteps = source.nextSteps.map((item) => resolveActionStep(copy, item));
  const pricing: WorkspaceStatisticsPricingGapView | null = source.pricing
    ? (() => {
      const priceGap = source.pricing.currentPrice !== null && source.pricing.marketAverage !== null
        ? formatCurrencyDelta({
          userValue: source.pricing.currentPrice,
          marketValue: source.pricing.marketAverage,
          formatCurrency,
          locale,
        })
        : '—';
      const adjustPriceStep = nextSteps.find((item) => item.code === 'adjust_price') ?? null;

      return {
      currentPrice: source.pricing.currentPrice === null ? '—' : formatCurrency.format(source.pricing.currentPrice),
      recommendedRange:
        source.pricing.recommendedMin === null || source.pricing.recommendedMax === null
          ? '—'
          : `${formatCurrency.format(source.pricing.recommendedMin)} – ${formatCurrency.format(source.pricing.recommendedMax)}`,
      marketAverage: source.pricing.marketAverage === null ? '—' : formatCurrency.format(source.pricing.marketAverage),
      statusLabel:
        source.pricing.status === 'above'
          ? copy.userPricingStatusAbove
          : source.pricing.status === 'below'
            ? copy.userPricingStatusBelow
            : source.pricing.status === 'within'
              ? copy.userPricingStatusWithin
              : copy.userPricingStatusUnknown,
      summary: copy.userPricingSummary,
      effect:
        source.pricing.status === 'above'
          ? copy.userPricingEffectAbove
          : source.pricing.status === 'below'
            ? copy.userPricingEffectBelow
            : source.pricing.status === 'within'
            ? copy.userPricingEffectWithin
            : copy.userPricingEffectUnknown,
      gap: priceGap,
      action: adjustPriceStep ? `${adjustPriceStep.title}: ${adjustPriceStep.detail}` : null,
      tone:
        source.pricing.conversionImpact === 'warning'
          ? 'warning'
          : source.pricing.conversionImpact === 'positive'
            ? 'positive'
            : 'neutral',
    };
    })()
    : null;
  const funnelSignals = buildFunnelSignals({
    copy,
    decisionMetrics,
    profileGap,
    nextSteps,
  });

  return {
    comparisonLabel: source.comparisonLabel?.trim() || copy.userComparisonLabel,
    formulaMetrics,
    decisionMetrics,
    signals,
    funnelSignals,
    performancePosition,
    profileGap,
    risks,
    opportunities,
    pricing,
    nextSteps,
  };
}
