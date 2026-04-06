'use client';

import * as React from 'react';
import Link from 'next/link';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { useWorkspaceMobileSectionSheet } from '@/features/workspace/requests/useWorkspaceMobileSectionSheet';
import {
  useWorkspaceSharedContext,
} from '@/features/workspace/shell/WorkspaceEnvironmentChrome';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { Locale } from '@/lib/i18n/t';

export function WorkspaceMobileSectionSheet({
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
}: {
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
}) {
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
            <nav className="workspace-mode-nav workspace-mode-nav--sheet" aria-label={locale === 'de' ? 'Workspace-Modi' : 'Workspace modes'}>
              {model.modeItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  prefetch={false}
                  className={`workspace-mode-nav__item${item.isActive ? ' is-active' : ''}`.trim()}
                  aria-current={item.isActive ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="workspace-mode-nav__icon" aria-hidden="true">{item.icon}</span>
                  <span className="workspace-mode-nav__copy">
                    <strong className="workspace-mode-nav__label">{item.label}</strong>
                    <span className="workspace-mode-nav__description">{item.description}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </section>
        </div>
      </section>
    </div>
  );
}
