import { expect, test } from '@playwright/test';

test('uses canonical public orders route under /workspace', async ({ page }) => {
  await page.goto('/workspace?section=orders&q=cleaning&cityId=berlin&subcategoryKey=window-cleaning');

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe('/workspace');

  const url = new URL(page.url());
  expect(url.searchParams.get('section')).toBe('orders');
  expect(url.searchParams.get('q')).toBe('cleaning');
  expect(url.searchParams.get('cityId')).toBe('berlin');
  expect(url.searchParams.get('subcategoryKey')).toBe('window-cleaning');
});

test('does not redirect from legacy view query on home', async ({ page }) => {
  await page.goto('/?view=orders');

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe('/');
});
