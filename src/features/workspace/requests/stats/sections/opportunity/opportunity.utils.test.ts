import { describe, expect, it } from 'vitest';

import { getWorkspaceStatisticsCopy } from '../../workspaceStatistics.copy';
import {
  buildOpportunityAnalysisAxes,
  buildOpportunityRadarAxisEndpoints,
  buildOpportunityRadarAxisValueLabelPositions,
  buildOpportunityRadarPoints,
  buildOpportunityRadarSmoothPath,
  opportunityStatusClassName,
  opportunityStatusLabel,
  opportunitySummaryLabel,
  opportunityToneLabel,
  opportunityCardAriaLabel,
  selectOpportunityAnalysisItem,
  selectOpportunityTopCards,
  type OpportunityItem,
} from './opportunity.utils';

function makeOpportunityItem(overrides: Partial<OpportunityItem> = {}): OpportunityItem {
  return {
    rank: 1,
    cityId: 'city-1',
    city: 'Berlin',
    categoryKey: 'cleaning',
    category: 'Cleaning & Housekeeping',
    demand: 12,
    providers: 4,
    marketBalanceRatio: 3,
    score: 8.4,
    demandScore: 9.4,
    competitionScore: 6.1,
    growthScore: 7.2,
    activityScore: 6.9,
    status: 'good',
    summaryKey: 'good',
    metrics: [
      { key: 'demand', value: 9.4, semanticTone: 'very-high', semanticKey: 'very_high' },
      { key: 'competition', value: 6.1, semanticTone: 'high', semanticKey: 'high' },
      { key: 'growth', value: 7.2, semanticTone: 'high', semanticKey: 'high' },
      { key: 'activity', value: 6.9, semanticTone: 'high', semanticKey: 'high' },
    ],
    tone: 'high',
    href: '/workspace?section=requests&cityId=city-1&categoryKey=cleaning',
    ...overrides,
  };
}

describe('opportunity.utils', () => {
  it('selects analysis item by rank=1 and top cards as rank 3 + rank 2', () => {
    const items: OpportunityItem[] = [
      makeOpportunityItem({ rank: 2, cityId: 'city-2', city: 'Karlsruhe' }),
      makeOpportunityItem({ rank: 3, cityId: 'city-3', city: 'Mannheim' }),
      makeOpportunityItem({ rank: 1, cityId: 'city-1', city: 'Berlin' }),
    ];

    const analysisItem = selectOpportunityAnalysisItem(items);
    expect(analysisItem?.rank).toBe(1);

    const topCards = selectOpportunityTopCards({ opportunityRadar: items, analysisItem });
    expect(topCards.map((item) => item.rank)).toEqual([3, 2]);
  });

  it('builds fallback top cards when preferred ranks are missing', () => {
    const items: OpportunityItem[] = [
      makeOpportunityItem({ rank: 1, cityId: 'city-1', city: 'Berlin' }),
      makeOpportunityItem({ rank: 2, cityId: 'city-2', city: 'Karlsruhe' }),
    ];

    const analysisItem = selectOpportunityAnalysisItem(items);
    const topCards = selectOpportunityTopCards({ opportunityRadar: items, analysisItem });

    expect(topCards).toHaveLength(1);
    expect(topCards[0]?.rank).toBe(2);
  });

  it('maps analysis axes in fixed order and fills missing metric with low semantic', () => {
    const copy = getWorkspaceStatisticsCopy('de');
    const analysisItem = makeOpportunityItem({
      metrics: [
        { key: 'demand', value: 8.7, semanticTone: 'very-high', semanticKey: 'very_high' },
        { key: 'competition', value: 5.5, semanticTone: 'medium', semanticKey: 'noticeable' },
        { key: 'growth', value: 6.3, semanticTone: 'high', semanticKey: 'high' },
      ],
    });

    const axes = buildOpportunityAnalysisAxes({ analysisItem, copy });

    expect(axes.map((axis) => axis.key)).toEqual(['demand', 'competition', 'growth', 'activity']);
    expect(axes[0]?.semanticLabel).toBe(copy.opportunitySemanticVeryHigh);
    expect(axes[1]?.semanticLabel).toBe(copy.opportunitySemanticNoticeable);
    expect(axes[3]).toMatchObject({ value: 0, semanticTone: 'low', semanticLabel: copy.opportunitySemanticLow });
  });

  it('builds radar geometry with clamped values and smooth path', () => {
    const points = buildOpportunityRadarPoints([20, -2, 5]);

    expect(points).toHaveLength(4);
    expect(points[0]).toEqual(expect.objectContaining({ x: 90, y: 28 }));
    expect(points[1]).toEqual(expect.objectContaining({ x: 90, y: 90 }));

    const path = buildOpportunityRadarSmoothPath(points);
    expect(path).toContain('Q');
    expect(path.endsWith(' Z')).toBe(true);

    expect(buildOpportunityRadarSmoothPath(points.slice(0, 2))).toBe('');
  });

  it('exposes labels/statuses for de/en and summary mapping', () => {
    const copy = getWorkspaceStatisticsCopy('de');

    expect(opportunityToneLabel('supply-heavy', copy)).toBe(copy.opportunityToneSupplyHeavy);
    expect(opportunityStatusClassName('very_high')).toBe('very-high');
    expect(opportunityStatusLabel('competitive', 'de')).toBe('Viele Anbieter');
    expect(opportunityStatusLabel('competitive', 'en')).toBe('Competitive');
    expect(opportunitySummaryLabel('balanced_competitive', copy)).toBe(copy.opportunitySummaryBalancedCompetitive);
  });

  it('builds radar axis endpoints and value labels with fixed formatting', () => {
    const endpoints = buildOpportunityRadarAxisEndpoints();
    expect(endpoints).toHaveLength(4);
    expect(endpoints[0]).toEqual(expect.objectContaining({ x: 90, y: 28 }));

    const labels = buildOpportunityRadarAxisValueLabelPositions([11.2, -1, 6.789, 2]);
    expect(labels).toHaveLength(4);
    expect(labels[0]?.label).toBe('10.0');
    expect(labels[1]?.label).toBe('0.0');
    expect(labels[2]?.label).toBe('6.8');
  });

  it('builds accessible aria label for opportunity cards', () => {
    const copy = getWorkspaceStatisticsCopy('de');
    const item = makeOpportunityItem({
      city: 'Berlin',
      category: 'Cleaning & Housekeeping',
      score: 5.4,
      demand: 12,
      providers: 5,
      marketBalanceRatio: 2.4,
      status: 'balanced',
    });

    const label = opportunityCardAriaLabel({ item, copy, locale: 'de' });

    expect(label).toContain('Berlin · Cleaning & Housekeeping');
    expect(label).toContain('Chance Score: 5.4 / 10');
    expect(label).toContain('Nachfrage: 12');
    expect(label).toContain('Anbieter: 5');
    expect(label).toContain('Marktbalance: 2.40');
    expect(label).toContain('Ausgeglichen');
  });
});
