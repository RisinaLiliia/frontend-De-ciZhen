'use client';

import Link from 'next/link';
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  HelpCircle,
  Home,
  Inbox,
  MessageSquare,
  Settings,
  User,
  Users,
} from 'lucide-react';

import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/requests';
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

const NAV_ITEMS = [
  { section: 'overview', label: 'Dashboard', href: '/workspace?section=overview', icon: Home },
  { section: 'requests', label: 'Anfragen', href: '/workspace?section=requests', icon: Inbox, badge: '12' },
  { section: 'offers', label: 'Angebote', href: '/workspace?section=offers', icon: MessageSquare },
  { section: 'contracts', label: 'Aufträge', href: '/workspace?section=contracts', icon: ClipboardList },
  { section: 'providers', label: 'Anbieter', href: '/workspace?section=providers', icon: Users },
  { section: 'analysis', label: 'Analyse', href: '/workspace?section=statistics', icon: BarChart3 },
  { section: 'chat', label: 'Nachrichten', href: '/workspace?section=chat', icon: MessageSquare },
  { section: 'profile', label: 'Profil', href: '/workspace?section=actions', icon: User },
] as const;

export function WorkspaceSidebar({
  activePublicSection,
  activeWorkspaceTab,
}: WorkspaceSidebarProps) {
  const activeSection = activePublicSection ?? activeWorkspaceTab;

  return (
    <aside className="workspace-sidebar" aria-label="Workspace navigation">
      <div className="workspace-sidebar__brand">
        <span className="workspace-sidebar__logo-mark">D</span>
        <strong className="workspace-sidebar__title">De&apos;ciZhen</strong>
      </div>

      <nav className="workspace-sidebar__nav" aria-label="Main workspace navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.section === activeSection;

          return (
            <Link
              key={item.section}
              href={item.href}
              className={
                isActive
                  ? 'workspace-sidebar__item workspace-sidebar__item--active'
                  : 'workspace-sidebar__item'
              }
            >
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
              {'badge' in item ? (
                <span className="workspace-sidebar__badge">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="workspace-sidebar__footer">
        <Link href="/workspace?section=settings" className="workspace-sidebar__item">
          <Settings aria-hidden="true" size={17} strokeWidth={1.8} />
          <span>Einstellungen</span>
        </Link>

        <Link href="/workspace?section=help" className="workspace-sidebar__item">
          <HelpCircle aria-hidden="true" size={17} strokeWidth={1.8} />
          <span>Hilfe</span>
        </Link>

        <div className="workspace-sidebar__user">
          <div className="workspace-sidebar__avatar">L</div>
          <div>
            <strong>Lilia Müller</strong>
            <span>Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}