'use client';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { ChatWorkspacePage } from '@/features/chat/ChatWorkspacePage';

export default function ChatPage() {
  return (
    <PageShell
      right={<AuthActions />}
      title="Nachrichten"
      withSpacer={false}
      showBack={false}
      mainClassName="pb-0"
    >
      <ChatWorkspacePage />
    </PageShell>
  );
}
