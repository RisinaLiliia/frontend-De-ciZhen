// src/app/chat/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { RequireAuth } from '@/lib/auth/RequireAuth';
import { useAuthUser } from '@/hooks/useAuthSnapshot';
import { listInbox } from '@/lib/api/chat';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';

type InboxFilter = 'all' | 'client' | 'provider';
const CHAT_INBOX_FILTER_KEY = 'dc_chat_inbox_filter_v1';

export default function ChatInboxPage() {
  const t = useT();
  const user = useAuthUser();
  const userId = user?.id ?? null;
  const [filter, setFilter] = React.useState<InboxFilter>('all');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const scopedKey = `${CHAT_INBOX_FILTER_KEY}:${userId ?? 'guest'}`;
    const raw = window.localStorage.getItem(scopedKey);
    if (raw === 'all' || raw === 'client' || raw === 'provider') {
      setFilter(raw);
    }
  }, [userId]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const scopedKey = `${CHAT_INBOX_FILTER_KEY}:${userId ?? 'guest'}`;
    window.localStorage.setItem(scopedKey, filter);
  }, [filter, userId]);

  const { data, isLoading } = useQuery({
    queryKey: ['chat-inbox', 'all'],
    queryFn: () => listInbox('all'),
  });

  const resolveThreadRole = React.useCallback(
    (thread: {
      clientId: string;
      providerUserId: string;
    }): Exclude<InboxFilter, 'all'> | 'unknown' => {
      if (!userId) return 'unknown';
      if (thread.clientId === userId) return 'client';
      if (thread.providerUserId === userId) return 'provider';
      return 'unknown';
    },
    [userId],
  );

  const getUnreadCount = React.useCallback(
    (
      thread: {
        unreadClientCount: number;
        unreadProviderCount: number;
      },
      mode: InboxFilter,
      resolvedRole: Exclude<InboxFilter, 'all'> | 'unknown',
    ) => {
      if (mode === 'client') return thread.unreadClientCount;
      if (mode === 'provider') return thread.unreadProviderCount;
      if (resolvedRole === 'client') return thread.unreadClientCount;
      if (resolvedRole === 'provider') return thread.unreadProviderCount;
      return thread.unreadClientCount + thread.unreadProviderCount;
    },
    [],
  );

  const filteredThreads = React.useMemo(() => {
    const source = data ?? [];
    if (filter === 'all') return source;
    return source.filter((thread) => resolveThreadRole(thread) === filter);
  }, [data, filter, resolveThreadRole]);

  const unreadByFilter = React.useMemo(() => {
    const source = data ?? [];
    const all = source.reduce((sum, thread) => {
      const role = resolveThreadRole(thread);
      return sum + getUnreadCount(thread, 'all', role);
    }, 0);
    const client = source.reduce((sum, thread) => {
      const role = resolveThreadRole(thread);
      if (role !== 'client') return sum;
      return sum + thread.unreadClientCount;
    }, 0);
    const provider = source.reduce((sum, thread) => {
      const role = resolveThreadRole(thread);
      if (role !== 'provider') return sum;
      return sum + thread.unreadProviderCount;
    }, 0);
    return { all, client, provider };
  }, [data, getUnreadCount, resolveThreadRole]);

  return (
    <RequireAuth>
      <PageShell right={<AuthActions />} title={t(I18N_KEYS.chat.inboxTitle)} withSpacer={true}>
        <div className="card stack-md">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`chip ${filter === 'all' ? 'is-active' : ''}`.trim()}
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
            >
              {t(I18N_KEYS.chat.filterAll)} · {unreadByFilter.all}
            </button>
            <button
              type="button"
              className={`chip ${filter === 'client' ? 'is-active' : ''}`.trim()}
              onClick={() => setFilter('client')}
              aria-pressed={filter === 'client'}
            >
              {t(I18N_KEYS.chat.filterClient)} · {unreadByFilter.client}
            </button>
            <button
              type="button"
              className={`chip ${filter === 'provider' ? 'is-active' : ''}`.trim()}
              onClick={() => setFilter('provider')}
              aria-pressed={filter === 'provider'}
            >
              {t(I18N_KEYS.chat.filterProvider)} · {unreadByFilter.provider}
            </button>
          </div>
          <div className="stack-sm">
            <WorkspaceContentState
              isLoading={isLoading}
              isEmpty={filteredThreads.length === 0}
              emptyTitle={t(I18N_KEYS.chat.empty)}
              emptyHint={t(I18N_KEYS.requestsPage.subtitle)}
              emptyCtaLabel={t(I18N_KEYS.requestsPage.navNewOrders)}
              emptyCtaHref="/requests?tab=new-orders"
            >
              {filteredThreads.map((thread) => {
                const role = resolveThreadRole(thread);
                const unread = getUnreadCount(thread, filter, role);
                const participantId =
                  user?.id && thread.clientId === user.id ? thread.providerUserId : thread.clientId;
                return (
                  <Link key={thread.id} href={`/chat/${thread.id}`} className="card stack-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{t(I18N_KEYS.chat.threadTitle)}</p>
                        <p className="typo-small">{thread.requestId}</p>
                        <p className="typo-small">{participantId}</p>
                        <p className="typo-muted text-xs">
                          {role === 'client'
                            ? t(I18N_KEYS.chat.filterClient)
                            : role === 'provider'
                              ? t(I18N_KEYS.chat.filterProvider)
                              : t(I18N_KEYS.chat.filterAll)}
                        </p>
                      </div>
                      {unread > 0 ? <span className="badge">{unread}</span> : null}
                    </div>
                    <p className="typo-small">{thread.lastMessagePreview || '—'}</p>
                    <p className="typo-muted text-xs">
                      {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleString() : '—'}
                    </p>
                  </Link>
                );
              })}
            </WorkspaceContentState>
          </div>
        </div>
      </PageShell>
    </RequireAuth>
  );
}
