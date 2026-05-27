import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';

test('@critical unauthenticated create-request opens login with resumable workspace next', async ({
  page,
}) => {
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

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  const schedule = encodeURIComponent(JSON.stringify({ mode: 'once', date: '2026-04-10' }));

  await page.goto(
    `/workspace?section=requests&scope=my&mode=create&service=window-cleaning&city=berlin&schedule=${schedule}`,
  );
  await dismissCookieConsentIfPresent(page);

const myWorkLink = page.getByRole('link', { name: /my work|meine arbeit/i });

await expect(myWorkLink).toBeVisible();
await myWorkLink.click();


  await expect.poll(() => new URL(page.url()).pathname).toBe('/auth/login');

  const url = new URL(page.url());
  const nextValue = url.searchParams.get('next') ?? '';

  expect(nextValue).toContain('/workspace');
  expect(nextValue).toContain('section=requests');
  expect(nextValue).toContain('scope=my');
  expect(nextValue).toContain('mode=create');
});
