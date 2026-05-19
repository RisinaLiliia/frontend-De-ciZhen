'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import {
  buildSharedContextControlsProps,
  WorkspaceSectionHeader,
  useWorkspaceSharedContext,
} from '@/features/workspace/shell';
import { getChatPageCopy } from '@/features/chat/chat.model';

function getChatWorkspaceDescription(locale: string) {
  if (locale === 'en') {
    return 'Manage conversations without leaving the workspace and keep context, requests, and next actions visible.';
  }

  return 'Verwalte Gespräche direkt im Workspace und behalte Kontext, Anfragen und nächste Schritte im Blick.';
}

export function WorkspaceChatIntro() {
  const t = useT();
  const { locale } = useI18n();
  const chatCopy = getChatPageCopy(locale);
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection: 'chat',
    activeWorkspaceTab: 'my-requests',
  });
  const sharedContextControlsProps = buildSharedContextControlsProps({ model, t, locale });

  return (
    <WorkspaceSectionHeader
      eyebrow="Workspace"
      title={chatCopy.title}
      description={getChatWorkspaceDescription(locale)}
      shellHint={model.copy.shellHint}
      sharedContextControlsProps={sharedContextControlsProps}
    />
  );
}
