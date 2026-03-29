import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import type {
  WorkspaceStatisticsActionSectionView,
  WorkspaceStatisticsOpportunityRadarItemView,
  WorkspaceStatisticsPersonalizedPricingView,
  WorkspaceStatisticsPriceIntelligenceView,
  WorkspaceStatisticsPrioritySectionView,
} from './workspaceStatistics.model';

export type WorkspaceDecisionPlan = {
  summary: string;
  reasons: string[];
  steps: string[];
  actionLabel: string;
  shouldApplyFocus: boolean;
};

export type WorkspacePriceStrategyOption = {
  key: 'entry' | 'growth' | 'scale';
  label: string;
  priceLabel: string;
  description: string;
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

type PriceStrategyArgs = {
  locale: Locale;
  copy: WorkspaceStatisticsCopy;
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceView;
};

type PersonalizedDecisionPlanArgs = {
  locale: Locale;
  copy: WorkspaceStatisticsCopy;
  personalizedPricing: WorkspaceStatisticsPersonalizedPricingView | null;
  risks: WorkspaceStatisticsPrioritySectionView | null;
  opportunities: WorkspaceStatisticsPrioritySectionView | null;
  nextSteps: WorkspaceStatisticsActionSectionView | null;
  selectedOpportunity: WorkspaceStatisticsOpportunityRadarItemView | null;
  currentCityId: string | null;
  currentCategoryKey: string | null;
};

function formatFocusLabel(
  selectedOpportunity: WorkspaceStatisticsOpportunityRadarItemView | null,
) {
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
  item: WorkspaceStatisticsOpportunityRadarItemView;
  priceIntelligence?: WorkspaceStatisticsPriceIntelligenceView | null;
}) {
  const { locale, item, priceIntelligence } = params;
  const reasons: string[] = [];
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';

  if (typeof item.marketBalanceRatio === 'number' && item.marketBalanceRatio >= 2) {
    reasons.push(
      locale === 'de'
        ? `Hohe Nachfrage bei relativ niedriger Anbieterzahl (${item.marketBalanceRatio.toFixed(1)}x Marktbalance).`
        : `Strong demand with relatively low provider pressure (${item.marketBalanceRatio.toFixed(1)}x market balance).`,
    );
  } else if (typeof item.providers === 'number' && item.providers > 0) {
    reasons.push(
      locale === 'de'
        ? `${item.demand.toLocaleString(localeTag)} Nachfrage-Signale treffen auf nur ${item.providers.toLocaleString(localeTag)} aktive Anbieter.`
        : `${item.demand.toLocaleString(localeTag)} demand signals currently meet only ${item.providers.toLocaleString(localeTag)} active providers.`,
    );
  }

  const strongestMetrics = item.metrics
    .slice()
    .sort((a, b) => b.value - a.value)
    .filter((metric) => metric.key !== 'competition')
    .slice(0, 2);

  strongestMetrics.forEach((metric) => {
    if (metric.key === 'growth') {
      reasons.push(locale === 'de' ? 'Das Segment zeigt zusätzlich klares Wachstum.' : 'The segment also shows clear growth.');
    } else if (metric.key === 'activity') {
      reasons.push(locale === 'de' ? 'Die Marktaktivität ist hoch genug für schnelle Reaktionen und Abschlüsse.' : 'Market activity is high enough to support fast response and conversion.');
    } else if (metric.key === 'demand') {
      reasons.push(locale === 'de' ? 'Die Nachfrage ist im aktuellen Zeitraum überdurchschnittlich stark.' : 'Demand is above average in the current time range.');
    }
  });

  if (priceIntelligence?.recommendedRangeLabel) {
    reasons.push(
      locale === 'de'
        ? `Der Preis-Korridor ${priceIntelligence.recommendedRangeLabel} wird aktuell durch Marktdaten gestützt.`
        : `The ${priceIntelligence.recommendedRangeLabel} pricing corridor is currently supported by market data.`,
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
  const summary = decisionInsight.trim().length > 0
    ? decisionInsight
    : (
      locale === 'de'
        ? 'Nutze den aktuellen Kontext, um Fokus, Preis und Reaktionszeit sauber auszurichten.'
        : 'Use the current context to align focus, pricing, and response speed.'
    );
  const reasons = selectedOpportunity
    ? buildOpportunityReasons({ locale, item: selectedOpportunity, priceIntelligence })
    : (
      priceLabel
        ? [
          locale === 'de'
            ? `Im Bereich ${priceLabel} liegen aktuell die besten Abschlusschancen.`
            : `Current close-rate signals are strongest around ${priceLabel}.`,
        ]
        : []
    );
  const steps = [
    focusLabel
      ? (locale === 'de' ? `Fokus: ${focusLabel}` : `Focus: ${focusLabel}`)
      : (locale === 'de' ? 'Fokus: Globalen Markt beobachten und dann Opportunity wählen' : 'Focus: review the global market, then choose an opportunity'),
    priceLabel
      ? (locale === 'de' ? `Preis: ${priceLabel}` : `Price: ${priceLabel}`)
      : (locale === 'de' ? 'Preis: Erst nach belastbaren Marktpreisen skalieren' : 'Price: scale only after reliable pricing signals'),
    locale === 'de' ? 'Reaktionszeit: unter 2h halten' : 'Response time: keep it under 2h',
  ];
  const shouldApplyFocus = Boolean(
    selectedOpportunity && (
      selectedOpportunity.cityId !== currentCityId ||
      selectedOpportunity.categoryKey !== currentCategoryKey
    ),
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
  locale,
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
    hasFocusStep && selectedOpportunity && (
      selectedOpportunity.cityId !== currentCityId ||
      selectedOpportunity.categoryKey !== currentCategoryKey
    ),
  );

  const summary = primaryStep
    ? `${primaryStep.title}: ${primaryStep.detail}`
    : (
      locale === 'de'
        ? 'Priorisiert Chancen, Risiken und nächste Schritte für dein aktuelles Markt-Setup.'
        : 'Prioritizes opportunities, risks, and next steps for your current market setup.'
    );

  const reasons = [
    topRisk?.body ?? null,
    topOpportunity?.body ?? null,
    personalizedPricing?.effect ?? null,
  ].filter((value): value is string => Boolean(value && value.trim().length > 0)).slice(0, 3);

  const steps = (nextSteps?.steps ?? [])
    .map((step) => `${step.title}: ${step.detail}`)
    .slice(0, 4);

  return {
    summary,
    reasons,
    steps,
    actionLabel: shouldApplyFocus ? copy.decisionApplyStrategyLabel : copy.decisionOpenRequestsLabel,
    shouldApplyFocus,
  };
}

export function buildPriceStrategyOptions({
  locale,
  copy,
  priceIntelligence,
}: PriceStrategyArgs): WorkspacePriceStrategyOption[] {
  const entryPrice = priceIntelligence.optimalMinLabel ?? priceIntelligence.recommendedRangeLabel ?? '—';
  const growthPrice = formatPriceRangeLabel(priceIntelligence) ?? '—';
  const scalePrice = priceIntelligence.optimalMaxLabel ?? priceIntelligence.marketAverageLabel ?? '—';

  return [
    {
      key: 'entry',
      label: copy.priceStrategyEntryLabel,
      priceLabel: entryPrice,
      description: locale === 'de'
        ? 'Für schnelle Abschlüsse und einen leichten Markteintritt.'
        : 'For faster closes and easier market entry.',
    },
    {
      key: 'growth',
      label: copy.priceStrategyGrowthLabel,
      priceLabel: growthPrice,
      description: locale === 'de'
        ? 'Für stabile Conversion bei gesunder Marge.'
        : 'For stable conversion with healthy margin.',
    },
    {
      key: 'scale',
      label: copy.priceStrategyScaleLabel,
      priceLabel: scalePrice,
      description: locale === 'de'
        ? 'Nur mit starkem Profil, schneller Antwort und klarer Differenzierung.'
        : 'Only with a strong profile, fast response, and clear differentiation.',
    },
  ];
}
