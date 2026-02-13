// src/app/chat/[responseId]/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { RequireAuth } from '@/lib/auth/RequireAuth';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { listMessages, markThreadRead, sendMessage } from '@/lib/api/chat';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ChatPage() {
  const t = useT();
  const params = useParams();
  const threadId = params?.responseId as string;
  const qc = useQueryClient();
  const [text, setText] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['chat-messages', threadId],
    queryFn: () => listMessages(threadId, { limit: 50, offset: 0 }),
    enabled: Boolean(threadId),
  });

  React.useEffect(() => {
    if (!threadId) return;
    markThreadRead(threadId).catch(() => undefined);
  }, [threadId]);

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      await sendMessage(threadId, { text: trimmed });
      setText('');
      await qc.invalidateQueries({ queryKey: ['chat-messages', threadId] });
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  return (
    <RequireAuth>
      <PageShell right={<AuthActions />} title={t(I18N_KEYS.chat.title)} withSpacer={true}>
        <div className="card stack-md">
          {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}
          <div className="stack-sm">
            {(data ?? []).slice().reverse().map((msg) => (
              <div key={msg.id} className="card stack-xs">
                <p className="typo-small">{msg.text}</p>
                <p className="typo-muted text-xs">{new Date(msg.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t(I18N_KEYS.chat.placeholder)} />
            <Button type="button" onClick={onSend}>
              {t(I18N_KEYS.chat.sendCta)}
            </Button>
          </div>
        </div>
      </PageShell>
    </RequireAuth>
  );
}
