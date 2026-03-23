import type { PlatformActivityPoint, PlatformActivityRange, PlatformActivityResponse } from '@/lib/api/analytics';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type Translator = (key: I18nKey) => string;

export type HomePlatformActivityChartDotModel = {
  key: string;
  requests: { cx: number; cy: number; r: number };
  offers: { cx: number; cy: number; r: number };
};

export type HomePlatformActivityChartHoverZoneModel = {
  key: string;
  index: number;
  x: number;
  width: number;
};

export type HomePlatformActivityChartModel = {
  width: number;
  height: number;
  viewBox: string;
  requestsPath: string;
  offersPath: string;
  dots: HomePlatformActivityChartDotModel[];
  hoverZones: HomePlatformActivityChartHoverZoneModel[];
};

export type HomePlatformActivityPanelViewModel = {
  title: string;
  subtitle: string;
  groupLabel: string;
  range: PlatformActivityRange;
  rangeOptions: Array<{ value: PlatformActivityRange; label: string }>;
  status: 'loading' | 'error' | 'empty' | 'ready';
  isUpdating: boolean;
  errorLabel: string;
  emptyLabel: string;
  content: null | {
    chart: HomePlatformActivityChartModel;
    pointTime: string;
    requestsMetric: { label: string; value: string };
    offersMetric: { label: string; value: string };
    updatedText: string | null;
  };
};

export function resolveHomePlatformActivityDefaultIndex(pointsLength: number) {
  return Math.max(0, pointsLength - 1);
}

export function buildHomePlatformActivityRangeOptions(t: Translator) {
  return [
    { value: '24h' as const, label: t(I18N_KEYS.homePublic.activityRange24h) },
    { value: '7d' as const, label: t(I18N_KEYS.homePublic.activityRange7d) },
    { value: '30d' as const, label: t(I18N_KEYS.homePublic.activityRange30d) },
  ];
}

export function resolveHomePlatformActivityStatus(params: {
  isLoading: boolean;
  isError: boolean;
  pointsLength: number;
}) {
  if (params.isLoading && params.pointsLength === 0) return 'loading' as const;
  if (params.isError && params.pointsLength === 0) return 'error' as const;
  if (params.pointsLength === 0) return 'empty' as const;
  return 'ready' as const;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildActivityLinePath(points: PlatformActivityPoint[], step: number, toY: (value: number) => number, key: 'requests' | 'offers') {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point[key])}`)
    .join(' ');
}

export function buildHomePlatformActivityChartModel(params: {
  points: PlatformActivityPoint[];
  activeIndex: number;
}): HomePlatformActivityChartModel {
  const width = 100;
  const height = 100;
  const top = 10;
  const bottom = 85;
  const maxValue = Math.max(1, ...params.points.flatMap((point) => [point.requests, point.offers]));
  const step = width / Math.max(params.points.length - 1, 1);
  const toY = (value: number) => bottom - (value / maxValue) * (bottom - top);

  return {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    requestsPath: buildActivityLinePath(params.points, step, toY, 'requests'),
    offersPath: buildActivityLinePath(params.points, step, toY, 'offers'),
    dots: params.points.map((point, index) => ({
      key: `${point.timestamp}-${index}`,
      requests: {
        cx: index * step,
        cy: toY(point.requests),
        r: params.activeIndex === index ? 1.8 : 0.85,
      },
      offers: {
        cx: index * step,
        cy: toY(point.offers),
        r: params.activeIndex === index ? 1.8 : 0.85,
      },
    })),
    hoverZones: params.points.map((point, index) => {
      const left = index === 0 ? 0 : index * step - step / 2;
      const right = index === params.points.length - 1 ? width : index * step + step / 2;
      return {
        key: `${point.timestamp}-${index}-hover`,
        index,
        x: clamp(left, 0, width),
        width: clamp(right, 0, width) - clamp(left, 0, width),
      };
    }),
  };
}

export function formatHomePlatformActivityPointTime(timestamp: string, range: PlatformActivityRange, locale: Locale): string {
  const date = new Date(timestamp);
  const intlLocale = locale === 'de' ? 'de-DE' : 'en-US';
  if (Number.isNaN(date.getTime())) return timestamp;

  if (range === '24h') {
    return new Intl.DateTimeFormat(intlLocale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat(intlLocale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatHomePlatformActivityUpdatedAt(updatedAt: string | undefined, locale: Locale) {
  if (!updatedAt) return null;

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function buildHomePlatformActivityContent(params: {
  t: Translator;
  locale: Locale;
  range: PlatformActivityRange;
  response: PlatformActivityResponse;
  activeIndex: number;
}) {
  const points = params.response.data;
  const safeIndex = clamp(params.activeIndex, 0, Math.max(points.length - 1, 0));
  const activePoint = points[safeIndex] ?? points[points.length - 1] ?? null;

  if (!activePoint) {
    return null;
  }

  const updatedAt = formatHomePlatformActivityUpdatedAt(params.response.updatedAt, params.locale);

  return {
    chart: buildHomePlatformActivityChartModel({
      points,
      activeIndex: safeIndex,
    }),
    pointTime: formatHomePlatformActivityPointTime(activePoint.timestamp, params.range, params.locale),
    requestsMetric: {
      label: params.t(I18N_KEYS.homePublic.activityRequests),
      value: String(activePoint.requests),
    },
    offersMetric: {
      label: params.t(I18N_KEYS.homePublic.activityOffers),
      value: String(activePoint.offers),
    },
    updatedText: updatedAt
      ? `${params.t(I18N_KEYS.homePublic.activityUpdated)}: ${updatedAt}`
      : null,
  };
}

export function buildHomePlatformActivityViewModel(params: {
  t: Translator;
  locale: Locale;
  range: PlatformActivityRange;
  response?: PlatformActivityResponse;
  activeIndex: number;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
}): HomePlatformActivityPanelViewModel {
  const points = params.response?.data ?? [];
  const status = resolveHomePlatformActivityStatus({
    isLoading: params.isLoading,
    isError: params.isError,
    pointsLength: points.length,
  });

  return {
    title: params.t(I18N_KEYS.homePublic.activityTitle),
    subtitle: params.t(I18N_KEYS.homePublic.activitySubtitle),
    groupLabel: params.t(I18N_KEYS.homePublic.activityTitle),
    range: params.range,
    rangeOptions: buildHomePlatformActivityRangeOptions(params.t),
    status,
    isUpdating: params.isFetching && points.length > 0,
    errorLabel: params.t(I18N_KEYS.homePublic.activityError),
    emptyLabel: params.t(I18N_KEYS.homePublic.activityEmpty),
    content:
      status === 'ready' && params.response
        ? buildHomePlatformActivityContent({
            t: params.t,
            locale: params.locale,
            range: params.range,
            response: params.response,
            activeIndex: params.activeIndex,
          })
        : null,
  };
}
