'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { RequireAuth } from '@/lib/auth/RequireAuth';
import { getAccessToken } from '@/lib/auth/token';
import { useAuthUser } from '@/hooks/useAuthSnapshot';
import {
  getChatSocketUrl,
  getConversation,
  getMessages,
  listConversations,
  markConversationRead,
  sendMessage,
} from '@/lib/api/chat';
import { getContract } from '@/lib/api/contracts';
import { listOffersByRequest } from '@/lib/api/offers';
import { getPublicRequestById } from '@/lib/api/requests';
import type {
  ChatConversationDto,
  ChatMessageDto,
  ChatMessageReadEventDto,
  ChatMessagesResponseDto,
} from '@/lib/api/dto/chat';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconPin,
  IconSearch,
  IconSend,
} from '@/components/ui/icons/icons';
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
  resolveConversationEntityLabel,
  resolveConversationPreview,
  resolveConversationRequestId,
  resolveConversationSubline,
  resolveConversationUnreadCount,
} from '@/features/chat/chat.model';
import styles from './ChatWorkspacePage.module.css';

const CONVERSATIONS_QUERY_KEY = ['chat', 'conversations'] as const;
const MESSAGES_PAGE_SIZE = 24;
const CONVERSATIONS_PAGE_SIZE = 24;

type MessagesCache = InfiniteData<ChatMessagesResponseDto, string | undefined>;
type ConversationsCache = {
  items: ChatConversationDto[];
  nextCursor?: string;
};

function toLocaleTag(locale: string) {
  return locale === 'en' ? 'en-US' : 'de-DE';
}

function formatSidebarTime(value: string, localeTag: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';

  const now = new Date();
  const sameDay = now.toDateString() === date.toDateString();
  return new Intl.DateTimeFormat(localeTag, sameDay
    ? { hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short' }).format(date);
}

function formatMessageTime(value: string, localeTag: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat(localeTag, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDateDivider(value: string, localeTag: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatLastSeen(value: string, localeTag: string, prefix: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return prefix;
  return `${prefix} ${new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)}`;
}

function getInitials(name: string | null | undefined) {
  const normalized = String(name ?? '').trim();
  if (!normalized) return '?';
  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function SidebarSkeleton() {
  return (
    <div className={styles.sidebarList} aria-hidden="true">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={`sidebar-skeleton-${index}`} className={styles.conversationItem}>
          <Skeleton className={styles.avatarSkeleton} />
          <div className={styles.sidebarSkeletonBody}>
            <div className={styles.sidebarSkeletonRow}>
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-10 rounded-md" />
            </div>
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className={styles.messageSkeletonList} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`message-skeleton-${index}`}
          className={`${styles.messageRow} ${index % 2 === 0 ? styles.messageRowOwn : ''}`.trim()}
        >
          <div className={styles.messageStack}>
            <Skeleton className="h-10 w-40 rounded-[18px]" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversationAvatar({
  name,
  isOnline,
}: {
  name: string | null | undefined;
  isOnline?: boolean | null;
}) {
  return (
    <span className={styles.avatar} aria-hidden="true">
      {getInitials(name)}
      {isOnline ? <span className={styles.avatarStatus} /> : null}
    </span>
  );
}

export function ChatWorkspacePage() {
  const user = useAuthUser();
  const { locale } = useI18n();
  const copy = React.useMemo(() => getChatPageCopy(locale), [locale]);
  const localeTag = React.useMemo(() => toLocaleTag(locale), [locale]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUserId = user?.id ?? null;
  const conversationParam = searchParams.get('conversation');
  const filter = resolveChatListFilter(
    searchParams.get('filter'),
    searchParams.get('role'),
    searchParams.get('state'),
  );
  const [searchInput, setSearchInput] = React.useState(searchParams.get('search') ?? '');
  const deferredSearch = React.useDeferredValue(searchInput.trim());
  const [isInfoOpen, setInfoOpen] = React.useState(false);
  const [composerValue, setComposerValue] = React.useState('');
  const messagesViewportRef = React.useRef<HTMLDivElement | null>(null);
  const composerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const chatSocketRef = React.useRef<Socket | null>(null);

  const updateRoute = React.useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const next = patchChatSearchParams(new URLSearchParams(searchParams.toString()), updates);
      const query = next.toString();
      router.replace(query ? `/chat?${query}` : '/chat', { scroll: false });
    },
    [router, searchParams],
  );

  React.useEffect(() => {
    const nextSearch = searchParams.get('search') ?? '';
    if (nextSearch !== searchInput) {
      setSearchInput(nextSearch);
    }
  }, [searchInput, searchParams]);

  React.useEffect(() => {
    const currentSearch = searchParams.get('search') ?? '';
    if (deferredSearch === currentSearch) return;
    updateRoute({ search: deferredSearch, conversation: conversationParam, filter });
  }, [conversationParam, deferredSearch, filter, searchParams, updateRoute]);

  const conversationsQuery = useQuery({
    queryKey: [...CONVERSATIONS_QUERY_KEY, filter, deferredSearch],
    queryFn: () =>
      listConversations({
        ...mapChatFilterToQuery(filter),
        search: deferredSearch || undefined,
        limit: CONVERSATIONS_PAGE_SIZE,
      }),
  });

  const allConversations = React.useMemo(
    () => conversationsQuery.data?.items ?? [],
    [conversationsQuery.data?.items],
  );
  const selectedConversationFromList = React.useMemo(
    () => (
      conversationParam
        ? allConversations.find((item) => item.id === conversationParam) ?? null
        : allConversations[0] ?? null
    ),
    [allConversations, conversationParam],
  );
  const selectedConversationQuery = useQuery({
    queryKey: ['chat', 'conversation', conversationParam],
    enabled: Boolean(conversationParam && !selectedConversationFromList),
    queryFn: () => withStatusFallback(() => getConversation(String(conversationParam)), null),
  });
  const allConversationsWithSelected = React.useMemo(() => {
    const selectedFromQuery = selectedConversationQuery.data;
    if (!selectedFromQuery) return allConversations;
    if (allConversations.some((item) => item.id === selectedFromQuery.id)) return allConversations;
    if (deferredSearch || filter !== 'all') return allConversations;
    return [selectedFromQuery, ...allConversations];
  }, [allConversations, deferredSearch, filter, selectedConversationQuery.data]);
  const conversations = React.useMemo(
    () => filterVisibleConversations(allConversationsWithSelected, filter, currentUserId),
    [allConversationsWithSelected, currentUserId, filter],
  );
  const totalUnread = React.useMemo(
    () => countUnreadConversations(allConversationsWithSelected, currentUserId),
    [allConversationsWithSelected, currentUserId],
  );
  const selectedConversation = selectedConversationFromList ?? selectedConversationQuery.data ?? null;
  const firstVisibleConversationId = conversations[0]?.id ?? null;
  const selectedConversationId = selectedConversation?.id ?? null;
  const selectedUnreadCount = selectedConversation
    ? resolveConversationUnreadCount(selectedConversation, currentUserId)
    : 0;
  const requestId = selectedConversation ? resolveConversationRequestId(selectedConversation) : null;
  const offerId =
    selectedConversation?.relatedEntity.offerId
    ?? (selectedConversation?.relatedEntity.type === 'offer'
      ? selectedConversation.relatedEntity.id
      : null);
  const orderId =
    selectedConversation?.relatedEntity.orderId
    ?? (selectedConversation?.relatedEntity.type === 'order'
      ? selectedConversation.relatedEntity.id
      : null);

  React.useEffect(() => {
    if (conversationsQuery.isLoading || selectedConversationQuery.isLoading) return;
    if (!conversationParam) {
      if (!firstVisibleConversationId) return;
      updateRoute({ conversation: firstVisibleConversationId, filter });
      return;
    }
    if (selectedConversation) return;
    if (!firstVisibleConversationId) {
      updateRoute({ conversation: null, filter });
      return;
    }
    updateRoute({ conversation: firstVisibleConversationId, filter });
  }, [
    conversationParam,
    conversationsQuery.isLoading,
    firstVisibleConversationId,
    filter,
    selectedConversation,
    selectedConversationQuery.isLoading,
    updateRoute,
  ]);

  React.useEffect(() => {
    setInfoOpen(false);
  }, [selectedConversationId]);

  React.useEffect(() => {
    if (!selectedConversationId || typeof window === 'undefined') {
      setComposerValue('');
      return;
    }
    const nextDraft = window.localStorage.getItem(buildChatDraftStorageKey(selectedConversationId)) ?? '';
    setComposerValue(nextDraft);
  }, [selectedConversationId]);

  React.useEffect(() => {
    if (!selectedConversationId || typeof window === 'undefined') return;
    const key = buildChatDraftStorageKey(selectedConversationId);
    if (composerValue.trim()) {
      window.localStorage.setItem(key, composerValue);
    } else {
      window.localStorage.removeItem(key);
    }
  }, [composerValue, selectedConversationId]);

  React.useEffect(() => {
    const node = composerRef.current;
    if (!node) return;
    node.style.height = '0px';
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  }, [composerValue, selectedConversationId]);

  const requestQuery = useQuery({
    queryKey: ['chat', 'request', requestId],
    enabled: Boolean(requestId),
    queryFn: () => withStatusFallback(() => getPublicRequestById(String(requestId)), null),
  });

  const offerQuery = useQuery({
    queryKey: ['chat', 'offer', requestId, offerId],
    enabled: Boolean(requestId && offerId),
    queryFn: async () => {
      const offers = await withStatusFallback(() => listOffersByRequest(String(requestId)), []);
      return offers.find((item) => item.id === offerId) ?? null;
    },
  });

  const orderQuery = useQuery({
    queryKey: ['chat', 'order', orderId],
    enabled: Boolean(orderId),
    queryFn: () => withStatusFallback(() => getContract(String(orderId)), null),
  });

  const messagesQuery = useInfiniteQuery({
    queryKey: ['chat', 'messages', selectedConversationId],
    enabled: Boolean(selectedConversationId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getMessages(String(selectedConversationId), {
        limit: MESSAGES_PAGE_SIZE,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const messages = React.useMemo(
    () => flattenChatMessagePages(messagesQuery.data?.pages),
    [messagesQuery.data?.pages],
  );
  const messageDayGroups = React.useMemo(
    () => createChatMessageDayGroups(messages, currentUserId),
    [currentUserId, messages],
  );

  const replaceOptimisticMessage = React.useCallback(
    (conversationId: string, optimisticId: string, nextMessage: ChatMessageDto) => {
      queryClient.setQueryData<MessagesCache>(
        ['chat', 'messages', conversationId],
        (current) => {
          if (!current) {
            return {
              pages: [{ items: [nextMessage] }],
              pageParams: [undefined],
            };
          }

          return {
            ...current,
            pages: current.pages.map((page, pageIndex) => {
              if (pageIndex !== 0) return page;
              return {
                ...page,
                items: page.items.map((item) =>
                  item.id === optimisticId ? { ...nextMessage, pending: false } : item,
                ),
              };
            }),
          };
        },
      );
    },
    [queryClient],
  );

  const upsertConversationInCache = React.useCallback(
    (conversation: ChatConversationDto) => {
      queryClient.setQueriesData<ConversationsCache>(
        { queryKey: CONVERSATIONS_QUERY_KEY },
        (current) => {
          if (!current) return current;
          const existingIndex = current.items.findIndex((item) => item.id === conversation.id);
          const nextItems = existingIndex >= 0
            ? current.items.map((item) => (item.id === conversation.id ? conversation : item))
            : [conversation, ...current.items];

          nextItems.sort(
            (left, right) =>
              new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
          );

          return {
            ...current,
            items: nextItems,
          };
        },
      );
    },
    [queryClient],
  );

  const applyIncomingMessage = React.useCallback(
    (message: ChatMessageDto) => {
      if (!message.conversationId) return;

      queryClient.setQueryData<MessagesCache>(
        ['chat', 'messages', message.conversationId],
        (current) => {
          if (!current) return current;

          let replacedPending = false;
          const nextPages = current.pages.map((page, pageIndex) => {
            if (pageIndex !== 0) return page;

            const hasExact = page.items.some((item) => item.id === message.id);
            if (hasExact) {
              return {
                ...page,
                items: page.items.map((item) =>
                  item.id === message.id ? { ...message, pending: false } : item,
                ),
              };
            }

            const items = page.items.map((item) => {
              if (
                !replacedPending
                && item.pending
                && item.senderId === message.senderId
                && item.text === message.text
              ) {
                replacedPending = true;
                return { ...message, pending: false };
              }
              return item;
            });

            if (!replacedPending) {
              items.push(message);
            }

            items.sort(
              (left, right) =>
                new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
            );

            return {
              ...page,
              items,
            };
          });

          return {
            ...current,
            pages: nextPages,
          };
        },
      );
    },
    [queryClient],
  );

  const applyReadReceipt = React.useCallback(
    (event: ChatMessageReadEventDto) => {
      queryClient.setQueryData<MessagesCache>(
        ['chat', 'messages', event.conversationId],
        (current) => {
          if (!current) return current;
          const readAt = new Date(event.readAt).getTime();
          if (!Number.isFinite(readAt)) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => {
                if (
                  item.senderId === event.userId
                  || new Date(item.createdAt).getTime() > readAt
                  || item.deliveryStatus === 'read'
                ) {
                  return item;
                }
                return { ...item, deliveryStatus: 'read' as const, pending: false };
              }),
            })),
          };
        },
      );
    },
    [queryClient],
  );

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedConversationId) throw new Error('conversationId is required');
      return sendMessage({
        conversationId: selectedConversationId,
        text,
      });
    },
    onMutate: async (text) => {
      if (!selectedConversationId || !currentUserId) return null;
      const queryKey = ['chat', 'messages', selectedConversationId] as const;
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<MessagesCache>(queryKey);
      const optimistic = createOptimisticChatMessage({
        conversationId: selectedConversationId,
        senderId: currentUserId,
        text,
      });

      queryClient.setQueryData<MessagesCache>(queryKey, (current) => {
        if (!current) {
          return {
            pages: [{ items: [optimistic] }],
            pageParams: [undefined],
          };
        }

        const [firstPage, ...rest] = current.pages;
        const nextFirstPage = firstPage
          ? { ...firstPage, items: [...firstPage.items, optimistic] }
          : { items: [optimistic] };

        return {
          ...current,
          pages: [nextFirstPage, ...rest],
        };
      });

      return {
        previous,
        conversationId: selectedConversationId,
        optimisticId: optimistic.id,
      };
    },
    onError: (error, _text, context) => {
      if (context?.previous && context.conversationId) {
        queryClient.setQueryData(['chat', 'messages', context.conversationId], context.previous);
      }
      const message = error instanceof Error ? error.message : copy.threadEmptyHint;
      toast.error(message);
    },
    onSuccess: (message, _text, context) => {
      if (context?.conversationId && context.optimisticId) {
        replaceOptimisticMessage(context.conversationId, context.optimisticId, message);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      if (selectedConversationId) {
        await queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', selectedConversationId] });
        await queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedConversationId] });
      }
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (conversationId: string) => markConversationRead(conversationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      if (selectedConversationId) {
        await queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', selectedConversationId] });
      }
    },
  });

  React.useEffect(() => {
    if (!selectedConversationId || selectedUnreadCount <= 0 || markReadMutation.isPending) return;
    markReadMutation.mutate(selectedConversationId);
  }, [markReadMutation, markReadMutation.isPending, selectedConversationId, selectedUnreadCount]);

  const handleSocketConversationUpdated = React.useEffectEvent((conversation: ChatConversationDto) => {
    upsertConversationInCache(conversation);
    queryClient.setQueryData(['chat', 'conversation', conversation.id], conversation);
    if (conversation.id !== selectedConversationId) return;
    if (requestId) {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'request', requestId] });
    }
    if (offerId) {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'offer', requestId, offerId] });
    }
    if (orderId) {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'order', orderId] });
    }
  });

  const handleSocketMessageCreated = React.useEffectEvent((message: ChatMessageDto) => {
    applyIncomingMessage(message);
    void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    if (message.conversationId !== selectedConversationId) return;
    void queryClient.invalidateQueries({ queryKey: ['chat', 'messages', message.conversationId] });
  });

  const handleSocketMessageRead = React.useEffectEvent((event: ChatMessageReadEventDto) => {
    applyReadReceipt(event);
    void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
  });

  React.useEffect(() => {
    if (!currentUserId) return;
    const token = getAccessToken();
    const socketUrl = getChatSocketUrl();
    if (!token || !socketUrl) return;

    if (chatSocketRef.current) {
      chatSocketRef.current.removeAllListeners();
      chatSocketRef.current.disconnect();
      chatSocketRef.current = null;
    }

    const socket = io(socketUrl, {
      transports: ['websocket'],
      auth: { token: `Bearer ${token}` },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 5_000,
    });

    socket.on('chat.conversation.updated', handleSocketConversationUpdated);
    socket.on('chat.message.created', handleSocketMessageCreated);
    socket.on('chat.message.read', handleSocketMessageRead);
    chatSocketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      if (chatSocketRef.current === socket) {
        chatSocketRef.current = null;
      }
    };
  }, [currentUserId]);

  React.useEffect(() => {
    const node = messagesViewportRef.current;
    if (!node) return;
    const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 120;
    if (nearBottom || messages.at(-1)?.senderId === currentUserId) {
      node.scrollTop = node.scrollHeight;
    }
  }, [currentUserId, messages, selectedConversationId]);

  const handleSend = React.useCallback(async () => {
    const trimmed = composerValue.trim();
    const canSend = Boolean(trimmed && selectedConversationId && selectedConversation?.state !== 'closed');
    if (!canSend || sendMessageMutation.isPending) return;

    if (selectedConversationId && typeof window !== 'undefined') {
      window.localStorage.removeItem(buildChatDraftStorageKey(selectedConversationId));
    }

    setComposerValue('');

    try {
      await sendMessageMutation.mutateAsync(trimmed);
    } catch {
      setComposerValue(trimmed);
    }
  }, [composerValue, selectedConversation, selectedConversationId, sendMessageMutation]);

  const counterpart = selectedConversation
    ? resolveConversationCounterpart(selectedConversation, currentUserId)
    : null;
  const counterpartName = selectedConversation
    ? resolveConversationDisplayName(selectedConversation, currentUserId, copy)
    : '—';
  const counterpartPresence =
    counterpart?.isOnline
      ? copy.onlineNow
      : counterpart?.lastSeenAt
        ? formatLastSeen(counterpart.lastSeenAt, localeTag, copy.lastSeen)
        : selectedConversation
          ? resolveConversationSubline(selectedConversation, currentUserId, copy)
          : copy.threadIdleHint;
  const relatedEntityTitle =
    requestQuery.data?.title
    ?? selectedConversation?.relatedEntity.title
    ?? null;
  const contextStatus =
    orderQuery.data?.status
    ?? offerQuery.data?.status
    ?? requestQuery.data?.status
    ?? selectedConversation?.relatedEntity.status
    ?? copy.statusUnknown;
  const contextAmount =
    offerQuery.data?.amount
    ?? requestQuery.data?.price
    ?? selectedConversation?.relatedEntity.amount
    ?? null;
  const requestHref = requestId ? `/requests/${requestId}` : null;
  const profileHref = counterpart?.userId ? `/profile/${counterpart.userId}` : null;
  const secondaryHref =
    selectedConversation?.relatedEntity.type === 'order'
      ? '/workspace?tab=completed-jobs'
      : selectedConversation?.relatedEntity.type === 'offer'
        ? '/workspace?tab=my-offers'
        : null;
  const secondaryLabel =
    selectedConversation?.relatedEntity.type === 'order'
      ? copy.openOrders
      : selectedConversation?.relatedEntity.type === 'offer'
        ? copy.openOffers
        : null;
  const listFilters = [
    { key: 'all', label: copy.filterAll },
    { key: 'unread', label: copy.filterUnread },
    { key: 'customer', label: copy.filterCustomer },
    { key: 'provider', label: copy.filterProvider },
    { key: 'archived', label: copy.filterArchived },
  ] as const;
  const hasConversations = allConversationsWithSelected.length > 0;
  const showSearchEmpty =
    conversations.length === 0 && (Boolean(deferredSearch) || filter !== 'all');
  const composerDisabled = !selectedConversation || selectedConversation.state === 'closed';

  return (
    <RequireAuth>
      <section
        className={`${styles.shell} ${selectedConversation ? styles.shellThreadSelected : ''}`.trim()}
      >
        <aside className={styles.sidebarPane}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitleRow}>
              <h1 className={styles.sidebarTitle}>{copy.title}</h1>
              {totalUnread > 0 ? (
                <span className={styles.sidebarBadge}>{Math.min(totalUnread, 99)}{totalUnread > 99 ? '+' : ''}</span>
              ) : null}
            </div>

            <label className={styles.searchField}>
              <span className={styles.searchIcon} aria-hidden="true">
                <IconSearch />
              </span>
              <Input
                aria-label={copy.searchLabel}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className={styles.searchInput}
              />
            </label>

            <div className={styles.filterRow} role="tablist" aria-label={copy.title}>
              {listFilters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.key}
                  className={`${styles.filterChip} ${filter === item.key ? styles.filterChipActive : ''}`.trim()}
                  onClick={() => updateRoute({ filter: item.key, conversation: selectedConversationId })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sidebarBody}>
            {conversationsQuery.isLoading ? (
              <SidebarSkeleton />
            ) : showSearchEmpty ? (
              <div className={styles.sidebarEmptyState}>
                <h2 className={styles.emptyTitle}>{copy.listSearchEmptyTitle}</h2>
                <p className={styles.emptyHint}>{copy.listSearchEmptyHint}</p>
              </div>
            ) : !hasConversations ? (
              <div className={styles.sidebarEmptyState}>
                <h2 className={styles.emptyTitle}>{copy.listEmptyTitle}</h2>
                <p className={styles.emptyHint}>{copy.listEmptyHint}</p>
              </div>
            ) : (
              <div className={styles.sidebarList} role="listbox" aria-label={copy.title}>
                {conversations.map((conversation, index) => {
                  const unread = resolveConversationUnreadCount(conversation, currentUserId);
                  const active = conversation.id === selectedConversationId;
                  const displayName = resolveConversationDisplayName(conversation, currentUserId, copy);
                  const preview = resolveConversationPreview(conversation, copy);
                  const subline = resolveConversationSubline(conversation, currentUserId, copy);
                  const counterpartParticipant = resolveConversationCounterpart(conversation, currentUserId);
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`${styles.conversationItem} ${active ? styles.conversationItemActive : ''}`.trim()}
                      onClick={() => updateRoute({ conversation: conversation.id, filter })}
                      onKeyDown={(event) => {
                        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                        event.preventDefault();
                        const delta = event.key === 'ArrowDown' ? 1 : -1;
                        const next = conversations[index + delta];
                        if (next) updateRoute({ conversation: next.id, filter });
                      }}
                    >
                      <ConversationAvatar
                        name={displayName}
                        isOnline={counterpartParticipant?.isOnline}
                      />

                      <div className={styles.conversationBody}>
                        <div className={styles.conversationTopRow}>
                          <p className={`${styles.conversationName} ${unread > 0 ? styles.conversationNameUnread : ''}`.trim()}>
                            {displayName}
                          </p>
                          <span className={styles.conversationTime}>
                            {formatSidebarTime(conversation.lastMessage?.createdAt ?? conversation.updatedAt, localeTag)}
                          </span>
                        </div>

                        <div className={styles.conversationBottomRow}>
                          <p className={styles.conversationPreview}>
                            <span className={styles.conversationTag}>
                              {resolveConversationEntityLabel(copy, conversation)}
                            </span>
                            <span className={styles.conversationPreviewText}>{preview}</span>
                          </p>
                          {unread > 0 ? (
                            <span className={styles.unreadBadge} aria-label={`${unread} ${copy.unreadShort}`}>
                              {Math.min(unread, 99)}
                            </span>
                          ) : null}
                        </div>

                        <p className={styles.conversationSubline}>{subline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className={styles.threadPane}>
          {!selectedConversation ? (
            <div className={`${styles.threadEmptyState} ${styles.threadEmptyStateCentered}`.trim()}>
              <h2 className={styles.emptyTitle}>
                {hasConversations ? copy.threadIdleTitle : copy.listEmptyTitle}
              </h2>
              <p className={styles.emptyHint}>
                {hasConversations ? copy.threadIdleHint : copy.listEmptyHint}
              </p>
            </div>
          ) : (
            <>
              <header className={styles.threadHeader}>
                <div className={styles.threadHeaderMain}>
                  <button
                    type="button"
                    className={styles.mobileBackButton}
                    onClick={() => updateRoute({ conversation: null, filter })}
                    aria-label={copy.backToChats}
                  >
                    <IconChevronLeft />
                  </button>

                  <ConversationAvatar
                    name={counterpartName}
                    isOnline={counterpart?.isOnline}
                  />

                  <div className={styles.threadHeaderBody}>
                    <h2 className={styles.threadTitle}>{counterpartName}</h2>
                    <p className={styles.threadSubtitle}>{counterpartPresence}</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  fullWidth={false}
                  className={styles.infoButton}
                  onClick={() => setInfoOpen(true)}
                  aria-expanded={isInfoOpen}
                >
                  {copy.info}
                </Button>
              </header>

              {(relatedEntityTitle || contextStatus) ? (
                <div className={styles.contextBar}>
                  <span className={styles.contextBarLabel}>{copy.relatedTo}</span>
                  <span className={styles.contextBarText}>
                    {relatedEntityTitle ?? selectedConversation.relatedEntity.id}
                  </span>
                  <span className={styles.contextBarDot} aria-hidden="true" />
                  <span className={styles.contextBarStatus}>{contextStatus}</span>
                </div>
              ) : null}

              <div ref={messagesViewportRef} className={styles.messagesScroll} role="log" aria-live="polite">
                {messagesQuery.isLoading ? (
                  <MessageSkeleton />
                ) : (
                  <>
                    {messagesQuery.hasNextPage ? (
                      <div className={styles.messagesTopAction}>
                        <button
                          type="button"
                          className={styles.loadOlderButton}
                          onClick={() => void messagesQuery.fetchNextPage()}
                          disabled={messagesQuery.isFetchingNextPage}
                        >
                          {copy.loadOlder}
                        </button>
                      </div>
                    ) : null}

                    {messages.length === 0 ? (
                      <div className={styles.messagesEmptyState}>
                        <h3 className={styles.emptyTitle}>{copy.threadEmptyTitle}</h3>
                        <p className={styles.emptyHint}>{copy.threadEmptyHint}</p>
                      </div>
                    ) : (
                      messageDayGroups.map((day) => (
                        <div key={day.dayKey} className={styles.dayBlock}>
                          <div className={styles.dateDivider}>
                            <span>{formatDateDivider(day.dayKey, localeTag)}</span>
                          </div>

                          {day.groups.map((group, groupIndex) => (
                            <div
                              key={`${day.dayKey}-${group.senderId}-${groupIndex}`}
                              className={`${styles.messageRow} ${group.own ? styles.messageRowOwn : ''}`.trim()}
                            >
                              <div className={`${styles.messageStack} ${group.own ? styles.messageStackOwn : ''}`.trim()}>
                                {group.messages.map((message, messageIndex) => {
                                  const isLast = messageIndex === group.messages.length - 1;
                                  return (
                                    <div
                                      key={message.id}
                                      className={`${styles.messageBubble} ${group.own ? styles.messageBubbleOwn : ''}`.trim()}
                                    >
                                      {message.text ? (
                                        <p className={styles.messageText}>{message.text}</p>
                                      ) : null}

                                      {message.attachments?.length ? (
                                        <div className={styles.attachmentList}>
                                          {message.attachments.map((attachment) => (
                                            <a
                                              key={`${message.id}-${attachment.url}`}
                                              href={attachment.url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className={styles.attachmentLink}
                                            >
                                              {attachment.name}
                                            </a>
                                          ))}
                                        </div>
                                      ) : null}

                                      {isLast ? (
                                        <div className={styles.messageMeta}>
                                          <span>{formatMessageTime(message.createdAt, localeTag)}</span>
                                          {group.own ? (
                                            <span>
                                              {message.pending
                                                ? copy.readStatePending
                                                : message.deliveryStatus === 'read'
                                                  ? copy.readStateRead
                                                  : message.deliveryStatus === 'delivered'
                                                    ? copy.readStateDelivered
                                                    : copy.readStateSent}
                                            </span>
                                          ) : null}
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>

              <div className={styles.composerBar}>
                <div className={styles.composerInner}>
                  <textarea
                    ref={composerRef}
                    value={composerValue}
                    onChange={(event) => setComposerValue(event.target.value)}
                    placeholder={copy.composerPlaceholder}
                    className={`field field-textarea ${styles.composerInput}`}
                    rows={1}
                    disabled={composerDisabled}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                  />

                  <button
                    type="button"
                    className={styles.sendButton}
                    onClick={() => void handleSend()}
                    disabled={composerDisabled || !composerValue.trim() || sendMessageMutation.isPending}
                    aria-label={copy.composerCta}
                  >
                    <IconSend />
                  </button>
                </div>

                <p className={styles.composerState}>
                  {composerDisabled
                    ? copy.composerClosed
                    : sendMessageMutation.isPending
                      ? copy.composerSending
                      : ' '}
                </p>
              </div>
            </>
          )}
        </section>

        {selectedConversation && isInfoOpen ? (
          <>
            <button
              type="button"
              className={styles.drawerBackdrop}
              aria-label={copy.close}
              onClick={() => setInfoOpen(false)}
            />
            <aside className={styles.infoDrawer} role="dialog" aria-modal="true" aria-label={copy.infoTitle}>
              <div className={styles.infoDrawerHeader}>
                <h2 className={styles.infoDrawerTitle}>{copy.infoTitle}</h2>
                <Button
                  variant="ghost"
                  fullWidth={false}
                  onClick={() => setInfoOpen(false)}
                  className={styles.infoDrawerClose}
                >
                  {copy.close}
                </Button>
              </div>

              <div className={styles.infoDrawerBody}>
                <section className={styles.infoSection}>
                  <p className={styles.infoLabel}>{copy.relatedTo}</p>
                  <h3 className={styles.infoHeadline}>
                    {relatedEntityTitle ?? selectedConversation.relatedEntity.id}
                  </h3>
                  <div className={styles.infoMetaList}>
                    <div className={styles.infoMetaRow}>
                      <span className={styles.infoMetaIcon} aria-hidden="true">
                        <IconCheck />
                      </span>
                      <div>
                        <p className={styles.infoLabel}>Status</p>
                        <p className={styles.infoValue}>{contextStatus}</p>
                      </div>
                    </div>

                    <div className={styles.infoMetaRow}>
                      <span className={styles.infoMetaIcon} aria-hidden="true">
                        <IconCalendar />
                      </span>
                      <div>
                        <p className={styles.infoLabel}>Aktualisiert</p>
                        <p className={styles.infoValue}>
                          {formatSidebarTime(selectedConversation.updatedAt, localeTag)}
                        </p>
                      </div>
                    </div>

                    <div className={styles.infoMetaRow}>
                      <span className={styles.infoMetaIcon} aria-hidden="true">
                        <IconPin />
                      </span>
                      <div>
                        <p className={styles.infoLabel}>Budget</p>
                        <p className={styles.infoValue}>
                          {contextAmount != null
                            ? new Intl.NumberFormat(localeTag, {
                                style: 'currency',
                                currency: 'EUR',
                                maximumFractionDigits: 0,
                              }).format(contextAmount)
                            : copy.amountOpen}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className={styles.infoSection}>
                  <p className={styles.infoLabel}>{copy.participantTitle}</p>
                  <div className={styles.participantCard}>
                    <ConversationAvatar
                      name={counterpartName}
                      isOnline={counterpart?.isOnline}
                    />
                    <div className={styles.participantBody}>
                      <h3 className={styles.participantName}>{counterpartName}</h3>
                      <p className={styles.participantMeta}>{counterpartPresence}</p>
                    </div>
                  </div>
                </section>

                <div className={styles.infoActions}>
                  {requestHref ? (
                    <Link href={requestHref} prefetch={false} className="btn-secondary">
                      {copy.openRequest}
                    </Link>
                  ) : null}
                  {profileHref ? (
                    <Link href={profileHref} prefetch={false} className="btn-ghost">
                      {copy.openProfile}
                    </Link>
                  ) : null}
                  {secondaryHref && secondaryLabel ? (
                    <Link href={secondaryHref} prefetch={false} className="btn-ghost">
                      {secondaryLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
            </aside>
          </>
        ) : null}
      </section>
    </RequireAuth>
  );
}
