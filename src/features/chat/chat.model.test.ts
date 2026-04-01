import { describe, expect, it } from 'vitest';

import {
  buildChatDraftStorageKey,
  countUnreadConversations,
  createChatMessageDayGroups,
  createOptimisticChatMessage,
  filterVisibleConversations,
  flattenChatMessagePages,
  getChatPageCopy,
  mapChatFilterToQuery,
  patchChatSearchParams,
  resolveChatListFilter,
  resolveConversationCounterpart,
  resolveConversationDisplayName,
  resolveConversationPreview,
  resolveConversationUnreadCount,
} from './chat.model';

const conversation = {
  id: 'conv-1',
  participants: [
    { userId: 'user-1', role: 'customer', name: 'Alex' },
    { userId: 'user-2', role: 'provider', name: 'Robin' },
  ],
  relatedEntity: { type: 'request', id: 'req-1', title: 'WC reparieren' },
  lastMessage: {
    messageId: 'msg-1',
    text: 'Ich komme morgen vorbei',
    createdAt: '2026-03-31T10:05:00.000Z',
    senderId: 'user-2',
  },
  unreadCount: { 'user-1': 3, 'user-2': 0 },
  state: 'active',
  createdAt: '2026-03-31T10:00:00.000Z',
  updatedAt: '2026-03-31T10:05:00.000Z',
} as const;

describe('chat.model', () => {
  it('resolves simplified filter state and legacy params', () => {
    expect(resolveChatListFilter('unread')).toBe('unread');
    expect(resolveChatListFilter('provider')).toBe('provider');
    expect(resolveChatListFilter(null, 'customer', null)).toBe('customer');
    expect(resolveChatListFilter(null, null, 'archived')).toBe('archived');
    expect(resolveChatListFilter('x')).toBe('all');

    expect(mapChatFilterToQuery('all')).toEqual({});
    expect(mapChatFilterToQuery('customer')).toEqual({ role: 'customer' });
    expect(mapChatFilterToQuery('archived')).toEqual({ state: 'archived' });
  });

  it('patches URL params and normalizes back to the simplified query model', () => {
    const current = new URLSearchParams('conversation=conv-1&role=customer&state=archived&search=berlin');
    const next = patchChatSearchParams(current, {
      filter: 'unread',
      search: '  ',
      conversation: 'conv-2',
    });

    expect(next.toString()).toBe('conversation=conv-2&filter=unread');
  });

  it('resolves counterpart, display name, preview, and unread count', () => {
    const copy = getChatPageCopy('de');
    expect(resolveConversationCounterpart(conversation as never, 'user-1')?.userId).toBe('user-2');
    expect(resolveConversationDisplayName(conversation as never, 'user-1', copy)).toBe('Robin');
    expect(resolveConversationPreview(conversation as never, copy)).toBe('Ich komme morgen vorbei');
    expect(resolveConversationUnreadCount(conversation as never, 'user-1')).toBe(3);
  });

  it('filters conversations for unread and role-based views and counts unread totals', () => {
    const archivedConversation = {
      ...conversation,
      id: 'conv-2',
      state: 'archived',
      unreadCount: { 'user-1': 0, 'user-2': 0 },
      participants: [
        { userId: 'user-1', role: 'customer', name: 'Alex' },
        { userId: 'user-3', role: 'customer', name: 'Chris' },
      ],
    } as const;
    const items = [conversation, archivedConversation] as never[];

    expect(filterVisibleConversations(items, 'unread', 'user-1')).toHaveLength(1);
    expect(filterVisibleConversations(items, 'provider', 'user-1')).toHaveLength(1);
    expect(filterVisibleConversations(items, 'archived', 'user-1')).toHaveLength(1);
    expect(countUnreadConversations(items, 'user-1')).toBe(3);
  });

  it('flattens pages and groups consecutive messages with date dividers', () => {
    const items = flattenChatMessagePages([
      {
        items: [
          {
            id: 'newer-1',
            senderId: 'user-2',
            createdAt: '2026-04-01T09:00:00.000Z',
          },
        ] as never[],
      },
      {
        items: [
          {
            id: 'older-1',
            senderId: 'user-1',
            createdAt: '2026-03-31T10:00:00.000Z',
          },
          {
            id: 'older-2',
            senderId: 'user-1',
            createdAt: '2026-03-31T10:01:00.000Z',
          },
        ] as never[],
      },
    ]);

    expect(items.map((item) => item.id)).toEqual(['older-1', 'older-2', 'newer-1']);

    const groups = createChatMessageDayGroups(items as never[], 'user-1');
    expect(groups).toHaveLength(2);
    expect(groups[0]?.groups).toHaveLength(1);
    expect(groups[0]?.groups[0]?.messages).toHaveLength(2);
    expect(groups[1]?.groups[0]?.own).toBe(false);
  });

  it('creates optimistic messages and stable draft keys', () => {
    const optimistic = createOptimisticChatMessage({
      conversationId: 'conv-1',
      senderId: 'user-1',
      text: 'Hello',
    });

    expect(optimistic.id.startsWith('optimistic-')).toBe(true);
    expect(optimistic.pending).toBe(true);
    expect(optimistic.deliveryStatus).toBe('sent');
    expect(buildChatDraftStorageKey('conv-1')).toBe('chat-draft:conv-1');
  });

  it('returns messenger copy', () => {
    expect(getChatPageCopy('de').title).toBe('Nachrichten');
    expect(getChatPageCopy('en').info).toBe('Info');
  });
});
