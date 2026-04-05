import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';

function createCategories(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const rank = index + 1;
    return {
      categoryKey: `cat-${rank}`,
      categoryName: `Category ${rank}`,
      requestCount: Math.max(1, 20 - rank),
      sharePercent: Math.max(1, 30 - rank),
    };
  });
}

function createCities(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const rank = index + 1;
    const requestCount = count - index;
    return {
      citySlug: `city-${rank}`,
      cityName: `City ${String(rank).padStart(2, '0')}`,
      cityId: `city-${rank}-id`,
      requestCount,
      auftragSuchenCount: Math.max(1, Math.round(requestCount * 0.8)),
      anbieterSuchenCount: Math.max(1, Math.round(requestCount * 1.2)),
      lat: 50 + index * 0.01,
      lng: 8 + index * 0.01,
    };
  });
}

function createWorkspaceStatistics(range: string) {
  const categories = createCategories(9);
  const cities = createCities(18);
  const insightBody = range === '7d'
    ? 'Insight body 7d'
    : range === '24h'
      ? 'Insight body 24h'
      : range === '90d'
        ? 'Insight body 90d'
        : 'Insight body 30d';

  return {
    updatedAt: '2026-03-11T10:00:00.000Z',
    mode: 'platform',
    range,
    summary: {
      totalPublishedRequests: 120,
      totalActiveProviders: 44,
      totalActiveCities: 18,
      platformRatingAvg: 5,
      platformRatingCount: 16,
    },
    kpis: {
      requestsTotal: 120,
      offersTotal: 75,
      completedJobsTotal: 28,
      successRate: 37,
      avgResponseMinutes: 24,
      profileCompleteness: null,
      openRequests: null,
      recentOffers7d: null,
    },
    activity: {
      range,
      interval: range === '24h' ? 'hour' : 'day',
      points: [
        { timestamp: '2026-03-10T09:00:00.000Z', requests: 10, offers: 6 },
        { timestamp: '2026-03-11T09:00:00.000Z', requests: 12, offers: 7 },
      ],
      totals: {
        requestsTotal: 22,
        offersTotal: 13,
        latestRequests: 12,
        latestOffers: 7,
        previousRequests: 10,
        previousOffers: 6,
        peakTimestamp: '2026-03-11T09:00:00.000Z',
        bestWindowTimestamp: '2026-03-11T09:00:00.000Z',
      },
      metrics: {
        offerRatePercent: 59,
        responseMedianMinutes: 24,
        unansweredRequests24h: 2,
        cancellationRatePercent: 6,
        completedJobs: 28,
        gmvAmount: 15105,
        platformRevenueAmount: 1511,
        takeRatePercent: 10,
      },
    },
    demand: {
      categories,
      cities,
    },
    profileFunnel: {
      periodLabel: '30 Tage',
      stage1: 120,
      stage2: 75,
      stage3: 52,
      stage4: 28,
      requestsTotal: 120,
      offersTotal: 75,
      confirmedResponsesTotal: 52,
      closedContractsTotal: 34,
      completedJobsTotal: 28,
      profitAmount: 15105,
      offerResponseRatePercent: 63,
      confirmationRatePercent: 69,
      contractClosureRatePercent: 65,
      completionRatePercent: 82,
      conversionRate: 23,
      totalConversionPercent: 23,
      summaryText: 'Von 120 Anfragen wurden 28 erfolgreich abgeschlossen.',
      stages: [],
    },
    insights: [
      {
        level: 'info',
        code: 'custom_insight',
        context: null,
        title: 'Dynamic insight',
        body: insightBody,
        score: 80,
      },
    ],
    growthCards: [
      { key: 'highlight_profile', href: '/workspace?section=profile' },
      { key: 'local_ads', href: '/workspace?section=requests' },
      { key: 'premium_tools', href: '/provider/onboarding' },
    ],
  };
}

function createWorkspacePublicOverview() {
  return {
    updatedAt: '2026-03-11T10:00:00.000Z',
    summary: {
      totalPublishedRequests: 120,
      totalActiveProviders: 44,
    },
    activity: {
      range: '30d',
      interval: 'day',
      source: 'real',
      data: [
        { timestamp: '2026-03-10T09:00:00.000Z', requests: 10, offers: 6 },
        { timestamp: '2026-03-11T09:00:00.000Z', requests: 12, offers: 7 },
      ],
      updatedAt: '2026-03-11T10:00:00.000Z',
    },
    cityActivity: {
      totalActiveCities: 18,
      totalActiveRequests: 120,
      items: createCities(18).map((city) => ({
        citySlug: city.citySlug,
        cityName: city.cityName,
        cityId: city.cityId,
        requestCount: city.requestCount,
        lat: city.lat,
        lng: city.lng,
      })),
    },
    requests: {
      items: [],
      total: 120,
      page: 1,
      limit: 80,
    },
  };
}

test('workspace stats smoke: range switch + demand/city pagination', async ({ page }) => {
  const statsRangesRequested: string[] = [];

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const jsonHeaders = { 'content-type': 'application/json' };

    if (path === '/api/workspace/statistics') {
      const range = url.searchParams.get('range') ?? '30d';
      statsRangesRequested.push(range);
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(createWorkspaceStatistics(range)),
      });
    }

    if (path === '/api/workspace/public') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(createWorkspacePublicOverview()),
      });
    }

    if (path === '/api/reviews/platform/overview') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          items: [],
          total: 1,
          limit: 1,
          offset: 0,
          summary: {
            total: 1,
            averageRating: 5,
            distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 1 },
          },
        }),
      });
    }

    if (path === '/api/auth/refresh' || path === '/api/workspace/private') {
      return route.fulfill({
        status: 401,
        headers: jsonHeaders,
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    }

    if (path === '/api/services' || path === '/api/catalog/services' || path === '/api/cities' || path === '/api/catalog/cities' || path === '/api/providers') {
      return route.fulfill({ status: 200, headers: jsonHeaders, body: JSON.stringify([]) });
    }

    if (path === '/api/requests/public') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ items: [], total: 120, page: 1, limit: 20 }),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  await page.goto('/workspace?section=stats');
  await dismissCookieConsentIfPresent(page);

  await expect(page.locator('.workspace-statistics')).toBeVisible();
  await expect(page.locator('.skeleton')).toHaveCount(0);
  await expect(page.locator('.workspace-statistics-insights')).toContainText('Insight body 30d');

  const demandPanel = page.locator('.workspace-statistics__demand-pagination');
  await expect(demandPanel).toBeVisible();
  await demandPanel.locator('button').nth(1).click();
  await expect(page.locator('.workspace-statistics-demand__label').first()).toContainText('Category 7');

  const cityPanel = page.locator('.workspace-statistics__cities-pagination');
  await expect(cityPanel).toBeVisible();
  await cityPanel.locator('button').nth(1).click();
  await expect(page.locator('.workspace-statistics-city-list__item').first()).toContainText('City 11');

  const rangeToolbar = page.locator('.workspace-shared-context-controls__desktop .home-activity__ranges').first();
  await expect(rangeToolbar).toBeVisible();
  await rangeToolbar.getByRole('button', { name: /7 Tage|7 days/i }).click();
  await expect(page.locator('.skeleton')).toHaveCount(0);
  await expect(page.locator('.workspace-statistics-insights')).toContainText('Insight body 7d');

  expect(statsRangesRequested).toContain('30d');
  expect(statsRangesRequested).toContain('7d');
});
