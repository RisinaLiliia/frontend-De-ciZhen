/** @vitest-environment happy-dom */

import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ChatWorkspacePage } from './ChatWorkspacePage';
import type { ChatConversationDto, ChatMessageDto } from '@/lib/api/dto/chat';

const navigationState = vi.hoisted(() => {
  let search = '';
  const listeners = new Set<() => void>();
  const replace = vi.fn((href: string) => {
    const url = new URL(href, 'http://localhost');
    search = url.search.startsWith('?') ? url.search.slice(1) : url.search;
    listeners.forEach((listener) => listener());
  });

  return {
    replace,
    getSearch: () => search,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setSearch: (next: string) => {
      search = next;
    },
    reset: () => {
      search = '';
      listeners.clear();
      replace.mockClear();
    },
  };
});

vi.mock('next/navigation', async () => {
  const ReactModule = await import('react');

  return {
    useRouter: () => ({
      replace: navigationState.replace,
    }),
    useSearchParams: () => {
      const query = ReactModule.useSyncExternalStore(
        navigationState.subscribe,
        navigationState.getSearch,
        navigationState.getSearch,
      );

      return new URLSearchParams(query);
    },
  };
});

vi.mock('@/lib/auth/RequireAuth', () => ({
  RequireAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useAuthSnapshot', () => ({
  useAuthUser: () => ({
    id: 'user-1',
  }),
}));

vi.mock('@/lib/i18n/I18nProvider', () => ({
  useI18n: () => ({
    locale: 'de',
  }),
}));

vi.mock('@/lib/auth/token', () => ({
  getAccessToken: () => '',
}));

vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    removeAllListeners: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock('@/lib/api/chat', () => ({
  getChatSocketUrl: vi.fn(() => ''),
  getConversation: vi.fn(),
  listConversations: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
  markConversationRead: vi.fn(),
}));

vi.mock('@/lib/api/requests', () => ({
  getPublicRequestById: vi.fn(),
}));

vi.mock('@/lib/api/offers', () => ({
  listOffersByRequest: vi.fn(),
}));

vi.mock('@/lib/api/contracts', () => ({
  getContract: vi.fn(),
}));

import * as chatApi from '@/lib/api/chat';
import * as requestApi from '@/lib/api/requests';
import * as offersApi from '@/lib/api/offers';
import * as contractsApi from '@/lib/api/contracts';

const getConversationMock = vi.mocked(chatApi.getConversation);
const listConversationsMock = vi.mocked(chatApi.listConversations);
const getMessagesMock = vi.mocked(chatApi.getMessages);
const sendMessageMock = vi.mocked(chatApi.sendMessage);
const markConversationReadMock = vi.mocked(chatApi.markConversationRead);
const getPublicRequestByIdMock = vi.mocked(requestApi.getPublicRequestById);
const listOffersByRequestMock = vi.mocked(offersApi.listOffersByRequest);
const getContractMock = vi.mocked(contractsApi.getContract);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const conversations: ChatConversationDto[] = [
  {
    id: 'conv-1',
    participants: [
      { userId: 'user-1', role: 'customer', name: 'Alex' },
      { userId: 'user-2', role: 'provider', name: 'Robin Service' },
    ],
    relatedEntity: {
      type: 'request',
      id: 'req-1',
      requestId: 'req-1',
      title: 'WC reparieren',
      status: 'offen',
    },
    lastMessage: {
      messageId: 'msg-2',
      text: 'Ich bin um 16 Uhr da.',
      createdAt: '2026-03-31T10:05:00.000Z',
      senderId: 'user-2',
    },
    unreadCount: {
      'user-1': 2,
      'user-2': 0,
    },
    state: 'active',
    createdAt: '2026-03-31T09:00:00.000Z',
    updatedAt: '2026-03-31T10:05:00.000Z',
  },
  {
    id: 'conv-2',
    participants: [
      { userId: 'user-1', role: 'customer', name: 'Alex' },
      { userId: 'user-3', role: 'provider', name: 'Chris Plumbing' },
    ],
    relatedEntity: {
      type: 'offer',
      id: 'offer-1',
      requestId: 'req-2',
      offerId: 'offer-1',
      title: 'Rohr reinigen',
      status: 'Angebot offen',
    },
    lastMessage: {
      messageId: 'msg-3',
      text: 'Passt, danke.',
      createdAt: '2026-03-30T12:10:00.000Z',
      senderId: 'user-1',
    },
    unreadCount: {
      'user-1': 0,
      'user-3': 0,
    },
    state: 'active',
    createdAt: '2026-03-30T10:00:00.000Z',
    updatedAt: '2026-03-30T12:10:00.000Z',
  },
];

const messagesByConversation = {
  'conv-1': {
    items: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        type: 'text',
        text: 'Hallo',
        attachments: [],
        deliveryStatus: 'read',
        createdAt: '2026-03-31T10:00:00.000Z',
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-2',
        type: 'text',
        text: 'Ich bin um 16 Uhr da.',
        attachments: [],
        deliveryStatus: 'sent',
        createdAt: '2026-03-31T10:05:00.000Z',
      },
    ],
  },
  'conv-2': {
    items: [
      {
        id: 'msg-3',
        conversationId: 'conv-2',
        senderId: 'user-3',
        type: 'text',
        text: 'Passt, danke.',
        attachments: [],
        deliveryStatus: 'sent',
        createdAt: '2026-03-30T12:10:00.000Z',
      },
    ],
  },
} satisfies Record<string, { items: ChatMessageDto[] }>;

function renderPage() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ChatWorkspacePage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  navigationState.reset();

  getConversationMock.mockImplementation(async (conversationId) => {
    return conversations.find((item) => item.id === conversationId) ?? conversations[0]!;
  });
  listConversationsMock.mockImplementation(async (params) => {
    if (params?.search) {
      return { items: [] };
    }
    return { items: conversations.map((item) => ({ ...item, participants: [...item.participants] })) };
  });
  getMessagesMock.mockImplementation(async (conversationId) => {
    return messagesByConversation[conversationId as keyof typeof messagesByConversation] ?? { items: [] };
  });
  sendMessageMock.mockResolvedValue({
    id: 'msg-server',
    conversationId: 'conv-1',
    senderId: 'user-1',
    type: 'text',
    text: 'Neue Nachricht',
    attachments: [],
    deliveryStatus: 'sent',
    createdAt: '2026-03-31T10:06:00.000Z',
  });
  markConversationReadMock.mockResolvedValue({ ok: true });
  getPublicRequestByIdMock.mockResolvedValue({
    id: 'req-1',
    title: 'WC reparieren',
    status: 'offen',
    price: 120,
    clientName: 'Alex',
  } as never);
  listOffersByRequestMock.mockResolvedValue([]);
  getContractMock.mockResolvedValue(null as never);
});

afterEach(() => {
  cleanup();
});

describe('ChatWorkspacePage', () => {
  it('renders the sidebar list with unread badge and active conversation', async () => {
    navigationState.setSearch('conversation=conv-1');

    renderPage();

    expect(await screen.findByRole('option', { name: /Robin Service/i })).not.toBeNull();
    expect(screen.getByRole('option', { name: /Chris Plumbing/i })).not.toBeNull();
    expect(screen.getByLabelText('2 ungelesen')).not.toBeNull();

    const options = screen.getAllByRole('option');
    expect(options[0]?.getAttribute('aria-selected')).toBe('true');
    expect(options[1]?.getAttribute('aria-selected')).toBe('false');
  });

  it('updates the URL when another conversation is selected', async () => {
    navigationState.setSearch('conversation=conv-1');

    renderPage();
    await screen.findByText('Chris Plumbing');
    navigationState.replace.mockClear();

    fireEvent.click(screen.getByRole('option', { name: /Chris Plumbing/i }));

    expect(navigationState.replace).toHaveBeenCalledWith('/chat?conversation=conv-2', { scroll: false });
  });

  it('shows an optimistic message immediately while sending is still pending', async () => {
    navigationState.setSearch('conversation=conv-1');
    const pendingMessage = deferred<Awaited<ReturnType<typeof sendMessageMock>>>();
    sendMessageMock.mockImplementationOnce(() => pendingMessage.promise as never);

    renderPage();
    expect(await screen.findByText('Ich bin um 16 Uhr da.')).not.toBeNull();

    const textarea = screen.getByPlaceholderText('Nachricht schreiben');
    fireEvent.change(textarea, { target: { value: 'Neue Nachricht' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(await screen.findByText('Neue Nachricht')).not.toBeNull();
    expect(sendMessageMock).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      text: 'Neue Nachricht',
    });

    pendingMessage.resolve({
      id: 'msg-server',
      conversationId: 'conv-1',
      senderId: 'user-1',
      type: 'text',
      text: 'Neue Nachricht',
      attachments: [],
      deliveryStatus: 'sent',
      createdAt: '2026-03-31T10:06:00.000Z',
    });

    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalledTimes(1);
    });
  });

  it('shows the no-results state when search returns no conversations', async () => {
    navigationState.setSearch('search=unbekannt');

    renderPage();

    expect(await screen.findByText('Keine Ergebnisse')).not.toBeNull();
    expect(screen.getByText('Versuchen Sie einen anderen Namen oder Suchbegriff.')).not.toBeNull();
  });
});
