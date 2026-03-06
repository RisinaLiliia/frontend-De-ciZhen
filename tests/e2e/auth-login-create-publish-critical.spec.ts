import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';

test('@critical authenticated user can login, create request, and publish it', async ({ page }) => {
  let createCalls = 0;
  let publishCalls = 0;
  let createdRequestId = '';

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

    if (path === '/api/auth/login') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          user: {
            id: 'user-client-1',
            name: 'Test Client',
            email: 'client@test.com',
            role: 'client',
          },
          accessToken: 'token-login-1',
          expiresIn: 3600,
        }),
      });
    }

    if (path === '/api/users/me') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          id: 'user-client-1',
          name: 'Test Client',
          email: 'client@test.com',
          role: 'client',
          acceptedPrivacyPolicy: true,
          isBlocked: false,
          createdAt: '2026-03-06T08:00:00.000Z',
          updatedAt: '2026-03-06T08:00:00.000Z',
          capabilities: { canProvide: false },
          lastMode: 'client',
          clientProfile: { id: 'cp-1', status: 'complete' },
        }),
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

    if (path === '/api/requests/my' && route.request().method() === 'POST') {
      createCalls += 1;
      const body = route.request().postDataJSON() as Record<string, unknown>;
      createdRequestId = 'request-created-1';

      return route.fulfill({
        status: 201,
        headers: jsonHeaders,
        body: JSON.stringify({
          id: createdRequestId,
          title: body.title,
          cityId: body.cityId,
          serviceKey: body.serviceKey,
        }),
      });
    }

    if (path === `/api/requests/my/${createdRequestId}/publish` && route.request().method() === 'POST') {
      publishCalls += 1;
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          id: createdRequestId,
          status: 'published',
        }),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  const schedule = encodeURIComponent(JSON.stringify({ mode: 'once', date: '2026-04-12' }));
  const nextPath = `/request/create?service=window-cleaning&city=berlin&schedule=${schedule}`;
  await page.goto(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  await dismissCookieConsentIfPresent(page);

  await page.locator('#email').fill('client@test.com');
  await page.locator('#password').fill('Password1!');
  await page.locator('form button[type="submit"]').first().click();

  await expect.poll(() => new URL(page.url()).pathname).toBe('/request/create');

  await page.locator('input[name="title"]').fill('Window cleaning in apartment');
  await page.locator('button[type="submit"][value="publish"]').click();

  await expect.poll(() => new URL(page.url()).pathname).toBe('/workspace');
  const url = new URL(page.url());
  expect(url.searchParams.get('section')).toBe('requests');

  expect(createCalls).toBe(1);
  expect(publishCalls).toBe(1);
});
