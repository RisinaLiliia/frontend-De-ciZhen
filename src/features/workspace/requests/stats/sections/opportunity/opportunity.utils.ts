import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../../useWorkspaceStatisticsModel';

export type OpportunityItem = WorkspaceStatisticsModel['opportunityRadar'][number];
export type OpportunityStatus = 'very_high' | 'good' | 'balanced' | 'competitive' | 'low';
export type OpportunityMetricKey = 'demand' | 'competition' | 'growth' | 'activity';
export type OpportunitySummaryKey = OpportunityItem['summaryKey'];
export type OpportunitySemanticKey = OpportunityItem['metrics'][number]['semanticKey'];

export type OpportunityAxis = {
  key: OpportunityMetricKey;
  label: string;
  value: number;
  semanticLabel: string;
  semanticTone: OpportunityItem['metrics'][number]['semanticTone'];
};

export function selectOpportunityAnalysisItem(
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'],
): OpportunityItem | null {
  return opportunityRadar.find((item) => item.rank === 1) ?? opportunityRadar[0] ?? null;
}

export function selectOpportunityTopCards(params: {
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
  analysisItem: OpportunityItem | null;
}): OpportunityItem[] {
  const { opportunityRadar, analysisItem } = params;
  const byRank = new Map<(typeof opportunityRadar)[number]['rank'], (typeof opportunityRadar)[number]>(
    opportunityRadar.map((item) => [item.rank, item]),
  );
  const preferredRanks: Array<(typeof opportunityRadar)[number]['rank']> = [3, 2];
  const preferred = preferredRanks
    .map((rank) => byRank.get(rank))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  if (preferred.length >= 2) return preferred;

  const preferredRanksSet = new Set(preferred.map((item) => item.rank));
  const fallback = opportunityRadar
    .filter((item) => item.rank !== analysisItem?.rank && !preferredRanksSet.has(item.rank))
    .sort((a, b) => b.rank - a.rank);
  return [...preferred, ...fallback].slice(0, 2);
}

export function buildOpportunityAnalysisAxes(params: {
  analysisItem: OpportunityItem | null;
  copy: WorkspaceStatisticsModel['copy'];
}): OpportunityAxis[] {
  const { analysisItem, copy } = params;
  const axisOrder: OpportunityMetricKey[] = ['demand', 'competition', 'growth', 'activity'];
  if (!analysisItem) return [];

  return axisOrder.map((key) => {
    const metric = analysisItem.metrics.find((item) => item.key === key);
    return {
      key,
      label: opportunityAxisLabel(key, copy),
      value: Number((metric?.value ?? 0).toFixed(1)),
      semanticLabel: opportunityMetricSemanticLabel(metric?.semanticKey ?? 'low', copy),
      semanticTone: metric?.semanticTone ?? 'low',
    };
  });
}

export function opportunityToneLabel(
  tone: WorkspaceStatisticsModel['opportunityRadar'][number]['tone'],
  copy: WorkspaceStatisticsModel['copy'],
): string {
  if (tone === 'very-high') return copy.opportunityToneVeryHigh;
  if (tone === 'high') return copy.opportunityToneHigh;
  if (tone === 'balanced') return copy.opportunityToneBalanced;
  return copy.opportunityToneSupplyHeavy;
}

export function buildOpportunityRadarAxisEndpoints(): Array<{ x: number; y: number }> {
  const count = 4;
  const center = 90;
  const radius = 62;
  return Array.from({ length: count }, (_, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / count) * index;
    return {
      x: center + (Math.cos(angle) * radius),
      y: center + (Math.sin(angle) * radius),
    };
  });
}

export function buildOpportunityRadarPoints(values: number[]): Array<{ x: number; y: number }> {
  const count = 4;
  const center = 90;
  const maxRadius = 62;
  return Array.from({ length: count }, (_, index) => {
    const normalized = Math.max(0, Math.min(10, values[index] ?? 0)) / 10;
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / count) * index;
    const radius = maxRadius * normalized;
    return {
      x: center + (Math.cos(angle) * radius),
      y: center + (Math.sin(angle) * radius),
    };
  });
}

export function buildOpportunityRadarSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 3) return '';

  const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const firstMid = midpoint(points[points.length - 1]!, points[0]!);
  let path = `M ${firstMid.x} ${firstMid.y}`;

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index]!;
    const next = points[(index + 1) % points.length]!;
    const mid = midpoint(point, next);
    path += ` Q ${point.x} ${point.y} ${mid.x} ${mid.y}`;
  }

  return `${path} Z`;
}

export function buildOpportunityRadarAxisValueLabelPositions(
  values: number[],
): Array<{ x: number; y: number; label: string }> {
  const count = 4;
  const center = 90;
  const radius = 74;
  return Array.from({ length: count }, (_, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / count) * index;
    const value = Math.max(0, Math.min(10, values[index] ?? 0));
    return {
      x: center + (Math.cos(angle) * radius),
      y: center + (Math.sin(angle) * radius) + 3,
      label: value.toFixed(1),
    };
  });
}

export function opportunityStatusClassName(status: OpportunityStatus): string {
  if (status === 'very_high') return 'very-high';
  if (status === 'good') return 'good';
  if (status === 'balanced') return 'balanced';
  if (status === 'competitive') return 'competitive';
  return 'low';
}

export function opportunityStatusLabel(status: OpportunityStatus, locale: Locale): string {
  if (locale === 'de') {
    if (status === 'very_high') return 'Sehr hohe Chance';
    if (status === 'good') return 'Gute Chance';
    if (status === 'balanced') return 'Ausgeglichen';
    if (status === 'competitive') return 'Viele Anbieter';
    return 'Niedrige Chance';
  }

  if (status === 'very_high') return 'Very high opportunity';
  if (status === 'good') return 'Good opportunity';
  if (status === 'balanced') return 'Balanced';
  if (status === 'competitive') return 'Competitive';
  return 'Low opportunity';
}

export function opportunitySummaryLabel(
  key: OpportunitySummaryKey,
  copy: WorkspaceStatisticsModel['copy'],
): string {
  if (key === 'very_high') return copy.opportunitySummaryVeryHigh;
  if (key === 'good') return copy.opportunitySummaryGood;
  if (key === 'balanced_competitive') return copy.opportunitySummaryBalancedCompetitive;
  if (key === 'balanced') return copy.opportunitySummaryBalanced;
  if (key === 'competitive') return copy.opportunitySummaryCompetitive;
  if (key === 'low_demand') return copy.opportunitySummaryLowDemand;
  return copy.opportunitySummaryLow;
}

export function opportunityCardAriaLabel(params: {
  item: OpportunityItem;
  copy: WorkspaceStatisticsModel['copy'];
  locale: Locale;
}): string {
  const { item, copy, locale } = params;
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const status = opportunityStatusLabel(item.status, locale);
  const demand = item.demand.toLocaleString(localeTag);
  const providers = item.providers === null ? '—' : item.providers.toLocaleString(localeTag);
  const balance = item.marketBalanceRatio === null ? '—' : item.marketBalanceRatio.toFixed(2);
  return `${item.city} · ${item.category}. ${copy.opportunityScoreLabel}: ${item.score.toFixed(1)} / 10. ${copy.opportunityDemandLabel}: ${demand}. ${copy.opportunityProvidersLabel}: ${providers}. ${copy.opportunityBalanceLabel}: ${balance}. ${status}.`;
}

function opportunityAxisLabel(
  key: OpportunityMetricKey,
  copy: WorkspaceStatisticsModel['copy'],
): string {
  if (key === 'demand') return copy.opportunityAxisDemand;
  if (key === 'competition') return copy.opportunityAxisCompetition;
  if (key === 'growth') return copy.opportunityAxisGrowth;
  return copy.opportunityAxisActivity;
}

function opportunityMetricSemanticLabel(
  key: OpportunitySemanticKey,
  copy: WorkspaceStatisticsModel['copy'],
): string {
  if (key === 'very_high') return copy.opportunitySemanticVeryHigh;
  if (key === 'high') return copy.opportunitySemanticHigh;
  if (key === 'noticeable') return copy.opportunitySemanticNoticeable;
  if (key === 'medium') return copy.opportunitySemanticMedium;
  return copy.opportunitySemanticLow;
}
