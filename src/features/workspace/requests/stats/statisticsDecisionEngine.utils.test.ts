import { describe, expect, it } from 'vitest';

import { getWorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import {
  buildDecisionPlan,
  buildPersonalizedDecisionPlan,
  buildOpportunityReasons,
  buildPriceStrategyOptions,
} from './statisticsDecisionEngine.utils';
import type {
  WorkspaceStatisticsActionSectionView,
  WorkspaceStatisticsOpportunityRadarItemView,
  WorkspaceStatisticsPersonalizedPricingView,
  WorkspaceStatisticsPriceIntelligenceView,
  WorkspaceStatisticsPrioritySectionView,
} from './workspaceStatistics.model';

function makeOpportunity(
  overrides: Partial<WorkspaceStatisticsOpportunityRadarItemView> = {},
): WorkspaceStatisticsOpportunityRadarItemView {
  return {
    rank: 1,
    cityId: 'berlin-id',
    city: 'Berlin',
    categoryKey: 'cleaning',
    category: 'Cleaning & Housekeeping',
    demand: 12,
    providers: 4,
    marketBalanceRatio: 3,
    score: 8.4,
    demandScore: 9.2,
    competitionScore: 5.8,
    growthScore: 7.1,
    activityScore: 6.4,
    status: 'good',
    summaryKey: 'good',
    metrics: [
      { key: 'demand', value: 9.2, semanticTone: 'very-high', semanticKey: 'very_high' },
      { key: 'competition', value: 5.8, semanticTone: 'medium', semanticKey: 'medium' },
      { key: 'growth', value: 7.1, semanticTone: 'high', semanticKey: 'high' },
      { key: 'activity', value: 6.4, semanticTone: 'high', semanticKey: 'high' },
    ],
    tone: 'high',
    href: '/workspace?section=requests&cityId=berlin-id&categoryKey=cleaning',
    ...overrides,
  };
}

function makePriceIntelligence(
  overrides: Partial<WorkspaceStatisticsPriceIntelligenceView> = {},
): WorkspaceStatisticsPriceIntelligenceView {
  return {
    cityLabel: 'Berlin',
    categoryLabel: 'Cleaning & Housekeeping',
    contextLabel: 'Cleaning & Housekeeping · Berlin',
    recommendedRangeLabel: '65 € – 90 €',
    marketAverageLabel: '78 €',
    recommendedMin: 65,
    recommendedMax: 90,
    marketAverage: 78,
    optimalMin: 74,
    optimalMax: 83,
    optimalMinLabel: '74 €',
    optimalMaxLabel: '83 €',
    recommendation: 'Preise zwischen 74 € und 83 € konvertieren aktuell am besten.',
    profitPotentialScore: 7.4,
    profitPotentialStatus: 'medium',
    profitPotentialLabel: 'Mittel',
    ...overrides,
  };
}

function makePersonalizedPricing(
  overrides: Partial<WorkspaceStatisticsPersonalizedPricingView> = {},
): WorkspaceStatisticsPersonalizedPricingView {
  return {
    title: 'Preisstrategie',
    subtitle: 'Server pricing',
    contextLabel: 'Cleaning & Housekeeping · Berlin',
    currentPrice: '450 €',
    currentPriceValue: 450,
    recommendedRange: '380 € – 420 €',
    marketAverage: '400 €',
    marketAverageValue: 400,
    statusLabel: 'Zu hoch',
    summary: 'Pricing Strategy',
    effect: 'Zu hoch → weniger Abschlüsse',
    gap: '+50 €',
    action: 'Preis anpassen: Positioniere neue Angebote näher bei 400€.',
    tone: 'warning',
    ...overrides,
  };
}

function makePrioritySection(
  type: 'risks' | 'opportunities',
  overrides: Partial<WorkspaceStatisticsPrioritySectionView> = {},
): WorkspaceStatisticsPrioritySectionView {
  const item = type === 'risks'
    ? {
      key: 'slow-response',
      title: 'Reaktionszeit zu hoch',
      body: 'Du antwortest deutlich langsamer als der Markt.',
      metric: '930 Min.',
      tone: 'warning' as const,
    }
    : {
      key: 'high-demand-city',
      title: 'Hohe Nachfrage in deinem Zielmarkt',
      body: 'Berlin · Cleaning & Housekeeping zeigt aktuell starke Nachfrage für dein Setup.',
      metric: '12',
      tone: 'positive' as const,
    };

  return {
    title: type === 'risks' ? 'Risiken' : 'Chancen',
    subtitle: type === 'risks' ? 'Server risks' : 'Server opportunities',
    hasReliableItems: true,
    items: [item],
    ...overrides,
  };
}

function makeActionSection(
  overrides: Partial<WorkspaceStatisticsActionSectionView> = {},
): WorkspaceStatisticsActionSectionView {
  return {
    title: 'Nächste Schritte',
    subtitle: 'Server actions',
    hasReliableItems: true,
    steps: [
      {
        key: 'respond-faster',
        code: 'respond_faster',
        title: 'Antworte schneller',
        detail: 'Ziel: erste Antwort unter 120 Minuten senden.',
        priorityLabel: 'High',
        priorityTone: 'warning',
        impactLabel: 'Hoch',
        effectLabel: 'Mehr Antworten im Peak-Zeitfenster und weniger offene Vorgänge.',
      },
      {
        key: 'focus-market',
        code: 'focus_market',
        title: 'Marktfokus schärfen',
        detail: 'Fokus auf Berlin · Cleaning & Housekeeping legen, solange Nachfrage und Balance stark sind.',
        priorityLabel: 'Medium',
        priorityTone: 'info',
        impactLabel: 'Mittel',
        effectLabel: 'Mehr Sichtbarkeit im stärksten Marktsegment.',
      },
    ],
    ...overrides,
  };
}

describe('statisticsDecisionEngine.utils', () => {
  it('builds actionable decision plan when selected opportunity changes the current focus', () => {
    const copy = getWorkspaceStatisticsCopy('de');
    const decisionPlan = buildDecisionPlan({
      locale: 'de',
      copy,
      decisionInsight: 'Berlin zeigt aktuell die klarste Chance für schnelle Abschlüsse.',
      selectedOpportunity: makeOpportunity(),
      priceIntelligence: makePriceIntelligence(),
      currentCityId: null,
      currentCategoryKey: null,
    });

    expect(decisionPlan.summary).toContain('Berlin');
    expect(decisionPlan.reasons.length).toBeGreaterThan(0);
    expect(decisionPlan.steps[0]).toBe('Fokus: Berlin · Cleaning & Housekeeping');
    expect(decisionPlan.steps[1]).toBe('Preis: 74 € – 83 €');
    expect(decisionPlan.steps[2]).toBe('Reaktionszeit: unter 2h halten');
    expect(decisionPlan.actionLabel).toBe(copy.decisionApplyStrategyLabel);
    expect(decisionPlan.shouldApplyFocus).toBe(true);
  });

  it('falls back to opening matching requests when focus already matches the selected opportunity', () => {
    const copy = getWorkspaceStatisticsCopy('en');
    const selectedOpportunity = makeOpportunity();
    const decisionPlan = buildDecisionPlan({
      locale: 'en',
      copy,
      decisionInsight: '',
      selectedOpportunity,
      priceIntelligence: makePriceIntelligence(),
      currentCityId: selectedOpportunity.cityId,
      currentCategoryKey: selectedOpportunity.categoryKey,
    });

    expect(decisionPlan.summary).toContain('align focus');
    expect(decisionPlan.actionLabel).toBe(copy.decisionOpenRequestsLabel);
    expect(decisionPlan.shouldApplyFocus).toBe(false);
  });

  it('builds personalized decision plan from user signals and next steps', () => {
    const copy = getWorkspaceStatisticsCopy('de');
    const selectedOpportunity = makeOpportunity();
    const decisionPlan = buildPersonalizedDecisionPlan({
      locale: 'de',
      copy,
      personalizedPricing: makePersonalizedPricing(),
      risks: makePrioritySection('risks'),
      opportunities: makePrioritySection('opportunities'),
      nextSteps: makeActionSection(),
      selectedOpportunity,
      currentCityId: null,
      currentCategoryKey: null,
    });

    expect(decisionPlan.summary).toContain('Antworte schneller');
    expect(decisionPlan.reasons).toContain('Du antwortest deutlich langsamer als der Markt.');
    expect(decisionPlan.reasons).toContain('Zu hoch → weniger Abschlüsse');
    expect(decisionPlan.steps[0]).toContain('Antworte schneller');
    expect(decisionPlan.steps[1]).toContain('Marktfokus schärfen');
    expect(decisionPlan.actionLabel).toBe(copy.decisionApplyStrategyLabel);
    expect(decisionPlan.shouldApplyFocus).toBe(true);
  });

  it('builds strategy price options from the recommended corridor', () => {
    const copy = getWorkspaceStatisticsCopy('de');
    const strategyOptions = buildPriceStrategyOptions({
      locale: 'de',
      copy,
      priceIntelligence: makePriceIntelligence(),
    });

    expect(strategyOptions).toEqual([
      expect.objectContaining({ key: 'entry', priceLabel: '74 €', label: copy.priceStrategyEntryLabel }),
      expect.objectContaining({ key: 'growth', priceLabel: '74 € – 83 €', label: copy.priceStrategyGrowthLabel }),
      expect.objectContaining({ key: 'scale', priceLabel: '83 €', label: copy.priceStrategyScaleLabel }),
    ]);
  });

  it('explains why an opportunity is attractive based on market balance and pricing', () => {
    const reasons = buildOpportunityReasons({
      locale: 'en',
      item: makeOpportunity({
        metrics: [
          { key: 'demand', value: 9.2, semanticTone: 'very-high', semanticKey: 'very_high' },
          { key: 'competition', value: 5.8, semanticTone: 'medium', semanticKey: 'medium' },
        ],
      }),
      priceIntelligence: makePriceIntelligence(),
    });

    expect(reasons.length).toBeGreaterThan(1);
    expect(reasons.join(' ')).toContain('market balance');
    expect(reasons.join(' ')).toContain('pricing corridor');
  });
});
