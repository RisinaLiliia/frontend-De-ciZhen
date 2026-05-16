'use client';

import { WorkspaceModeNav } from '@/features/workspace/shell/WorkspaceModeNav';
import { useWorkspaceSharedContext } from '@/features/workspace/shell/useWorkspaceSharedContext';
import type { WorkspaceTab } from '@/features/workspace/requests';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type Translator = (key: I18nKey) => string;

type WorkspaceSidebarProps = {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
};

export function WorkspaceSidebar({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
}: WorkspaceSidebarProps) {
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });

  return (
    <aside className="workspace-sidebar" aria-label="Workspace navigation">
      <div className="workspace-sidebar__brand">
        <span className="workspace-sidebar__eyebrow">Workspace</span>
        <strong className="workspace-sidebar__title">De&apos;ciZhen</strong>
      </div>

      <WorkspaceModeNav items={model.modeItems} t={t} variant="sidebar" />
    </aside>
  );
}