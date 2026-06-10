import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsCopy } from './statistics.copy';
import type {
  WorkspaceStatisticsActionSectionView,
  WorkspaceStatisticsOpportunityRadarItemView,
  WorkspaceStatisticsPersonalizedPricingView,
  WorkspaceStatisticsPriceIntelligenceView,
  WorkspaceStatisticsPrioritySectionView,
} from './statistics.model';

export type WorkspaceDecisionPlan = {
  summary: string;
  reasons: string[];
  steps: string[];
  actionLabel: string;
  shouldApplyFocus: boolean;
};

type DecisionPlanArgs = {
  locale: Locale;
  copy: WorkspaceStatisticsCopy;
  decisionInsight: string;
  selectedOpportunity: WorkspaceStatisticsOpportunityRadarItemView | null;
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceView;
  currentCityId: string | null;
  currentCategoryKey: string | null;
};

type PersonalizedDecisionPlanArgs = {
  copy: WorkspaceStatisticsCopy;
  personalizedPricing: WorkspaceStatisticsPersonalizedPricingView | null;
  risks: WorkspaceStatisticsPrioritySectionView | null;
  opportunities: WorkspaceStatisticsPrioritySectionView | null;
  nextSteps: WorkspaceStatisticsActionSectionView | null;
  selectedOpportunity: WorkspaceStatisticsOpportunityRadarItemView | null;
  currentCityId: string | null;
  currentCategoryKey: string | null;
};

function formatFocusLabel(selectedOpportunity: WorkspaceStatisticsOpportunityRadarItemView | null) {
  if (!selectedOpportunity) return null;
  return `${selectedOpportunity.city} · ${selectedOpportunity.category}`;
}

function formatPriceRangeLabel(priceIntelligence: WorkspaceStatisticsPriceIntelligenceView) {
  if (priceIntelligence.optimalMinLabel && priceIntelligence.optimalMaxLabel) {
    return `${priceIntelligence.optimalMinLabel} – ${priceIntelligence.optimalMaxLabel}`;
  }
  return priceIntelligence.recommendedRangeLabel;
}

export function buildOpportunityReasons(params: {
  locale: Locale;
  copy: WorkspaceStatisticsCopy;
  item: WorkspaceStatisticsOpportunityRadarItemView;
  priceIntelligence?: WorkspaceStatisticsPriceIntelligenceView | null;
}) {
  const { locale, copy, item, priceIntelligence } = params;
  const reasons: string[] = [];
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';

  if (typeof item.marketBalanceRatio === 'number' && item.marketBalanceRatio >= 2) {
    reasons.push(
      copy.decisionReasonMarketBalanceTemplate.replace(
        '{ratio}',
        item.marketBalanceRatio.toFixed(1),
      ),
    );
  } else if (typeof item.providers === 'number' && item.providers > 0) {
    reasons.push(
      copy.decisionReasonDemandProvidersTemplate
        .replace('{demand}', item.demand.toLocaleString(localeTag))
        .replace('{providers}', item.providers.toLocaleString(localeTag)),
    );
  }

  const strongestMetrics = item.metrics
    .slice()
    .sort((a, b) => b.value - a.value)
    .filter((metric) => metric.key !== 'competition')
    .slice(0, 2);

  strongestMetrics.forEach((metric) => {
    if (metric.key === 'growth') {
      reasons.push(copy.decisionReasonGrowth);
    } else if (metric.key === 'activity') {
      reasons.push(copy.decisionReasonActivity);
    } else if (metric.key === 'demand') {
      reasons.push(copy.decisionReasonDemand);
    }
  });

  if (priceIntelligence?.recommendedRangeLabel) {
    reasons.push(
      copy.decisionReasonPriceCorridorTemplate.replace(
        '{range}',
        priceIntelligence.recommendedRangeLabel,
      ),
    );
  }

  return Array.from(new Set(reasons)).slice(0, 3);
}

export function buildDecisionPlan({
  locale,
  copy,
  decisionInsight,
  selectedOpportunity,
  priceIntelligence,
  currentCityId,
  currentCategoryKey,
}: DecisionPlanArgs): WorkspaceDecisionPlan {
  const focusLabel = formatFocusLabel(selectedOpportunity);
  const priceLabel = formatPriceRangeLabel(priceIntelligence);
  const summary =
    decisionInsight.trim().length > 0 ? decisionInsight : copy.decisionSummaryFallback;
  const reasons = selectedOpportunity
    ? buildOpportunityReasons({ locale, copy, item: selectedOpportunity, priceIntelligence })
    : priceLabel
      ? [copy.decisionReasonPriceCorridorTemplate.replace('{range}', priceLabel)]
      : [];
  const steps = [
    focusLabel
      ? copy.decisionFocusStepTemplate.replace('{value}', focusLabel)
      : copy.decisionFocusFallback,
    priceLabel
      ? copy.decisionPriceStepTemplate.replace('{value}', priceLabel)
      : copy.decisionPriceFallback,
    copy.decisionResponseTimeStep,
  ];
  const shouldApplyFocus = Boolean(
    selectedOpportunity &&
    (selectedOpportunity.cityId !== currentCityId ||
      selectedOpportunity.categoryKey !== currentCategoryKey),
  );

  return {
    summary,
    reasons,
    steps,
    actionLabel: shouldApplyFocus
      ? copy.decisionApplyStrategyLabel
      : copy.decisionOpenRequestsLabel,
    shouldApplyFocus,
  };
}

export function buildPersonalizedDecisionPlan({
  copy,
  personalizedPricing,
  risks,
  opportunities,
  nextSteps,
  selectedOpportunity,
  currentCityId,
  currentCategoryKey,
}: PersonalizedDecisionPlanArgs): WorkspaceDecisionPlan {
  const primaryStep = nextSteps?.steps[0] ?? null;
  const topRisk = risks?.items[0] ?? null;
  const topOpportunity = opportunities?.items[0] ?? null;
  const hasFocusStep = nextSteps?.steps.some((step) => step.code === 'focus_market') ?? false;
  const shouldApplyFocus = Boolean(
    hasFocusStep &&
    selectedOpportunity &&
    (selectedOpportunity.cityId !== currentCityId ||
      selectedOpportunity.categoryKey !== currentCategoryKey),
  );

  const summary = primaryStep
    ? `${primaryStep.title}: ${primaryStep.detail}`
    : copy.personalizedDecisionSummaryFallback;

  const reasons = [
    topRisk?.body ?? null,
    topOpportunity?.body ?? null,
    personalizedPricing?.effect ?? null,
  ]
    .filter((value): value is string => Boolean(value && value.trim().length > 0))
    .slice(0, 3);

  const steps = (nextSteps?.steps ?? []).map((step) => `${step.title}: ${step.detail}`).slice(0, 4);

  return {
    summary,
    reasons,
    steps,
    actionLabel: shouldApplyFocus
      ? copy.decisionApplyStrategyLabel
      : copy.decisionOpenRequestsLabel,
    shouldApplyFocus,
  };
}
