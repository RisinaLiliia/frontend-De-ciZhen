'use client';

import {
  WorkspaceSectionHeader,
} from '@/features/workspace/shell';
import { useI18n } from '@/lib/i18n/I18nProvider';

function getWorkspaceHelpCopy(locale: string) {
  if (locale === 'en') {
    return {
      title: 'Help center',
      description:
        'Find the fastest next step for support, workspace navigation, account settings, and common operating questions.',
    };
  }

  return {
    title: 'Hilfezentrum',
    description:
      'Finde den schnellsten nächsten Schritt für Support, Workspace-Navigation, Einstellungen und typische Arbeitsfragen.',
  };
}

export function WorkspaceHelpIntro() {
  const { locale } = useI18n();
  const copy = getWorkspaceHelpCopy(locale);

  return (
    <WorkspaceSectionHeader
      title={copy.title}
      description={copy.description}
    />
  );
}
