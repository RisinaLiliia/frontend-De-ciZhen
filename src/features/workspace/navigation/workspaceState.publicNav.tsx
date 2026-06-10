'use client';

import { IconBriefcase, IconCheck, IconUser } from '@/components/ui/icons/icons';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceNavItem } from '@/features/workspace/navigation/workspaceNavItem.types';
import type { WorkspaceNavTranslator } from '@/features/workspace/navigation/workspaceState.nav.shared';
import { I18N_KEYS } from '@/lib/i18n/keys';

export type BuildPublicNavItemsArgs = {
  t: WorkspaceNavTranslator;
  formatNumber: Intl.NumberFormat;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  activePublicSection: PublicWorkspaceSection | null;
  markPublicRequestsSeen: () => void;
};

export function buildPublicNavItems({
  t,
  formatNumber,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  activePublicSection,
  markPublicRequestsSeen,
}: BuildPublicNavItemsArgs): WorkspaceNavItem[] {
  return [
    {
      key: 'public-requests',
      href: '/workspace?section=requests',
      label: t(I18N_KEYS.homePublic.exploreAllOrders),
      icon: <IconBriefcase />,
      value: formatNumber.format(publicRequestsCount),
      badgeValue: publicRequestsCount,
      hint: t(I18N_KEYS.requestsPage.resultsLabel),
      onClick: markPublicRequestsSeen,
      forceActive: activePublicSection === 'requests',
    },
    {
      key: 'public-providers',
      href: '/workspace?section=providers',
      label: t(I18N_KEYS.homePublic.exploreAllProviders),
      icon: <IconUser />,
      value: formatNumber.format(publicProvidersCount),
      badgeValue: publicProvidersCount,
      hint: t(I18N_KEYS.requestsPage.heroProviderPrimaryCta),
      forceActive: activePublicSection === 'providers',
    },
    {
      key: 'public-stats',
      href: '/workspace?section=stats',
      label: t(I18N_KEYS.homePublic.exploreStats),
      icon: <IconCheck />,
      value: formatNumber.format(publicStatsCount),
      badgeValue: publicStatsCount,
      hint: t(I18N_KEYS.homePublic.activitySubtitle),
      forceActive: activePublicSection === 'stats',
    },
  ];
}
