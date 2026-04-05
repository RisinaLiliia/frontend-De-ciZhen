import { expect, test } from '@playwright/test';

test('workspace public map renders full map with footer stats and active markers', async ({ page }) => {
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
            totalPublishedRequests: 10,
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
            totalActiveCities: 3,
            totalActiveRequests: 10,
            items: [
              {
                citySlug: 'mannheim',
                cityName: 'Mannheim',
                cityId: 'mannheim',
                requestCount: 5,
                lat: 49.4875,
                lng: 8.466,
              },
              {
                citySlug: 'karlsruhe',
                cityName: 'Karlsruhe',
                cityId: 'karlsruhe',
                requestCount: 3,
                lat: 49.0069,
                lng: 8.4037,
              },
              {
                citySlug: 'berlin',
                cityName: 'Berlin',
                cityId: 'berlin',
                requestCount: 2,
                lat: 52.52,
                lng: 13.405,
              },
            ],
          },
          requests: {
            items: [],
            total: 10,
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
          total: 10,
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

  const footer = page.locator('.workspace-public-demand-map__meta--footer');
  await expect(footer).toBeVisible();
  await expect(footer).toContainText('10');
  await expect(footer).toContainText('44');

  const markers = page.locator('.workspace-demand-marker');
  await expect(markers).toHaveCount(3);

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe('/workspace');
});
