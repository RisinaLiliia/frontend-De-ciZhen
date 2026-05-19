'use client';

import * as React from 'react';

import {
  useWorkspaceSharedContext,
} from '@/features/workspace/shell/useWorkspaceSharedContext';
import { WorkspaceModeNav } from '@/features/workspace/shell/WorkspaceModeNav';
import type { WorkspaceBottomNavProps } from '@/features/workspace/shell/WorkspaceShell.types';
import { useWorkspaceMobileSectionSheet } from '@/features/workspace/requests/useWorkspaceMobileSectionSheet';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export function WorkspaceBottomNav({
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
}: WorkspaceBottomNavProps) {
  const t = useT();
  const { open, setOpen, panelRef, closeButtonRef } = useWorkspaceMobileSectionSheet();
  const titleId = React.useId();
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });

  if (!open) return null;

  return (
    <div className="workspace-mobile-nav-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="workspace-mobile-nav-sheet__backdrop"
        aria-label={t(I18N_KEYS.auth.closeDialog)}
        onClick={() => setOpen(false)}
      />
      <section ref={panelRef} className="workspace-mobile-nav-sheet__surface">
        <header className="workspace-mobile-nav-sheet__header">
          <div className="workspace-mobile-nav-sheet__copy">
            <h2 id={titleId} className="workspace-mobile-nav-sheet__title">{t(I18N_KEYS.auth.workspaceLabel)}</h2>
            <p className="workspace-mobile-nav-sheet__subtitle">{t(I18N_KEYS.auth.navigationLabel)}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="workspace-mobile-nav-sheet__close"
            aria-label={t(I18N_KEYS.auth.closeDialog)}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </header>
        <div className="workspace-mobile-nav-sheet__body">
          <section className="workspace-mobile-nav-sheet__section">
            <WorkspaceModeNav
              items={model.modeItems}
              t={t}
              className="workspace-mode-nav--sheet"
              onItemClick={() => setOpen(false)}
            />
          </section>
        </div>
      </section>
    </div>
  );
}
