'use client';

import {
  WorkspaceMobileContextSection,
  WorkspaceModeHeader,
} from '@/features/workspace/shell/WorkspaceModeHeader';
import { WorkspaceIntroShell } from '@/features/workspace/shell/WorkspaceIntroShell';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';

export type WorkspacePrivateIntroProps = {
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  navHeaderSlot?: React.ReactNode;
  leftColumnSlot?: React.ReactNode;
  preferredRequestsRole?: 'customer' | 'provider' | null;
};

export function WorkspacePrivateIntro({
  locale,
  activePublicSection,
  activeWorkspaceTab,
  navHeaderSlot,
  leftColumnSlot,
  preferredRequestsRole = null,
}: WorkspacePrivateIntroProps) {
  const t = useT();

  return (
    <WorkspaceIntroShell
      navHeaderSlot={navHeaderSlot}
      header={(
        <WorkspaceModeHeader
          t={t}
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
          preferredRequestsRole={preferredRequestsRole}
        />
      )}
      mobileContext={(
        <WorkspaceMobileContextSection
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
          preferredRequestsRole={preferredRequestsRole}
        />
      )}
      leftColumnSlot={leftColumnSlot}
    />
  );
}
