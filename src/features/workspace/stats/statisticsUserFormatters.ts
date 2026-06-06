import type { WorkspaceStatisticsCopy } from './statistics.copy';

export function formatMetricValue(params: {
  copy: WorkspaceStatisticsCopy;
  value: number | null;
  unit: 'percent' | 'minutes' | 'count';
  formatNumber: Intl.NumberFormat;
}) {
  const { copy, value, unit, formatNumber } = params;
  if (value === null || !Number.isFinite(value)) return '—';
  if (unit === 'percent') return `${Math.round(value)}%`;
  if (unit === 'minutes') return `${Math.round(value)} ${copy.activityMinutesShortLabel}`;
  return formatNumber.format(Math.round(value));
}

export function formatDelta(params: {
  copy: WorkspaceStatisticsCopy;
  userValue: number | null;
  marketValue: number | null;
  unit: 'percent' | 'minutes' | 'count';
  formatNumber: Intl.NumberFormat;
}) {
  const { copy, userValue, marketValue, unit, formatNumber } = params;
  if (userValue === null || marketValue === null) return '—';
  const delta = userValue - marketValue;
  if (Math.abs(delta) < 0.01) return copy.userAtMarketLevelLabel;
  if (unit === 'percent') return `${delta > 0 ? '+' : ''}${Math.round(delta)} pp`;
  if (unit === 'minutes') return `${delta > 0 ? '+' : ''}${Math.round(delta)} ${copy.activityMinutesShortLabel}`;
  return `${delta > 0 ? '+' : ''}${formatNumber.format(Math.round(delta))}`;
}

export function formatCurrencyMetric(value: number | null, formatCurrency: Intl.NumberFormat) {
  if (value === null || !Number.isFinite(value)) return '—';
  return formatCurrency.format(value);
}

export function formatCurrencyDelta(params: {
  copy: WorkspaceStatisticsCopy;
  userValue: number | null;
  marketValue: number | null;
  formatCurrency: Intl.NumberFormat;
}) {
  const { copy, userValue, marketValue, formatCurrency } = params;
  if (userValue === null || marketValue === null) return '—';
  const delta = userValue - marketValue;
  if (Math.abs(delta) < 0.01) return copy.userAtMarketLevelLabel;
  const absLabel = formatCurrency.format(Math.abs(delta));
  return delta > 0 ? `+${absLabel}` : `-${absLabel}`;
}

