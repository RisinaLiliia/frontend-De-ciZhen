import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';

test('@critical unauthenticated create-request submit redirects to login with resumable next', async ({ page }) => {
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

    if (path === '/api/catalog/service-categories') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([
          {
            key: 'cleaning',
            sortOrder: 1,
            i18n: { de: 'Reinigung', en: 'Cleaning' },
          },
        ]),
      });
    }

    if (path === '/api/catalog/services') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([
          {
            key: 'window-cleaning',
            categoryKey: 'cleaning',
            sortOrder: 1,
            i18n: { de: 'Fensterreinigung', en: 'Window cleaning' },
          },
        ]),
      });
    }

    if (path === '/api/catalog/cities') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([
          {
            id: 'berlin',
            countryCode: 'DE',
            i18n: { de: 'Berlin', en: 'Berlin' },
          },
        ]),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  const schedule = encodeURIComponent(JSON.stringify({ mode: 'once', date: '2026-04-10' }));
  await page.goto(`/request/create?service=window-cleaning&city=berlin&schedule=${schedule}`);

  await dismissCookieConsentIfPresent(page);

  await page.locator('input[name="title"]').fill('Window cleaning in apartment');
  await page.locator('button[type="submit"][value="draft"]').click();

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe('/auth/login');

  const url = new URL(page.url());
  const nextValue = url.searchParams.get('next') ?? '';
  expect(nextValue).toContain('/request/create');
  expect(nextValue).toContain('intent=draft');
});
