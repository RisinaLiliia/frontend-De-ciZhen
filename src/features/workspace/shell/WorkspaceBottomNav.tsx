'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { resolveActiveWorkspaceNavigationSection } from '@/features/workspace/navigation/resolveActiveWorkspaceNavigationSection';
import { resolveVisibleWorkspaceNavigationItems } from '@/features/workspace/navigation/workspaceNavigation.config';
import type { WorkspaceBottomNavProps } from '@/features/workspace/shell/WorkspaceShell.types';
import { useWorkspaceMobileSectionSheet } from '@/features/workspace/shell/useWorkspaceMobileSectionSheet';
import { useAuthMe, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export function WorkspaceBottomNav({
  activePublicSection,
  activeWorkspaceTab,
}: WorkspaceBottomNavProps) {
  const t = useT();
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const authMe = useAuthMe();
  const { open, setOpen, panelRef, closeButtonRef } = useWorkspaceMobileSectionSheet();
  const titleId = React.useId();
  const searchParams = useSearchParams();
  const activeSection = resolveActiveWorkspaceNavigationSection({
    sectionParam: searchParams.get('section'),
    activePublicSection,
    activeWorkspaceTab,
    requestsScope: searchParams.get('scope'),
    requestsRole: searchParams.get('role'),
    requestsState: searchParams.get('state'),
  });
  const visibleNavigationItems = resolveVisibleWorkspaceNavigationItems({
    isAuthed: authStatus === 'authenticated',
    role: authUser?.role === 'provider' ? 'provider' : authUser?.role === 'client' ? 'client' : null,
  });
  const primaryItems = visibleNavigationItems.filter((item) => item.group === 'main');
  const supportItems = visibleNavigationItems.filter((item) => item.group === 'support');
  const profileName = authMe?.name?.trim() || authUser?.name?.trim() || null;
  const profileRole = authUser?.role === 'provider' ? 'Provider' : 'Client';
  const profileInitial = (profileName?.charAt(0) ?? 'D').toUpperCase();

  const renderNavCard = React.useCallback((item: (typeof visibleNavigationItems)[number], secondary = false) => {
    const Icon = item.icon;
    const isActive = item.section === activeSection;

    return (
      <Link
        key={item.section}
        href={item.href}
        prefetch={false}
        aria-current={isActive ? 'page' : undefined}
        className={[
          'workspace-mobile-nav-sheet__card',
          secondary ? 'workspace-mobile-nav-sheet__card--secondary' : '',
          isActive ? 'is-active' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => setOpen(false)}
      >
        <div className="workspace-mobile-nav-sheet__card-head">
          <span className="workspace-mobile-nav-sheet__card-icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.8} />
          </span>
          {item.badge ? (
            <span className="workspace-mobile-nav-sheet__card-badge">{item.badge}</span>
          ) : null}
        </div>
        <strong className="workspace-mobile-nav-sheet__card-label">{item.label}</strong>
      </Link>
    );
  }, [activeSection, setOpen]);

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
            <div className="workspace-mobile-nav-sheet__grid">
              {primaryItems.map((item) => renderNavCard(item))}
            </div>
          </section>
          {supportItems.length > 0 ? (
            <section className="workspace-mobile-nav-sheet__section workspace-mobile-nav-sheet__section--secondary">
              <div className="workspace-mobile-nav-sheet__grid">
                {supportItems.map((item) => renderNavCard(item, true))}
              </div>
            </section>
          ) : null}
          {authStatus === 'authenticated' ? (
            <section className="workspace-mobile-nav-sheet__section workspace-mobile-nav-sheet__section--secondary">
              <div className="workspace-sidebar__account workspace-sidebar__account--sheet">
                <div className="workspace-sidebar__user">
                  <div className="workspace-sidebar__avatar">{profileInitial}</div>
                  <div>
                    <strong>{profileName ?? 'De’ciZhen User'}</strong>
                    <span>{profileRole}</span>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
