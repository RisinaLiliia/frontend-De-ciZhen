import {
  BarChart3,
  ClipboardList,
  HelpCircle,
  Home,
  Inbox,
  MessageSquare,
  Settings,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { buildWorkspaceSectionHref } from '@/features/workspace/navigation/workspaceLinks';

export type WorkspaceNavigationSection =
  | 'overview'
  | 'requests'
  | 'offers'
  | 'contracts'
  | 'providers'
  | 'stats'
  | 'chat'
  | 'profile'
  | 'settings'
  | 'help';

export type WorkspaceNavigationItem = {
  section: WorkspaceNavigationSection;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  group: 'main' | 'support';
  requiresAuth?: boolean;
  roles?: Array<'client' | 'provider'>;
};

export const workspaceChatHref = buildWorkspaceSectionHref('chat');

export const workspaceNavigationItems: ReadonlyArray<WorkspaceNavigationItem> = [
  { section: 'overview', label: 'Dashboard', href: buildWorkspaceSectionHref('overview'), icon: Home, group: 'main' },
  { section: 'requests', label: 'Anfragen', href: buildWorkspaceSectionHref('requests'), icon: Inbox, badge: '12', group: 'main' },
  { section: 'offers', label: 'Angebote', href: '/workspace?section=requests&scope=my&role=provider&period=90d&range=90d', icon: MessageSquare, group: 'main', requiresAuth: true, roles: ['provider'] },
  { section: 'contracts', label: 'Aufträge', href: '/workspace?section=requests&scope=my&state=execution&period=90d&range=90d', icon: ClipboardList, group: 'main', requiresAuth: true },
  { section: 'providers', label: 'Anbieter', href: buildWorkspaceSectionHref('providers'), icon: Users, group: 'main' },
  { section: 'stats', label: 'Analyse', href: buildWorkspaceSectionHref('stats'), icon: BarChart3, group: 'main' },
  { section: 'chat', label: 'Nachrichten', href: workspaceChatHref, icon: MessageSquare, group: 'main' },
  { section: 'profile', label: 'Profil', href: buildWorkspaceSectionHref('profile'), icon: User, group: 'main' },
  { section: 'settings', label: 'Einstellungen', href: buildWorkspaceSectionHref('settings'), icon: Settings, group: 'support' },
  { section: 'help', label: 'Hilfe', href: buildWorkspaceSectionHref('help'), icon: HelpCircle, group: 'support' },
];

export function resolveVisibleWorkspaceNavigationItems({
  isAuthed,
  role,
}: {
  isAuthed: boolean;
  role?: 'client' | 'provider' | null;
}) {
  return workspaceNavigationItems.filter((item) => {
    if (item.requiresAuth && !isAuthed) return false;
    if (item.roles && (!role || !item.roles.includes(role))) return false;
    return true;
  });
}
