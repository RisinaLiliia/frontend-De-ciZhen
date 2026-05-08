'use client';

import { WorkspaceMobileSectionSheet } from '@/features/workspace/requests/WorkspaceMobileSectionSheet';
import { WorkspaceMobileContextSection } from '@/features/workspace/shell/WorkspaceModeHeader';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { Locale } from '@/lib/i18n/t';

export type WorkspacePrivateIntroProps = {
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  quickActionHref?: string;
  showQuickAction?: boolean;
  navHeaderSlot?: React.ReactNode;
  leftColumnSlot?: React.ReactNode;
  preferredRequestsRole?: 'customer' | 'provider' | null;
};

export function WorkspacePrivateIntro({
  locale,
  activePublicSection,
  activeWorkspaceTab,
  quickActionHref = '/request/create',
  showQuickAction = true,
  navHeaderSlot,
  leftColumnSlot,
  preferredRequestsRole = null,
}: WorkspacePrivateIntroProps) {
  void quickActionHref;
  void showQuickAction;

  return (
    <section className="workspace-intro-shell">
      <div className="stack-md">
        {navHeaderSlot ? navHeaderSlot : null}
        <WorkspaceMobileContextSection
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
          preferredRequestsRole={preferredRequestsRole}
        />
        {leftColumnSlot ? leftColumnSlot : null}
        <WorkspaceMobileSectionSheet
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
          preferredRequestsRole={preferredRequestsRole}
        />
      </div>
    </section>
  );
}
