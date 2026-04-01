import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';

test('@critical authenticated user can open, read, inspect, and send messages in chat', async ({ page }) => {
  const conversationId = 'conv-1';
  let markReadCalls = 0;
  let sendCalls = 0;
  const messages = [
    {
      id: 'm-1',
      conversationId,
      senderId: 'provider-1',
      type: 'text',
      text: 'Initial message',
      attachments: [],
      deliveryStatus: 'sent',
      createdAt: '2026-03-06T08:10:00.000Z',
    },
  ];
  const conversation = {
    id: conversationId,
    participants: [
      {
        userId: 'client-user-1',
        role: 'customer',
        displayName: 'Client User',
      },
      {
        userId: 'provider-1',
        role: 'provider',
        displayName: 'Robin Service',
        isOnline: true,
      },
    ],
    counterpart: {
      userId: 'provider-1',
      role: 'provider',
      displayName: 'Robin Service',
      isOnline: true,
    },
    relatedEntity: {
      type: 'request',
      id: 'req-1',
      requestId: 'req-1',
      title: 'WC reparieren',
      status: 'offen',
      amount: 120,
    },
    lastMessage: {
      messageId: 'm-1',
      text: 'Initial message',
      createdAt: '2026-03-06T08:10:00.000Z',
      senderId: 'provider-1',
    },
    lastMessagePreview: 'Initial message',
    unread: 1,
    unreadCount: {
      'client-user-1': 1,
      'provider-1': 0,
    },
    state: 'active',
    createdAt: '2026-03-06T08:00:00.000Z',
    updatedAt: '2026-03-06T08:10:00.000Z',
  };

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

    if (path === '/api/chat/conversations' && route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ items: [conversation] }),
      });
    }

    if (path === `/api/chat/conversations/${conversationId}` && route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(conversation),
      });
    }

    if (
      path === `/api/chat/conversations/${conversationId}/messages`
      && route.request().method() === 'GET'
    ) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ items: messages }),
      });
    }

    if (
      path === `/api/chat/conversations/${conversationId}/read`
      && route.request().method() === 'POST'
    ) {
      markReadCalls += 1;
      conversation.unread = 0;
      conversation.unreadCount['client-user-1'] = 0;
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ ok: true }),
      });
    }

    if (
      path === `/api/chat/conversations/${conversationId}/messages`
      && route.request().method() === 'POST'
    ) {
      sendCalls += 1;
      const body = route.request().postDataJSON() as { text?: string };
      const nextMessage = {
        id: `m-${messages.length + 1}`,
        conversationId,
        senderId: 'client-user-1',
        type: 'text',
        text: body.text ?? '',
        attachments: [],
        deliveryStatus: 'sent',
        createdAt: '2026-03-06T08:12:00.000Z',
      };
      messages.push(nextMessage);
      conversation.lastMessage = {
        messageId: nextMessage.id,
        text: nextMessage.text,
        createdAt: nextMessage.createdAt,
        senderId: nextMessage.senderId,
      };
      conversation.lastMessagePreview = nextMessage.text;
      conversation.updatedAt = nextMessage.createdAt;
      return route.fulfill({
        status: 201,
        headers: jsonHeaders,
        body: JSON.stringify(nextMessage),
      });
    }

    if (path === '/api/requests/req-1') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          id: 'req-1',
          title: 'WC reparieren',
          status: 'offen',
          price: 120,
          clientName: 'Client User',
        }),
      });
    }

    if (path === '/api/offers/by-request/req-1') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([]),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  await page.goto(`/chat?conversation=${conversationId}`);
  await dismissCookieConsentIfPresent(page);

  await expect(page.getByRole('option', { name: /Robin Service/i })).toBeVisible();
  await expect(page.getByRole('log').getByText('Initial message')).toBeVisible();
  await expect.poll(() => markReadCalls).toBe(1);

  await page.getByRole('button', { name: /Info/i }).click();
  const infoDialog = page.getByRole('dialog', { name: /Informationen|Information/i });
  await expect(infoDialog).toBeVisible();
  await expect(infoDialog.getByRole('heading', { name: 'WC reparieren' })).toBeVisible();
  await infoDialog.getByRole('button', { name: /Schließen|Close/i }).click();
  await expect(infoDialog).toBeHidden();

  const messageInput = page.getByPlaceholder(/Nachricht schreiben|Write a message/i);
  await messageInput.fill('Hello from client');
  await page.getByRole('button', { name: /Senden|Send/i }).click();

  await expect(page.getByRole('log').getByText('Hello from client')).toBeVisible();
  expect(sendCalls).toBe(1);
});
