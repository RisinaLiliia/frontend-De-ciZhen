'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import type { WorkspaceBottomNavProps } from '@/features/workspace/shell/WorkspaceShell.types';
import { WorkspaceSidebar } from '@/features/workspace/shell/WorkspaceSidebar';
import { useWorkspaceMobileSectionSheet } from '@/features/workspace/shell/useWorkspaceMobileSectionSheet';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export function WorkspaceBottomNav({
  activePublicSection,
  activeWorkspaceTab,
  locale,
  preferredRequestsRole = null,
}: WorkspaceBottomNavProps) {
  const t = useT();
  const { open, setOpen, panelRef, closeButtonRef } = useWorkspaceMobileSectionSheet();
  const titleId = React.useId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeSignature = `${pathname}?${searchParams.toString()}`;
  const previousRouteRef = React.useRef(routeSignature);

  React.useEffect(() => {
    if (previousRouteRef.current !== routeSignature && open) {
      setOpen(false);
    }
    previousRouteRef.current = routeSignature;
  }, [open, routeSignature, setOpen]);

  if (!open) return null;

  return (
    <div className="workspace-navigation-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="workspace-navigation-drawer__backdrop"
        aria-label={t(I18N_KEYS.auth.closeDialog)}
        onClick={() => setOpen(false)}
      />
      <section ref={panelRef} className="workspace-navigation-drawer__surface">
        <header className="workspace-navigation-drawer__header">
          <h2 id={titleId} className="workspace-navigation-drawer__title">{t(I18N_KEYS.auth.workspaceLabel)}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="workspace-navigation-drawer__close"
            aria-label={t(I18N_KEYS.auth.closeDialog)}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </header>
        <WorkspaceSidebar
          t={t}
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
          preferredRequestsRole={preferredRequestsRole}
          variant="drawer"
          onNavigate={() => setOpen(false)}
        />
      </section>
    </div>
  );
}
