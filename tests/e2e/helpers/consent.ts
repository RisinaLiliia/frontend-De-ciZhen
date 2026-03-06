import type { Page } from '@playwright/test';

export async function dismissCookieConsentIfPresent(page: Page) {
  const rejectOptional = page.getByRole('button', {
    name: /Nur notwendige|Necessary only/i,
  });

  try {
    await rejectOptional.waitFor({ state: 'visible', timeout: 2_500 });
    await rejectOptional.click();
  } catch {
    // Banner can be absent when consent was previously stored.
  }
}
