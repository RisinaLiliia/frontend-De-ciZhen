import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';

test('@critical authenticated user can read and send messages in chat thread', async ({ page }) => {
  const threadId = 'thread-1';
  let markReadCalls = 0;
  let sendCalls = 0;
  const messages = [
    {
      id: 'm-1',
      threadId,
      authorId: 'provider-1',
      text: 'Initial message',
      createdAt: '2026-03-06T08:10:00.000Z',
    },
  ];

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const jsonHeaders = { 'content-type': 'application/json' };

    if (path === '/api/auth/refresh') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          accessToken: 'token-auth-1',
          expiresIn: 3600,
        }),
      });
    }

    if (path === '/api/users/me') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          id: 'client-user-1',
          name: 'Client User',
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

    if (path === `/api/chat/threads/${threadId}/messages` && route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(messages),
      });
    }

    if (path === `/api/chat/threads/${threadId}/read` && route.request().method() === 'POST') {
      markReadCalls += 1;
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ ok: true }),
      });
    }

    if (path === `/api/chat/threads/${threadId}/messages` && route.request().method() === 'POST') {
      sendCalls += 1;
      const body = route.request().postDataJSON() as { text?: string };
      const nextMessage = {
        id: `m-${messages.length + 1}`,
        threadId,
        authorId: 'client-user-1',
        text: body.text ?? '',
        createdAt: '2026-03-06T08:12:00.000Z',
      };
      messages.push(nextMessage);
      return route.fulfill({
        status: 201,
        headers: jsonHeaders,
        body: JSON.stringify(nextMessage),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  await page.goto(`/chat/${threadId}`);
  await dismissCookieConsentIfPresent(page);

  await expect(page.getByText('Initial message')).toBeVisible();
  await expect.poll(() => markReadCalls).toBe(1);

  const messageInput = page.getByPlaceholder(/Nachricht eingeben|Type a message/i);
  await messageInput.fill('Hello from client');
  await page.getByRole('button', { name: /Senden|Send/i }).click();

  await expect(page.getByText('Hello from client')).toBeVisible();
  expect(sendCalls).toBe(1);
});
