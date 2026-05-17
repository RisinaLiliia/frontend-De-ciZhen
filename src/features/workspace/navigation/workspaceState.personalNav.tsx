'use client';

import {
  IconBriefcase,
  IconHeart,
  IconUser,
} from '@/components/ui/icons/icons';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceNavItem } from '@/features/workspace/navigation/workspaceNavItem.types';
import { buildPublicNavItems } from '@/features/workspace/navigation/workspaceState.publicNav';
import {
  isWorkspacePublicSection,
  normalizeWorkspaceNavCount,
  type WorkspaceNavTranslator,
} from '@/features/workspace/navigation/workspaceState.nav.shared';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import { I18N_KEYS } from '@/lib/i18n/keys';

export type BuildWorkspacePersonalNavItemsArgs = {
  t: WorkspaceNavTranslator;
  formatNumber: Intl.NumberFormat;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection: PublicWorkspaceSection | null;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  myRequestsTotal: number;
  sentCount: number;
  completedJobsCount: number;
  favoriteRequestCount: number;
  markPublicRequestsSeen: () => void;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
  includeCompletedJobsInSecondary?: boolean;
};

function buildWorkspacePersonalizedSecondaryNavItems({
  t,
  activeWorkspaceTab,
  activePublicSection,
  hasActivePublicSection,
  myRequestsTotal,
  favoriteRequestCount,
  setWorkspaceTab,
}: Pick<
  BuildWorkspacePersonalNavItemsArgs,
  | 't'
  | 'activeWorkspaceTab'
  | 'activePublicSection'
  | 'myRequestsTotal'
  | 'favoriteRequestCount'
  | 'setWorkspaceTab'
> & {
  hasActivePublicSection: boolean;
}): WorkspaceNavItem[] {
  return [
    {
      key: 'my-requests',
      href: '/workspace?section=requests&scope=my&period=90d&range=90d',
      label: t(I18N_KEYS.requestsPage.navMyOrders),
      icon: <IconBriefcase />,
      badgeValue: normalizeWorkspaceNavCount(myRequestsTotal),
      value: normalizeWorkspaceNavCount(myRequestsTotal),
      hint: t(I18N_KEYS.requestsPage.summaryAccepted),
      onClick: () => setWorkspaceTab('my-requests'),
      forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-requests',
      match: 'exact',
      tier: 'secondary',
    },
    {
      key: 'my-favorites',
      href: '/workspace?section=providers',
      label: t(I18N_KEYS.requestsPage.navFavorites),
      icon: <IconHeart />,
      badgeValue: normalizeWorkspaceNavCount(favoriteRequestCount),
      value: normalizeWorkspaceNavCount(favoriteRequestCount),
      hint: t(I18N_KEYS.requestDetails.ctaSave),
      forceActive: activePublicSection === 'providers',
      match: 'prefix',
      tier: 'secondary',
    },
  ];
}

function buildWorkspaceGuestSecondaryNavItems({
  t,
  activeWorkspaceTab,
  activePublicSection,
  hasActivePublicSection,
  guestLoginHref,
  onGuestLockedAction,
}: Pick<
  BuildWorkspacePersonalNavItemsArgs,
  | 't'
  | 'activeWorkspaceTab'
  | 'activePublicSection'
  | 'guestLoginHref'
  | 'onGuestLockedAction'
> & {
  hasActivePublicSection: boolean;
}): WorkspaceNavItem[] {
  return [
    {
      key: 'guest-profile',
      href: '/workspace?section=actions',
      label: t(I18N_KEYS.auth.profileLabel),
      icon: <IconUser />,
      forceActive: activePublicSection === 'actions',
      match: 'prefix',
      tier: 'secondary',
    },
    {
      key: 'my-requests',
      href: '/workspace?section=requests&scope=my&period=90d&range=90d',
      label: t(I18N_KEYS.requestsPage.navGuestOrders),
      icon: <IconBriefcase />,
      badgeValue: 0,
      hint: t(I18N_KEYS.requestsPage.summaryAccepted),
      disabled: true,
      lockedHref: guestLoginHref,
      onClick: onGuestLockedAction,
      forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-requests',
      match: 'exact',
      tier: 'secondary',
    },
    {
      key: 'my-favorites',
      href: '/workspace?section=providers',
      label: t(I18N_KEYS.requestsPage.navFavorites),
      icon: <IconHeart />,
      hint: t(I18N_KEYS.requestDetails.ctaSave),
      forceActive: activePublicSection === 'providers',
      match: 'prefix',
      tier: 'secondary',
    },
  ];
}

export function buildWorkspacePersonalNavItems({
  t,
  formatNumber,
  isPersonalized,
  activeWorkspaceTab,
  activePublicSection,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  myRequestsTotal,
  favoriteRequestCount,
  markPublicRequestsSeen,
  setWorkspaceTab,
  guestLoginHref,
  onGuestLockedAction,
}: BuildWorkspacePersonalNavItemsArgs): WorkspaceNavItem[] {
  const hasActivePublicSection = isWorkspacePublicSection(activePublicSection);
  const publicPrimaryItems = buildPublicNavItems({
    t,
    formatNumber,
    publicRequestsCount,
    publicProvidersCount,
    publicStatsCount,
    activePublicSection,
    markPublicRequestsSeen,
  }).map((item) => ({ ...item, tier: 'primary' as const }));

  if (isPersonalized) {
    return [
      ...publicPrimaryItems,
      ...buildWorkspacePersonalizedSecondaryNavItems({
        t,
        activeWorkspaceTab,
        activePublicSection,
        hasActivePublicSection,
        myRequestsTotal,
        favoriteRequestCount,
        setWorkspaceTab,
      }),
    ];
  }

  return [
    ...publicPrimaryItems,
    ...buildWorkspaceGuestSecondaryNavItems({
      t,
      activeWorkspaceTab,
      activePublicSection,
      hasActivePublicSection,
      guestLoginHref,
      onGuestLockedAction,
    }),
  ];
}
