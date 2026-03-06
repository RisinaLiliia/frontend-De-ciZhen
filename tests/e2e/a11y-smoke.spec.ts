import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';
import { expectNoAxeViolations } from './helpers/a11y';

test('@a11y login page has no critical/serious axe violations', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const jsonHeaders = { 'content-type': 'application/json' };

    if (url.pathname === '/api/auth/refresh') {
      return route.fulfill({
        status: 401,
        headers: jsonHeaders,
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${url.pathname}` }),
    });
  });

  await page.goto('/auth/login');
  await dismissCookieConsentIfPresent(page);
  await expect(page.locator('form')).toBeVisible();

  await expectNoAxeViolations(page);
});

test('@a11y provider page has no critical/serious axe violations', async ({ page }) => {
  const providerId = 'provider-axe-1';
  const providerUserId = 'provider-axe-user-1';

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
          displayName: 'Axe Test Provider',
          avatarUrl: null,
          ratingAvg: 4.8,
          ratingCount: 15,
          completedJobs: 40,
          basePrice: 70,
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

  await page.goto(`/providers/${providerId}`);
  await dismissCookieConsentIfPresent(page);
  await expect(page.getByText('Axe Test Provider')).toBeVisible();

  await expectNoAxeViolations(page);
});
