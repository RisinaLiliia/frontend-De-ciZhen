import type {
  ChatConversationDto,
  ChatMessageDto,
  ChatMessagesResponseDto,
} from '@/lib/api/dto/chat';
import type { Locale } from '@/lib/i18n/t';

export type ChatListFilter = 'all' | 'unread' | 'customer' | 'provider' | 'archived';

export type ChatPageCopy = {
  title: string;
  searchPlaceholder: string;
  searchLabel: string;
  filterAll: string;
  filterUnread: string;
  filterCustomer: string;
  filterProvider: string;
  filterArchived: string;
  listEmptyTitle: string;
  listEmptyHint: string;
  listSearchEmptyTitle: string;
  listSearchEmptyHint: string;
  threadIdleTitle: string;
  threadIdleHint: string;
  threadEmptyTitle: string;
  threadEmptyHint: string;
  composerPlaceholder: string;
  composerCta: string;
  composerSending: string;
  composerClosed: string;
  loadOlder: string;
  info: string;
  close: string;
  backToChats: string;
  entityRequest: string;
  entityOffer: string;
  entityOrder: string;
  relatedTo: string;
  infoTitle: string;
  participantTitle: string;
  openRequest: string;
  openProfile: string;
  openOffers: string;
  openOrders: string;
  amountOpen: string;
  statusUnknown: string;
  previewFallback: string;
  previewAttachment: string;
  roleCustomerLabel: string;
  roleProviderLabel: string;
  onlineNow: string;
  lastSeen: string;
  unreadShort: string;
  readStateSent: string;
  readStateDelivered: string;
  readStateRead: string;
  readStatePending: string;
};

const COPY: Record<Locale, ChatPageCopy> = {
  de: {
    title: 'Nachrichten',
    searchPlaceholder: 'Suche nach Name oder Nachricht',
    searchLabel: 'Chats durchsuchen',
    filterAll: 'Alle',
    filterUnread: 'Ungelesen',
    filterCustomer: 'Kunde',
    filterProvider: 'Anbieter',
    filterArchived: 'Archiviert',
    listEmptyTitle: 'Noch keine Unterhaltungen',
    listEmptyHint: 'Sobald Sie mit einem Anbieter oder Kunden schreiben, erscheint die Konversation hier.',
    listSearchEmptyTitle: 'Keine Chats gefunden',
    listSearchEmptyHint: 'Versuchen Sie einen anderen Namen oder Suchbegriff.',
    threadIdleTitle: 'Wählen Sie einen Chat',
    threadIdleHint: 'Öffnen Sie links eine Unterhaltung, um den Verlauf zu sehen.',
    threadEmptyTitle: 'Noch keine Nachrichten',
    threadEmptyHint: 'Schreiben Sie die erste Nachricht, um die Unterhaltung zu starten.',
    composerPlaceholder: 'Nachricht schreiben',
    composerCta: 'Senden',
    composerSending: 'Wird gesendet…',
    composerClosed: 'Dieser Chat ist geschlossen.',
    loadOlder: 'Ältere Nachrichten laden',
    info: 'Info',
    close: 'Schließen',
    backToChats: 'Zurück',
    entityRequest: 'Anfrage',
    entityOffer: 'Angebot',
    entityOrder: 'Auftrag',
    relatedTo: 'Bezogen auf',
    infoTitle: 'Informationen',
    participantTitle: 'Teilnehmer',
    openRequest: 'Anfrage öffnen',
    openProfile: 'Profil öffnen',
    openOffers: 'Zu Angeboten',
    openOrders: 'Zu Aufträgen',
    amountOpen: 'Preis offen',
    statusUnknown: 'Unbekannt',
    previewFallback: 'Noch keine Nachrichten',
    previewAttachment: 'Datei gesendet',
    roleCustomerLabel: 'Kunde',
    roleProviderLabel: 'Anbieter',
    onlineNow: 'online',
    lastSeen: 'zuletzt aktiv',
    unreadShort: 'ungelesen',
    readStateSent: 'Gesendet',
    readStateDelivered: 'Zugestellt',
    readStateRead: 'Gelesen',
    readStatePending: 'Wird gesendet',
  },
  en: {
    title: 'Messages',
    searchPlaceholder: 'Search by name or message',
    searchLabel: 'Search chats',
    filterAll: 'All',
    filterUnread: 'Unread',
    filterCustomer: 'Customer',
    filterProvider: 'Provider',
    filterArchived: 'Archived',
    listEmptyTitle: 'No conversations yet',
    listEmptyHint: 'Once you message a provider or customer, the conversation will appear here.',
    listSearchEmptyTitle: 'No chats found',
    listSearchEmptyHint: 'Try another name or search term.',
    threadIdleTitle: 'Choose a chat',
    threadIdleHint: 'Open a conversation from the left to view the thread.',
    threadEmptyTitle: 'No messages yet',
    threadEmptyHint: 'Write the first message to start the thread.',
    composerPlaceholder: 'Write a message',
    composerCta: 'Send',
    composerSending: 'Sending…',
    composerClosed: 'This chat is closed.',
    loadOlder: 'Load older messages',
    info: 'Info',
    close: 'Close',
    backToChats: 'Back',
    entityRequest: 'Request',
    entityOffer: 'Offer',
    entityOrder: 'Order',
    relatedTo: 'Related to',
    infoTitle: 'Information',
    participantTitle: 'Participant',
    openRequest: 'Open request',
    openProfile: 'Open profile',
    openOffers: 'Open offers',
    openOrders: 'Open orders',
    amountOpen: 'Price open',
    statusUnknown: 'Unknown',
    previewFallback: 'No messages yet',
    previewAttachment: 'File sent',
    roleCustomerLabel: 'Customer',
    roleProviderLabel: 'Provider',
    onlineNow: 'online',
    lastSeen: 'last active',
    unreadShort: 'unread',
    readStateSent: 'Sent',
    readStateDelivered: 'Delivered',
    readStateRead: 'Read',
    readStatePending: 'Sending',
  },
};

export type ChatMessageGroup = {
  senderId: string;
  own: boolean;
  messages: ChatMessageDto[];
};

export type ChatMessageDayGroup = {
  dayKey: string;
  groups: ChatMessageGroup[];
};

export function getChatPageCopy(locale: Locale): ChatPageCopy {
  return COPY[locale] ?? COPY.de;
}

export function resolveChatListFilter(
  value: string | null | undefined,
  legacyRole?: string | null | undefined,
  legacyState?: string | null | undefined,
): ChatListFilter {
  if (
    value === 'all'
    || value === 'unread'
    || value === 'customer'
    || value === 'provider'
    || value === 'archived'
  ) {
    return value;
  }
  if (legacyRole === 'customer' || legacyRole === 'provider') return legacyRole;
  if (legacyState === 'archived') return 'archived';
  return 'all';
}

export function patchChatSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>,
) {
  const next = new URLSearchParams(current.toString());

  Object.entries(updates).forEach(([key, value]) => {
    const normalized = typeof value === 'string' ? value.trim() : value;
    if (!normalized || normalized === 'all') {
      next.delete(key);
      return;
    }
    next.set(key, normalized);
  });

  next.delete('role');
  next.delete('state');
  return next;
}

export function mapChatFilterToQuery(filter: ChatListFilter) {
  if (filter === 'customer') return { role: 'customer' as const };
  if (filter === 'provider') return { role: 'provider' as const };
  if (filter === 'archived') return { state: 'archived' as const };
  return {};
}

export function resolveConversationCounterpart(
  conversation: ChatConversationDto,
  currentUserId: string | null | undefined,
) {
  if (conversation.counterpart) {
    return {
      userId: conversation.counterpart.userId,
      role: conversation.counterpart.role,
      name: conversation.counterpart.displayName,
      displayName: conversation.counterpart.displayName,
      avatarUrl: conversation.counterpart.avatarUrl ?? null,
      isOnline: conversation.counterpart.isOnline ?? null,
      lastSeenAt: conversation.counterpart.lastSeenAt ?? null,
    };
  }
  return (
    conversation.participants.find((participant) => participant.userId !== currentUserId)
    ?? conversation.participants[0]
    ?? null
  );
}

export function resolveConversationUnreadCount(
  conversation: ChatConversationDto,
  currentUserId: string | null | undefined,
) {
  if (typeof conversation.unread === 'number' && currentUserId) {
    return Math.max(conversation.unread, 0);
  }
  if (!currentUserId) {
    return Object.values(conversation.unreadCount).reduce((sum, value) => sum + value, 0);
  }
  return conversation.unreadCount[currentUserId] ?? 0;
}

export function countUnreadConversations(
  conversations: ChatConversationDto[],
  currentUserId: string | null | undefined,
) {
  return conversations.reduce(
    (sum, conversation) => sum + resolveConversationUnreadCount(conversation, currentUserId),
    0,
  );
}

export function filterVisibleConversations(
  conversations: ChatConversationDto[],
  filter: ChatListFilter,
  currentUserId: string | null | undefined,
) {
  if (filter === 'all') return conversations;
  if (filter === 'unread') {
    return conversations.filter(
      (conversation) => resolveConversationUnreadCount(conversation, currentUserId) > 0,
    );
  }
  if (filter === 'archived') {
    return conversations.filter((conversation) => conversation.state === 'archived');
  }
  return conversations.filter(
    (conversation) => resolveConversationCounterpart(conversation, currentUserId)?.role === filter,
  );
}

export function resolveConversationRequestId(conversation: ChatConversationDto) {
  return conversation.relatedEntity.requestId
    ?? (conversation.relatedEntity.type === 'request' ? conversation.relatedEntity.id : null);
}

export function resolveConversationEntityLabel(
  copy: ChatPageCopy,
  conversation: ChatConversationDto,
) {
  if (conversation.relatedEntity.type === 'offer') return copy.entityOffer;
  if (conversation.relatedEntity.type === 'order') return copy.entityOrder;
  return copy.entityRequest;
}

export function resolveConversationDisplayName(
  conversation: ChatConversationDto,
  currentUserId: string | null | undefined,
  copy: ChatPageCopy,
) {
  return (
    resolveConversationCounterpart(conversation, currentUserId)?.displayName
    ?? resolveConversationCounterpart(conversation, currentUserId)?.name
    ?? conversation.relatedEntity.title
    ?? `${resolveConversationEntityLabel(copy, conversation)} #${conversation.relatedEntity.id.slice(-6)}`
  );
}

export function resolveConversationPreview(
  conversation: ChatConversationDto,
  copy: ChatPageCopy,
) {
  const text = conversation.lastMessagePreview?.trim() || conversation.lastMessage?.text?.trim();
  return text || copy.previewFallback;
}

export function resolveConversationSubline(
  conversation: ChatConversationDto,
  currentUserId: string | null | undefined,
  copy: ChatPageCopy,
) {
  const counterpart = resolveConversationCounterpart(conversation, currentUserId);
  const roleLabel =
    counterpart?.role === 'provider' ? copy.roleProviderLabel : copy.roleCustomerLabel;
  return conversation.relatedEntity.title ?? roleLabel;
}

export function flattenChatMessagePages(
  pages: ChatMessagesResponseDto[] | undefined,
) {
  if (!pages?.length) return [] as ChatMessageDto[];
  return pages
    .slice()
    .reverse()
    .flatMap((page) => page.items);
}

export function createChatMessageDayGroups(
  messages: ChatMessageDto[],
  currentUserId: string | null | undefined,
) {
  const result: ChatMessageDayGroup[] = [];

  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    const dayKey = Number.isFinite(date.getTime())
      ? date.toISOString().slice(0, 10)
      : 'unknown';
    const own = message.senderId === currentUserId;
    const lastDay = result[result.length - 1];

    if (!lastDay || lastDay.dayKey !== dayKey) {
      result.push({
        dayKey,
        groups: [{ senderId: message.senderId, own, messages: [message] }],
      });
      return;
    }

    const lastGroup = lastDay.groups[lastDay.groups.length - 1];
    if (lastGroup && lastGroup.senderId === message.senderId) {
      lastGroup.messages.push(message);
      return;
    }

    lastDay.groups.push({
      senderId: message.senderId,
      own,
      messages: [message],
    });
  });

  return result;
}

export function createOptimisticChatMessage(args: {
  conversationId: string;
  senderId: string;
  text: string;
}) {
  return {
    id: `optimistic-${Math.random().toString(36).slice(2, 10)}`,
    conversationId: args.conversationId,
    senderId: args.senderId,
    type: 'text' as const,
    text: args.text,
    attachments: [],
    deliveryStatus: 'sent' as const,
    createdAt: new Date().toISOString(),
    pending: true,
  };
}

export function buildChatDraftStorageKey(conversationId: string) {
  return `chat-draft:${conversationId}`;
}
