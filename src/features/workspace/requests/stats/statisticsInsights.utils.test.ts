import { describe, expect, it } from 'vitest';

import type {
  WorkspacePublicCityActivityItemDto,
  WorkspaceStatisticsInsightDto,
} from '@/lib/api/dto/workspace';
import {
  inferInsightType,
  mergeFullCityRanking,
  mergeInsightsByIdentity,
  selectInsightsForDisplay,
  type WorkspaceStatisticsCitySearchSignalDto,
} from './statisticsInsights.utils';

function insight(
  overrides: Partial<WorkspaceStatisticsInsightDto> = {},
): WorkspaceStatisticsInsightDto {
  return {
    level: 'info',
    code: 'insight_default',
    context: null,
    ...overrides,
  };
}

describe('statisticsInsights.utils', () => {
  describe('inferInsightType', () => {
    it('prefers explicit type from API', () => {
      expect(inferInsightType(insight({ type: 'growth' }))).toBe('growth');
    });

    it('infers type from code patterns', () => {
      expect(inferInsightType(insight({ code: 'city_opportunity_high' }))).toBe('opportunity');
      expect(inferInsightType(insight({ code: 'profile_missing_photo' }))).toBe('growth');
      expect(inferInsightType(insight({ code: 'slow_response_time' }))).toBe('performance');
      expect(inferInsightType(insight({ code: 'high_unanswered_requests' }))).toBe('risk');
      expect(inferInsightType(insight({ code: 'local_ads_opportunity' }))).toBe('promotion');
      expect(inferInsightType(insight({ code: 'top_category_demand' }))).toBe('demand');
      expect(inferInsightType(insight({ code: 'unknown_signal' }))).toBe('other');
    });
  });

  describe('mergeInsightsByIdentity', () => {
    it('deduplicates by code+context and keeps highest score', () => {
      const merged = mergeInsightsByIdentity([
        insight({ code: 'top_city_demand', context: ' Berlin ', score: 61, title: 'first' }),
        insight({ code: 'top_city_demand', context: 'berlin', score: 74, title: 'second' }),
        insight({ code: 'top_city_demand', context: 'Munich', score: 52, title: 'third' }),
      ]);

      expect(merged).toHaveLength(2);
      const berlin = merged.find((item) => item.context?.trim().toLowerCase() === 'berlin');
      expect(berlin?.score).toBe(74);
      expect(berlin?.title).toBe('second');
    });
  });

  describe('selectInsightsForDisplay', () => {
    it('returns balanced top-4 for personalized mode', () => {
      const selected = selectInsightsForDisplay(
        [
          insight({
            code: 'city_opportunity_high',
            context: 'Berlin',
            type: 'opportunity',
            score: 91,
          }),
          insight({
            code: 'top_category_demand',
            context: 'Cleaning',
            type: 'demand',
            score: 86,
          }),
          insight({
            code: 'user_fast_response',
            context: '25',
            type: 'performance',
            score: 84,
          }),
          insight({
            code: 'profile_missing_photo',
            context: '0',
            type: 'growth',
            score: 82,
          }),
          insight({
            code: 'local_ads_opportunity',
            context: 'Berlin',
            type: 'promotion',
            score: 80,
          }),
          insight({
            code: 'high_unanswered_requests',
            context: '9',
            type: 'risk',
            score: 78,
          }),
        ],
        'personalized',
      );

      expect(selected).toHaveLength(4);
      expect(selected.some((item) => inferInsightType(item) === 'performance')).toBe(true);
      expect(selected.some((item) => inferInsightType(item) === 'growth')).toBe(true);
      expect(selected.filter((item) => inferInsightType(item) === 'promotion')).toHaveLength(1);
    });

    it('limits repeated city context to two insights in platform mode', () => {
      const selected = selectInsightsForDisplay(
        [
          insight({
            code: 'city_opportunity_high',
            context: 'Berlin',
            type: 'opportunity',
            score: 95,
          }),
          insight({
            code: 'top_city_demand',
            context: 'Berlin',
            type: 'demand',
            score: 92,
          }),
          insight({
            code: 'city_pressure_signal',
            context: 'Berlin',
            type: 'opportunity',
            score: 90,
          }),
          insight({
            code: 'high_unanswered_requests',
            context: '22',
            type: 'risk',
            score: 74,
          }),
          insight({
            code: 'local_ads_opportunity',
            context: 'Berlin',
            type: 'promotion',
            score: 72,
          }),
        ],
        'platform',
      );

      const berlinCityInsights = selected.filter(
        (item) =>
          item.context?.toLowerCase() === 'berlin' &&
          (item.code.includes('city') || item.code.includes('top_city')),
      );

      expect(selected).toHaveLength(4);
      expect(berlinCityInsights).toHaveLength(2);
      expect(selected.some((item) => item.code === 'city_pressure_signal')).toBe(false);
      expect(selected.filter((item) => inferInsightType(item) === 'promotion')).toHaveLength(1);
      expect(selected.filter((item) => inferInsightType(item) === 'risk')).toHaveLength(1);
    });
  });

  describe('mergeFullCityRanking', () => {
    it('sorts by public ranking and merges search metrics by slug', () => {
      const statsCities: WorkspaceStatisticsCitySearchSignalDto[] = [
        {
          citySlug: 'berlin',
          cityName: 'Berlin',
          cityId: 'berlin-id',
          requestCount: 4,
          lat: 52.52,
          lng: 13.405,
          auftragSuchenCount: 8,
          anbieterSuchenCount: 16,
        },
      ];

      const publicCities: WorkspacePublicCityActivityItemDto[] = [
        {
          citySlug: 'karlsruhe',
          cityName: 'Karlsruhe',
          cityId: 'karlsruhe-id',
          requestCount: 7,
          lat: 49.0069,
          lng: 8.4037,
        },
        {
          citySlug: 'berlin',
          cityName: 'Berlin',
          cityId: 'berlin-id',
          requestCount: 12,
          lat: 52.52,
          lng: 13.405,
        },
      ];

      const merged = mergeFullCityRanking({ statsCities, publicCities });

      expect(merged.map((item) => item.citySlug)).toEqual(['berlin', 'karlsruhe']);
      expect(merged[0]).toMatchObject({
        requestCount: 12,
        auftragSuchenCount: 8,
        anbieterSuchenCount: 16,
        marketBalanceRatio: 2,
        signal: 'high',
      });
      expect(merged[1]).toMatchObject({
        requestCount: 7,
        auftragSuchenCount: undefined,
        anbieterSuchenCount: undefined,
        marketBalanceRatio: null,
        signal: 'none',
      });
    });

    it('falls back to city name matching when slug differs', () => {
      const statsCities: WorkspaceStatisticsCitySearchSignalDto[] = [
        {
          citySlug: 'berlin-de',
          cityName: 'Berlin',
          cityId: 'berlin-stats',
          requestCount: 5,
          lat: 52.52,
          lng: 13.405,
          auftragSuchenCount: 9,
          anbieterSuchenCount: 18,
        },
      ];

      const merged = mergeFullCityRanking({
        statsCities,
        publicCities: [
          {
            citySlug: 'berlin',
            cityName: 'Berlin',
            cityId: 'berlin-public',
            requestCount: 11,
            lat: 52.52,
            lng: 13.405,
          },
        ],
      });

      expect(merged).toHaveLength(1);
      expect(merged[0]).toMatchObject({
        citySlug: 'berlin',
        requestCount: 11,
        auftragSuchenCount: 9,
        anbieterSuchenCount: 18,
        marketBalanceRatio: 2,
        signal: 'high',
      });
    });
  });
});
