import { expect, test } from '@playwright/test';

test('workspace public map expands a cluster into city markers on click', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const jsonHeaders = { 'content-type': 'application/json' };

    if (path === '/api/workspace/public') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          updatedAt: '2026-03-04T12:00:00.000Z',
          summary: {
            totalPublishedRequests: 28,
            totalActiveProviders: 44,
          },
          activity: {
            range: '30d',
            interval: 'day',
            source: 'real',
            updatedAt: '2026-03-04T12:00:00.000Z',
            data: [],
          },
          cityActivity: {
            totalActiveCities: 8,
            totalActiveRequests: 28,
            items: [
              { citySlug: 'mannheim-1', cityName: 'Mannheim', cityId: 'm1', requestCount: 5, lat: 49.4875, lng: 8.466 },
              { citySlug: 'mannheim-2', cityName: 'Mannheim', cityId: 'm2', requestCount: 4, lat: 49.488, lng: 8.4664 },
              { citySlug: 'mannheim-3', cityName: 'Mannheim', cityId: 'm3', requestCount: 4, lat: 49.4884, lng: 8.4668 },
              { citySlug: 'mannheim-4', cityName: 'Mannheim', cityId: 'm4', requestCount: 3, lat: 49.4888, lng: 8.4672 },
              { citySlug: 'mannheim-5', cityName: 'Mannheim', cityId: 'm5', requestCount: 3, lat: 49.4892, lng: 8.4676 },
              { citySlug: 'mannheim-6', cityName: 'Mannheim', cityId: 'm6', requestCount: 3, lat: 49.4896, lng: 8.468 },
              { citySlug: 'mannheim-7', cityName: 'Mannheim', cityId: 'm7', requestCount: 3, lat: 49.49, lng: 8.4684 },
              { citySlug: 'mannheim-8', cityName: 'Mannheim', cityId: 'm8', requestCount: 3, lat: 49.4904, lng: 8.4688 },
            ],
          },
          requests: {
            items: [],
            total: 28,
            page: 1,
            limit: 10,
          },
        }),
      });
    }

    if (path === '/api/auth/refresh') {
      return route.fulfill({
        status: 401,
        headers: jsonHeaders,
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    }

    if (path === '/api/services' || path === '/api/catalog/services') {
      return route.fulfill({ status: 200, headers: jsonHeaders, body: JSON.stringify([]) });
    }

    if (path === '/api/cities' || path === '/api/catalog/cities') {
      return route.fulfill({ status: 200, headers: jsonHeaders, body: JSON.stringify([]) });
    }

    if (path === '/api/providers') {
      return route.fulfill({ status: 200, headers: jsonHeaders, body: JSON.stringify([]) });
    }

    if (path === '/api/requests/public') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          items: [],
          total: 28,
          page: 1,
          limit: 20,
        }),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  await page.goto('/workspace');

  const map = page.locator('.workspace-public-demand-map__leaflet');
  await expect(map).toBeVisible();

  const clusterMarkers = page.locator('.workspace-demand-cluster-marker');
  await expect.poll(async () => clusterMarkers.count()).toBeGreaterThan(0);

  await clusterMarkers.first().click();

  const cityMarkers = page.locator('.workspace-demand-marker');
  await expect.poll(async () => cityMarkers.count()).toBeGreaterThan(0);
});
