import { describe, expect, it } from 'vitest';

import type { PlatformActivityPoint, PlatformActivityResponse } from '@/lib/api/analytics';
import {
  buildHomePlatformActivityChartModel,
  buildHomePlatformActivityRangeOptions,
  buildHomePlatformActivityViewModel,
  formatHomePlatformActivityPointTime,
  formatHomePlatformActivityUpdatedAt,
  resolveHomePlatformActivityDefaultIndex,
  resolveHomePlatformActivityStatus,
} from '@/components/home/homePlatformActivityPanel.model';

function point(overrides: Partial<PlatformActivityPoint> = {}): PlatformActivityPoint {
  return {
    timestamp: '2026-03-23T12:00:00.000Z',
    requests: 10,
    offers: 4,
    ...overrides,
  };
}

function response(overrides: Partial<PlatformActivityResponse> = {}): PlatformActivityResponse {
  return {
    range: '7d',
    interval: 'day',
    source: 'real',
    updatedAt: '2026-03-23T13:45:00.000Z',
    data: [point(), point({ timestamp: '2026-03-24T12:00:00.000Z', requests: 12, offers: 6 })],
    ...overrides,
  };
}

describe('homePlatformActivityPanel.model', () => {
  it('builds default range options and resolves loading states', () => {
    const t = (key: string) => key;

    expect(buildHomePlatformActivityRangeOptions(t as never).map((item) => item.value)).toEqual(['24h', '7d', '30d']);
    expect(resolveHomePlatformActivityDefaultIndex(3)).toBe(2);
    expect(resolveHomePlatformActivityStatus({ isLoading: true, isError: false, pointsLength: 0 })).toBe('loading');
    expect(resolveHomePlatformActivityStatus({ isLoading: false, isError: true, pointsLength: 0 })).toBe('error');
    expect(resolveHomePlatformActivityStatus({ isLoading: false, isError: false, pointsLength: 0 })).toBe('empty');
    expect(resolveHomePlatformActivityStatus({ isLoading: false, isError: false, pointsLength: 2 })).toBe('ready');
  });

  it('formats point and updated timestamps and builds chart geometry', () => {
    const chart = buildHomePlatformActivityChartModel({
      points: [point({ requests: 5, offers: 2 }), point({ requests: 10, offers: 4 })],
      activeIndex: 1,
    });

    expect(chart.requestsPath).toContain('M 0');
    expect(chart.offersPath).toContain('L 100');
    expect(chart.dots[1]?.requests.r).toBe(1.8);
    expect(chart.hoverZones).toHaveLength(2);
    expect(formatHomePlatformActivityPointTime('2026-03-23T12:00:00.000Z', '24h', 'de')).toContain(':');
    expect(formatHomePlatformActivityUpdatedAt('2026-03-23T13:45:00.000Z', 'de')).toBeTruthy();
  });

  it('builds a ready view model with preformatted content', () => {
    const t = (key: string) => key;
    const viewModel = buildHomePlatformActivityViewModel({
      t: t as never,
      locale: 'de',
      range: '7d',
      response: response(),
      activeIndex: 1,
      isLoading: false,
      isError: false,
      isFetching: true,
    });

    expect(viewModel.status).toBe('ready');
    expect(viewModel.isUpdating).toBe(true);
    expect(viewModel.content?.requestsMetric.label).toBe('homePublic.activityRequests');
    expect(viewModel.content?.requestsMetric.value).toBe('12');
    expect(viewModel.content?.updatedText).toContain('homePublic.activityUpdated');
  });
});
