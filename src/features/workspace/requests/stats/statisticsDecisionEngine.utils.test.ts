import { describe, expect, it } from 'vitest';

import { getWorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import {
  buildDecisionPlan,
  buildOpportunityReasons,
  buildPriceStrategyOptions,
} from './statisticsDecisionEngine.utils';
import type {
  WorkspaceStatisticsOpportunityRadarItemView,
  WorkspaceStatisticsPriceIntelligenceView,
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
