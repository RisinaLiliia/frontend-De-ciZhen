import { expect, test } from '@playwright/test';

test('provider page uses single reviews overview request (no list/summary split)', async ({ page }) => {
  const providerId = 'provider-1';
  const providerUserId = 'provider-user-1';

  let overviewCalls = 0;
  let summaryCalls = 0;
  let listCalls = 0;

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const jsonHeaders = { 'content-type': 'application/json' };

    if (path === `/api/providers/${providerId}`) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          id: providerId,
          userId: providerUserId,
          displayName: 'Test Provider',
          avatarUrl: null,
          ratingAvg: 4.8,
          ratingCount: 11,
          completedJobs: 31,
          basePrice: 72,
          cityId: 'berlin',
          cityName: 'Berlin',
          serviceKey: 'cleaning',
          serviceKeys: ['cleaning'],
          availabilityState: 'open',
          nextAvailableAt: '2026-03-10T10:00:00.000Z',
        }),
      });
    }

    if (path === '/api/providers') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([
          {
            id: providerId,
            userId: providerUserId,
            displayName: 'Test Provider',
            ratingAvg: 4.8,
            ratingCount: 11,
            completedJobs: 31,
            basePrice: 72,
            cityId: 'berlin',
            cityName: 'Berlin',
            serviceKey: 'cleaning',
            serviceKeys: ['cleaning'],
            availabilityState: 'open',
            nextAvailableAt: '2026-03-10T10:00:00.000Z',
          },
          {
            id: 'provider-2',
            userId: 'provider-user-2',
            displayName: 'Other Provider',
            ratingAvg: 4.6,
            ratingCount: 7,
            completedJobs: 18,
            basePrice: 68,
            cityId: 'berlin',
            cityName: 'Berlin',
            serviceKey: 'cleaning',
            serviceKeys: ['cleaning'],
            availabilityState: 'busy',
            nextAvailableAt: null,
          },
        ]),
      });
    }

    if (path.startsWith(`/api/availability/providers/${providerUserId}/slots`)) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([]),
      });
    }

    if (path === '/api/reviews/overview') {
      overviewCalls += 1;
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          items: [
            {
              id: 'review-1',
              targetRole: 'provider',
              rating: 5,
              text: 'Sehr gut',
              authorName: 'Anna',
              authorAvatarUrl: null,
              createdAt: '2026-03-01T10:00:00.000Z',
            },
          ],
          total: 11,
          limit: 4,
          offset: 0,
          summary: {
            total: 11,
            averageRating: 4.8,
            distribution: {
              '1': 0,
              '2': 0,
              '3': 1,
              '4': 2,
              '5': 8,
            },
          },
        }),
      });
    }

    if (path === '/api/reviews/summary') {
      summaryCalls += 1;
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          targetUserId: providerUserId,
          targetRole: 'provider',
          total: 11,
          averageRating: 4.8,
          distribution: { '1': 0, '2': 0, '3': 1, '4': 2, '5': 8 },
        }),
      });
    }

    if (path === '/api/reviews') {
      listCalls += 1;
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([]),
      });
    }

    if (path === '/api/auth/refresh') {
      return route.fulfill({
        status: 401,
        headers: jsonHeaders,
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  await page.goto(`/providers/${providerId}`);
  await expect(page.getByText('Test Provider')).toBeVisible();

  await expect.poll(() => overviewCalls).toBe(1);
  await expect.poll(() => summaryCalls).toBe(0);
  await expect.poll(() => listCalls).toBe(0);
});
