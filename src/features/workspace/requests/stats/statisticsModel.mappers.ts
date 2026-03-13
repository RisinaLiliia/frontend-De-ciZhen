import type { KpiCardTrend } from '@/components/ui/KpiCard';
import type { PlatformActivityRange } from '@/lib/api/analytics';
import type {
  WorkspaceStatisticsActivityMetricsDto,
  WorkspaceStatisticsActivityPointDto,
  WorkspaceStatisticsActivityTotalsDto,
  WorkspaceStatisticsInsightDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';

export function formatDateLabel(timestamp: string, range: WorkspaceStatisticsRange, locale: Locale) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return timestamp;
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  if (range === '24h') {
    return new Intl.DateTimeFormat(localeTag, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
  return new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatDateTimeLabel(timestamp: string | null | undefined, locale: Locale) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return '—';
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  return new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDecisionUpdatedAtLabel(timestamp: string | null | undefined, locale: Locale) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return '—';

  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const parts = new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: locale === 'de' ? 'long' : 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const day = parts.find((part) => part.type === 'day')?.value ?? '—';
  const month = parts.find((part) => part.type === 'month')?.value ?? '—';
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '—';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '—';

  if (locale === 'de') {
    return `${day}. ${month} · ${hour}:${minute}`;
  }

  return `${month} ${day} · ${hour}:${minute}`;
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${Math.max(0, Math.round(value))}%`;
}

export function formatMinutes(value: number | null, locale: Locale) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '—';
  return locale === 'de' ? `~${Math.round(value)} Min.` : `~${Math.round(value)} min`;
}

function formatInsightMetricKey(key: string, locale: Locale): string {
  if (key === 'requests') return locale === 'de' ? 'Anfragen' : 'Requests';
  if (key === 'providers') return locale === 'de' ? 'Anbieter' : 'Providers';
  if (key === 'ratio') return locale === 'de' ? 'Verhältnis' : 'Ratio';
  if (key === 'sharePercent') return locale === 'de' ? 'Anteil' : 'Share';
  if (key === 'responseMinutes') return locale === 'de' ? 'Antwortzeit' : 'Response time';
  if (key === 'successRatePercent') return locale === 'de' ? 'Erfolgsquote' : 'Success rate';
  if (key === 'profileCompleteness') return locale === 'de' ? 'Profil' : 'Profile';
  if (key === 'providerSearchCount') return locale === 'de' ? 'Anbieter-Suchen' : 'Provider searches';
  if (key === 'unansweredRequests24h') return locale === 'de' ? 'Offen >24h' : 'Open >24h';
  return key;
}

export function formatInsightEvidence(
  metrics: Array<{ key: string; value: string | number }> | undefined,
  locale: Locale,
  formatNumber: Intl.NumberFormat,
): string | undefined {
  if (!Array.isArray(metrics) || metrics.length === 0) return undefined;
  const tokens = metrics.slice(0, 3).map((metric) => {
    const label = formatInsightMetricKey(metric.key, locale);
    const value = typeof metric.value === 'number' ? formatNumber.format(metric.value) : metric.value;
    return `${label}: ${value}`;
  });
  return tokens.length > 0 ? tokens.join(' · ') : undefined;
}

export function buildSupplementalInsights(params: {
  data: WorkspaceStatisticsOverviewSourceDto;
  mode: 'platform' | 'personalized';
}): WorkspaceStatisticsInsightDto[] {
  const { data, mode } = params;
  const list: WorkspaceStatisticsInsightDto[] = [];
  const topCategory = data.demand.categories[0];
  const topCity = data.demand.cities[0];

  if (topCategory && topCategory.requestCount > 0) {
    list.push({
      level: 'trend',
      code: 'top_category_demand',
      context: topCategory.categoryName,
      type: 'demand',
      priority: 'medium',
      score: 60,
      title: `Hohe Nachfrage in ${topCategory.categoryName}`,
      body: `Die Kategorie ${topCategory.categoryName} zeigt aktuell besonders hohe Nachfrage.`,
      metrics: [
        { key: 'requests', value: topCategory.requestCount },
        { key: 'sharePercent', value: topCategory.sharePercent },
      ],
    });
  }

  if (topCity && topCity.requestCount > 0) {
    const auftragSuchenCount = Math.max(0, Math.round(topCity.auftragSuchenCount ?? 0));
    const anbieterSuchenCount = Math.max(0, Math.round(topCity.anbieterSuchenCount ?? 0));
    const marketBalanceRatio = auftragSuchenCount > 0
      ? anbieterSuchenCount / Math.max(1, auftragSuchenCount)
      : null;

    list.push({
      level: 'info',
      code: 'top_city_demand',
      context: topCity.cityName,
      type: 'demand',
      priority: 'medium',
      score: 58,
      title: `Starke Nachfrage in ${topCity.cityName}`,
      body: `In ${topCity.cityName} ist die Nachfrage aktuell am höchsten.`,
      metrics: [
        { key: 'requests', value: topCity.requestCount },
        ...(marketBalanceRatio !== null ? [{ key: 'ratio', value: Number(marketBalanceRatio.toFixed(2)) }] : []),
      ],
    });

    if (marketBalanceRatio !== null && marketBalanceRatio >= 1.4) {
      list.push({
        level: 'trend',
        code: 'best_market_chance',
        context: topCity.cityName,
        type: 'opportunity',
        priority: 'high',
        score: 72,
        title: 'Beste Marktchance',
        body: `${topCity.cityName} zeigt aktuell die beste Kombination aus Nachfrage und geringer Konkurrenz.`,
        metrics: [
          { key: 'ratio', value: Number(marketBalanceRatio.toFixed(2)) },
          { key: 'requests', value: topCity.requestCount },
        ],
      });
    }
  }

  if (mode === 'personalized' && (data.kpis.successRate ?? 0) >= 70) {
    list.push({
      level: 'trend',
      code: 'high_completion_rate',
      context: String(data.kpis.successRate ?? 0),
      type: 'performance',
      priority: 'medium',
      score: 68,
      title: 'Hohe Erfolgsquote',
      body: 'Nach Vertragsabschluss werden deine Aufträge sehr häufig erfolgreich abgeschlossen.',
      metrics: [{ key: 'successRatePercent', value: data.kpis.successRate ?? 0 }],
    });
  }

  return list;
}

export function toHint(
  value: number,
  baseline: number,
  range: WorkspaceStatisticsRange,
  locale: Locale,
) {
  const context =
    locale === 'de'
      ? range === '24h'
        ? 'heute'
        : range === '7d'
          ? 'diese Woche'
          : range === '30d'
            ? 'diesen Monat'
            : 'in 90 Tagen'
      : range === '24h'
        ? 'today'
        : range === '7d'
          ? 'this week'
          : range === '30d'
            ? 'this month'
            : 'in 90 days';

  if (baseline <= 0) {
    if (value <= 0) return locale === 'de' ? 'Trend stabil' : 'Trend stable';
    return locale === 'de' ? `+${value} neu ${context}` : `+${value} new ${context}`;
  }
  const delta = value - baseline;
  if (delta === 0) return locale === 'de' ? 'Trend stabil' : 'Trend stable';
  if (locale === 'de') {
    return `${delta > 0 ? '+' : ''}${delta} seit letzter Periode`;
  }
  return `${delta > 0 ? '+' : ''}${delta} since last period`;
}

export function toTrend(value: number, baseline: number): KpiCardTrend {
  if (baseline <= 0) {
    if (value <= 0) return { direction: 'flat', percent: 0 };
    return { direction: 'up', percent: 100 };
  }
  const percent = Math.round(((value - baseline) / baseline) * 100);
  if (percent > 0) return { direction: 'up', percent };
  if (percent < 0) return { direction: 'down', percent };
  return { direction: 'flat', percent: 0 };
}

export function resolveCitySignal(params: {
  requestCount: number;
  auftragSuchenCount: number;
  anbieterSuchenCount: number;
}): 'high' | 'medium' | 'low' | 'none' {
  const demandActivity = Math.max(0, params.anbieterSuchenCount) || Math.max(0, params.requestCount);
  const supplyActivity = Math.max(0, params.auftragSuchenCount);
  if (demandActivity <= 0 && supplyActivity <= 0) return 'none';
  const pressure = demandActivity / Math.max(1, supplyActivity);
  if (pressure >= 1.25) return 'high';
  if (pressure <= 0.8) return 'low';
  return 'medium';
}

export function resolveMarketBalanceRatio(params: {
  requestCount: number;
  auftragSuchenCount: number;
  anbieterSuchenCount: number;
}): number {
  const demandActivity = Math.max(0, params.anbieterSuchenCount) || Math.max(0, params.requestCount);
  const supplyActivity = Math.max(0, params.auftragSuchenCount);
  if (demandActivity <= 0 && supplyActivity <= 0) return 0;
  return demandActivity / Math.max(1, supplyActivity);
}

export function formatReviewCountHint(count: number, locale: Locale, formatNumber: Intl.NumberFormat): string {
  if (locale === 'de') {
    return `${formatNumber.format(count)} ${count === 1 ? 'Bewertung' : 'Bewertungen'}`;
  }
  return `${formatNumber.format(count)} ${count === 1 ? 'review' : 'reviews'}`;
}

export function normalizeLegacyRange(range: WorkspaceStatisticsRange): PlatformActivityRange {
  if (range === '24h' || range === '7d' || range === '30d') return range;
  return '30d';
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function formatFallbackRangeLabel(range: WorkspaceStatisticsRange): string {
  if (range === '24h') return '24h';
  if (range === '7d') return '7 Tage';
  if (range === '90d') return '90 Tage';
  return '30 Tage';
}

export function toActivityTotals(points: WorkspaceStatisticsActivityPointDto[]): WorkspaceStatisticsActivityTotalsDto {
  const requestsTotal = points.reduce((sum, point) => sum + point.requests, 0);
  const offersTotal = points.reduce((sum, point) => sum + point.offers, 0);
  const latest = points[points.length - 1] ?? null;
  const previous = points[points.length - 2] ?? null;

  const peak = points.reduce<{ timestamp: string; score: number } | null>((acc, point) => {
    const score = point.requests + point.offers;
    if (!acc || score > acc.score) return { timestamp: point.timestamp, score };
    return acc;
  }, null);

  const bestWindow = points.reduce<{ timestamp: string; requests: number } | null>((acc, point) => {
    if (!acc || point.requests > acc.requests) {
      return { timestamp: point.timestamp, requests: point.requests };
    }
    return acc;
  }, null);

  return {
    requestsTotal,
    offersTotal,
    latestRequests: latest?.requests ?? 0,
    latestOffers: latest?.offers ?? 0,
    previousRequests: previous?.requests ?? 0,
    previousOffers: previous?.offers ?? 0,
    peakTimestamp: peak?.timestamp ?? null,
    bestWindowTimestamp: bestWindow?.timestamp ?? null,
  };
}

export function toFallbackActivityMetrics(params: {
  totals: WorkspaceStatisticsActivityTotalsDto;
  completedJobs: number;
  takeRatePercent?: number;
}): WorkspaceStatisticsActivityMetricsDto {
  const takeRatePercent = Number.isFinite(params.takeRatePercent ?? Number.NaN)
    ? Math.max(0, Number(params.takeRatePercent))
    : 10;
  const offerRatePercent = clampPercent(
    (params.totals.offersTotal / Math.max(1, params.totals.requestsTotal)) * 100,
  );
  const completedJobs = Math.max(0, Math.round(params.completedJobs));
  const gmvAmount = 0;
  return {
    offerRatePercent,
    responseMedianMinutes: null,
    unansweredRequests24h: 0,
    cancellationRatePercent: 0,
    completedJobs,
    gmvAmount,
    platformRevenueAmount: 0,
    takeRatePercent,
    offerRateTone: 'neutral',
    responseMedianTone: 'neutral',
    unansweredTone: 'positive',
    cancellationTone: 'neutral',
    completedTone: completedJobs > 0 ? 'positive' : 'neutral',
    revenueTone: 'neutral',
  };
}

export function buildInsightsFromFallback(params: {
  mode: 'platform' | 'personalized';
  profileCompleteness: number | null;
  successRate: number;
  avgResponseMinutes: number | null;
  topCategoryName: string | null;
  topCityName: string | null;
}): WorkspaceStatisticsInsightDto[] {
  const next: WorkspaceStatisticsInsightDto[] = [];

  if (params.mode === 'personalized' && params.profileCompleteness !== null && params.profileCompleteness < 80) {
    next.push({
      level: 'warning',
      code: 'profile_incomplete',
      context: String(params.profileCompleteness),
      title: 'Profil verbessern',
    });
  }
  if (params.mode === 'personalized' && params.successRate < 25) {
    next.push({
      level: 'warning',
      code: 'low_success_rate',
      context: String(params.successRate),
      title: 'Potenzial bei Abschlüssen',
    });
  }
  if (params.mode === 'personalized' && params.avgResponseMinutes !== null) {
    if (params.avgResponseMinutes <= 30) {
      next.push({
        level: 'trend',
        code: 'strong_response_time',
        context: String(Math.round(params.avgResponseMinutes)),
        title: 'Schnelle Reaktionszeit',
      });
    } else {
      next.push({
        level: 'info',
        code: 'slow_response_time',
        context: String(Math.round(params.avgResponseMinutes)),
        title: 'Antwortzeit optimieren',
      });
    }
  }
  if (params.topCategoryName) {
    next.push({
      level: 'trend',
      code: 'high_category_demand',
      context: params.topCategoryName,
      title: 'Hohe Nachfrage in Kategorie',
    });
  }
  if (params.topCityName) {
    next.push({
      level: 'info',
      code: 'top_city_demand',
      context: params.topCityName,
      title: 'Starke Nachfrage nach Stadt',
    });
  }

  if (next.length === 0) {
    return [{ level: 'info', code: 'insufficient_data', context: null, title: 'Noch nicht genug Daten' }];
  }
  return next.slice(0, 4);
}
