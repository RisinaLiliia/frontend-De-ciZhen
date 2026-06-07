import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';

test('@critical authenticated user can login and create request from workspace', async ({ page }) => {  let createCalls = 0;
  let publishCalls = 0;
  let createdRequestId = '';

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const jsonHeaders = { 'content-type': 'application/json' };

    if (route.request().method() === 'POST') {
      console.log(`POST called: ${path}`);
    }

    if (path === '/api/auth/refresh') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          accessToken: 'token-refresh-1',
          expiresIn: 3600,
        }),
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
            isActive: true,
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
            isActive: true,
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
            _id: 'berlin',
            key: 'city_berlin',
            name: 'Berlin',
            countryCode: 'DE',
            stateName: 'Berlin',
            districtName: null,
            postalCodes: ['10115'],
            isActive: true,
            sortOrder: 1,
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

    if (
      path === `/api/requests/my/${createdRequestId}/publish` &&
      route.request().method() === 'POST'
    ) {
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
    if (path === '/api/requests/my' && route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          list: {
            items: [],
            total: 0,
            page: 1,
            limit: 20,
          },

          summary: {
            items: [
              { key: 'all', value: 0 },
              { key: 'active', value: 0 },
              { key: 'execution', value: 0 },
              { key: 'completed', value: 0 },
            ],
          },

          filters: {},
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 1,
          },

          rightRail: null,
        }),
      });
    }
    if (path === '/api/presence/ping' && route.request().method() === 'POST') {
      return route.fulfill({
        status: 204,
        headers: jsonHeaders,
        body: '',
      });
    }

    if (path === '/api/workspace/requests') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          items: [],
          total: 0,
          page: 1,
          limit: 20,
          filters: {},
          summary: {
            total: 0,
            active: 0,
            execution: 0,
            completed: 0,
          },
          rightRail: null,
        }),
      });
    }

    if (path === '/api/workspace/public') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          overview: null,
          requests: null,
          providers: null,
          statistics: null,
        }),
      });
    }

    if (path === '/api/workspace/private') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          viewer: {
            id: 'client-user',
            email: 'client@test.com',
            role: 'client',

            asClient: {
              id: 'client-profile',
              profileCompleted: true,
            },

            asProvider: null,
          },

          permissions: {
            canCreateRequests: true,
            canPublishRequests: true,
          },

          workspace: {
            mode: 'client',
          },
        }),
      });
    }

    if (path === '/api/workspace/statistics') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(null),
      });
    }

    console.log(`Mock not found: ${route.request().method()} ${path}`);

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  const schedule = encodeURIComponent(JSON.stringify({ mode: 'once', date: '2026-04-12' }));
  const nextPath = `/workspace?section=requests&scope=my&mode=create&service=window-cleaning&city=berlin&schedule=${schedule}`;

  await page.goto(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  await dismissCookieConsentIfPresent(page);

  await page.locator('#email').fill('client@test.com');
  await page.locator('#password').fill('Password1!');
  await page.locator('form button[type="submit"]').first().click();

  await expect
    .poll(() => {
      const url = new URL(page.url());

      return {
        pathname: url.pathname,
        section: url.searchParams.get('section'),
        scope: url.searchParams.get('scope'),
        mode: url.searchParams.get('mode'),
      };
    })
    .toEqual({
      pathname: '/workspace',
      section: 'requests',
      scope: 'my',
      mode: 'create',
    });

  const titleInput = page.locator('input[name="title"]');

  await expect(titleInput).toBeVisible();
  await expect(titleInput).toBeVisible();
  await expect(titleInput).toBeVisible();
  await titleInput.fill('Window cleaning in apartment');

  const requestForm = page.getByRole('region', { name: /Describe your request/i });

  await requestForm.getByLabel('Category', { exact: true }).click();
  await page.getByRole('option', { name: /Cleaning/i }).click();

  const subcategorySelect = requestForm.getByLabel('Subcategory', { exact: true });

  await expect(subcategorySelect).toBeEnabled();
  await subcategorySelect.click();
  await page.getByRole('option', { name: /Window cleaning/i }).click();

  await page.locator('button[type="submit"][value="publish"]').click();

  await expect.poll(() => new URL(page.url()).pathname).toBe('/workspace');

  const url = new URL(page.url());

  expect(url.searchParams.get('section')).toBe('requests');
  expect(createCalls).toBe(1);
  expect(publishCalls).toBeGreaterThanOrEqual(0);
});
