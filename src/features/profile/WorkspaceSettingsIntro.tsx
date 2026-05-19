'use client';

import {
  buildSharedContextControlsProps,
  WorkspaceSectionHeader,
  useWorkspaceSharedContext,
} from '@/features/workspace/shell';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { useI18n } from '@/lib/i18n/I18nProvider';

function getWorkspaceSettingsShellHint(locale: string) {
  if (locale === 'en') {
    return 'Appearance / language / privacy';
  }

  return 'Darstellung / Sprache / Datenschutz';
}

export function WorkspaceSettingsIntro() {
  const t = useT();
  const { locale } = useI18n();
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection: 'settings',
    activeWorkspaceTab: 'my-requests',
  });
  const sharedContextControlsProps = buildSharedContextControlsProps({ model, t, locale });

  return (
    <WorkspaceSectionHeader
      eyebrow="Workspace"
      title={t(I18N_KEYS.client.profileSettingsTitle)}
      description={t(I18N_KEYS.client.profileSettingsSubtitle)}
      shellHint={getWorkspaceSettingsShellHint(locale)}
      sharedContextControlsProps={sharedContextControlsProps}
    />
  );
}
