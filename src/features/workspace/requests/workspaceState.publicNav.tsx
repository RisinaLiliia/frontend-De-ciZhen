'use client';

import {
  IconBriefcase,
  IconCheck,
  IconStar,
  IconUser,
} from '@/components/ui/icons/icons';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import {
  normalizeWorkspaceNavCount,
  type WorkspaceNavTranslator,
} from '@/features/workspace/requests/workspaceState.nav.shared';

export type BuildPublicNavItemsArgs = {
  t: WorkspaceNavTranslator;
  formatNumber: Intl.NumberFormat;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  activePublicSection: PublicWorkspaceSection | null;
  markPublicRequestsSeen: () => void;
};

type BuildWorkspaceReviewsNavItemArgs = {
  t: WorkspaceNavTranslator;
  navRatingValue: string;
  navReviewsCount: number;
  reviewsHref: string;
  reviewsMatch: 'exact' | 'prefix';
  reviewsForceActive: boolean;
};

export function buildPublicNavItems({
  t,
  formatNumber,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  activePublicSection,
  markPublicRequestsSeen,
}: BuildPublicNavItemsArgs): PersonalNavItem[] {
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

export function buildWorkspaceReviewsNavItem({
  t,
  navRatingValue,
  navReviewsCount,
  reviewsHref,
  reviewsMatch,
  reviewsForceActive,
}: BuildWorkspaceReviewsNavItemArgs): PersonalNavItem {
  return {
    key: 'reviews',
    href: reviewsHref,
    label: t(I18N_KEYS.requestsPage.navReviews),
    icon: <IconStar />,
    badgeValue: normalizeWorkspaceNavCount(navReviewsCount),
    rating: {
      value: navRatingValue,
      reviewsCount: normalizeWorkspaceNavCount(navReviewsCount),
      reviewsLabel: t(I18N_KEYS.homePublic.reviews),
    },
    forceActive: reviewsForceActive,
    match: reviewsMatch,
    tier: 'primary',
  };
}
