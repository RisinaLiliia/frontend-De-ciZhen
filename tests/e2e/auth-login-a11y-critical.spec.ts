import { expect, test, type Page } from '@playwright/test';

async function mockUnauthenticatedSession(page: Page) {
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
}

test('@critical @a11y login form focuses first invalid field and toggles password label', async ({ page }) => {
  await mockUnauthenticatedSession(page);
  await page.goto('/auth/login');

  await page.locator('form button[type="submit"]').first().click();

  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');
  await expect(emailInput).toBeFocused();
  await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  await expect(passwordInput).toHaveAttribute('aria-invalid', 'true');

  const showPasswordPattern = /Passwort anzeigen|Show password/i;
  const hidePasswordPattern = /Passwort ausblenden|Hide password/i;

  const passwordToggle = page.getByRole('button', { name: showPasswordPattern });
  await expect(passwordToggle).toBeVisible();
  await passwordToggle.click();

  await expect(page.getByRole('button', { name: hidePasswordPattern })).toBeVisible();
});
