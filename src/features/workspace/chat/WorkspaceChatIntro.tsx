'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import { WorkspaceSectionHeader } from '@/features/workspace/shell';
import { getChatPageCopy } from '@/features/workspace/chat/model/chat.model';

function getChatWorkspaceDescription(locale: string) {
  if (locale === 'en') {
    return 'Manage conversations without leaving the workspace and keep context, requests, and next actions visible.';
  }

  return 'Verwalte Gespräche direkt im Workspace und behalte Kontext, Anfragen und nächste Schritte im Blick.';
}

export function WorkspaceChatIntro() {
  const { locale } = useI18n();
  const chatCopy = getChatPageCopy(locale);

  return (
    <WorkspaceSectionHeader
      title={chatCopy.title}
      description={getChatWorkspaceDescription(locale)}
    />
  );
}
