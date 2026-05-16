'use client';

import { WorkspaceModeNav } from '@/features/workspace/shell/WorkspaceModeNav';
import type { I18nKey } from '@/lib/i18n/keys';

type Translator = (key: I18nKey) => string;

type WorkspaceSidebarProps = {
  items: React.ComponentProps<typeof WorkspaceModeNav>['items'];
  t: Translator;
};

export function WorkspaceSidebar({ items, t }: WorkspaceSidebarProps) {
  return (
    <aside className="workspace-sidebar" aria-label="Workspace sidebar">
      <div className="workspace-sidebar__brand">
        <span className="workspace-sidebar__eyebrow">Workspace</span>
        <strong className="workspace-sidebar__title">De&apos;ciZhen</strong>
      </div>

      <WorkspaceModeNav items={items} t={t} variant="sidebar" />
    </aside>
  );
}