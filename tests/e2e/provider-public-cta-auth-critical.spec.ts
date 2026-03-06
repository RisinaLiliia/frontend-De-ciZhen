import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';

const providerId = 'provider-1';
const providerUserId = 'provider-user-1';

test('@critical unauthenticated provider CTAs redirect to login with next path', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const jsonHeaders = { 'content-type': 'application/json' };

    if (path === '/api/auth/refresh') {
      return route.fulfill({
        status: 401,
        headers: jsonHeaders,
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    }

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
        body: JSON.stringify([]),
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
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          items: [],
          total: 0,
          limit: 4,
          offset: 0,
          summary: {
            total: 0,
            averageRating: 0,
            distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          },
        }),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  const checks = [
    /Angebot abgeben|Send offer/i,
    /Chat starten|Start chat/i,
  ];

  for (const buttonLabel of checks) {
    await page.goto(`/providers/${providerId}`);
    await dismissCookieConsentIfPresent(page);
    await expect(page.getByText('Test Provider')).toBeVisible();

    const cta = page.locator('.request-detail__aside').getByRole('button', { name: buttonLabel });
    await cta.click();

    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe('/auth/login');

    const url = new URL(page.url());
    expect(url.searchParams.get('next')).toBe(`/providers/${providerId}`);
  }
});
