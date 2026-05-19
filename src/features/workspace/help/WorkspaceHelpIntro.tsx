'use client';

import {
  buildSharedContextControlsProps,
  WorkspaceSectionHeader,
  useWorkspaceSharedContext,
} from '@/features/workspace/shell';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';

function getWorkspaceHelpCopy(locale: string) {
  if (locale === 'en') {
    return {
      eyebrow: 'Workspace',
      title: 'Help center',
      description:
        'Find the fastest next step for support, workspace navigation, account settings, and common operating questions.',
      shellHint: 'Support / guidance / next steps',
    };
  }

  return {
    eyebrow: 'Workspace',
    title: 'Hilfezentrum',
    description:
      'Finde den schnellsten nächsten Schritt für Support, Workspace-Navigation, Einstellungen und typische Arbeitsfragen.',
    shellHint: 'Support / Orientierung / nächste Schritte',
  };
}

export function WorkspaceHelpIntro() {
  const t = useT();
  const { locale } = useI18n();
  const copy = getWorkspaceHelpCopy(locale);
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection: 'help',
    activeWorkspaceTab: 'my-requests',
  });
  const sharedContextControlsProps = buildSharedContextControlsProps({
    model,
    t,
    locale,
  });

  return (
    <WorkspaceSectionHeader
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      shellHint={copy.shellHint}
      sharedContextControlsProps={sharedContextControlsProps}
    />
  );
}
