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

export default function ChatInboxPage() {
  const t = useT();
  const user = useAuthUser();
  const role = user?.role === 'provider' ? 'provider' : user?.role === 'client' ? 'client' : 'all';

  const { data, isLoading } = useQuery({
    queryKey: ['chat-inbox', role],
    queryFn: () => listInbox(role),
  });

  return (
    <RequireAuth>
      <PageShell right={<AuthActions />} title={t(I18N_KEYS.chat.inboxTitle)} withSpacer={true}>
        <div className="card stack-md">
          {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}
          <div className="stack-sm">
            {(data ?? []).length === 0 ? (
              <p className="typo-muted">{t(I18N_KEYS.chat.empty)}</p>
            ) : (
              (data ?? []).map((thread) => {
                const unread =
                  role === 'provider'
                    ? thread.unreadProviderCount
                    : role === 'client'
                      ? thread.unreadClientCount
                      : thread.unreadClientCount + thread.unreadProviderCount;
                const participantId =
                  user?.id && thread.clientId === user.id ? thread.providerUserId : thread.clientId;
                return (
                  <Link key={thread.id} href={`/chat/${thread.id}`} className="card stack-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{t(I18N_KEYS.chat.threadTitle)}</p>
                        <p className="typo-small">{thread.requestId}</p>
                        <p className="typo-small">{participantId}</p>
                      </div>
                      {unread > 0 ? <span className="badge">{unread}</span> : null}
                    </div>
                    <p className="typo-small">{thread.lastMessagePreview || '—'}</p>
                    <p className="typo-muted text-xs">
                      {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleString() : '—'}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </PageShell>
    </RequireAuth>
  );
}
