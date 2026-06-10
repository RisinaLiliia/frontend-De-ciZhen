'use client';

import { WorkspaceSectionHeader } from '@/features/workspace/shell';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function WorkspaceSettingsIntro() {
  const t = useT();
  useI18n();

  return (
    <WorkspaceSectionHeader
      title={t(I18N_KEYS.client.profileSettingsTitle)}
      description={t(I18N_KEYS.client.profileSettingsSubtitle)}
    />
  );
}
