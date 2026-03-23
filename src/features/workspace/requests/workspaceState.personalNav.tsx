'use client';

import {
  IconBriefcase,
  IconCheck,
  IconHeart,
  IconSend,
  IconUser,
} from '@/components/ui/icons/icons';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import {
  buildPublicNavItems,
  buildWorkspaceReviewsNavItem,
} from '@/features/workspace/requests/workspaceState.publicNav';
import {
  isWorkspacePublicSection,
  normalizeWorkspaceNavCount,
  type WorkspaceNavTranslator,
} from '@/features/workspace/requests/workspaceState.nav.shared';

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
  navRatingValue: string;
  navReviewsCount: number;
  markPublicRequestsSeen: () => void;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
  reviewsHref: string;
  reviewsMatch?: 'exact' | 'prefix';
  reviewsForceActive: boolean;
  includeCompletedJobsInSecondary?: boolean;
};

function buildWorkspacePersonalizedSecondaryNavItems({
  t,
  activeWorkspaceTab,
  hasActivePublicSection,
  myRequestsTotal,
  sentCount,
  completedJobsCount,
  favoriteRequestCount,
  setWorkspaceTab,
  includeCompletedJobsInSecondary,
}: Pick<
  BuildWorkspacePersonalNavItemsArgs,
  | 't'
  | 'activeWorkspaceTab'
  | 'myRequestsTotal'
  | 'sentCount'
  | 'completedJobsCount'
  | 'favoriteRequestCount'
  | 'setWorkspaceTab'
  | 'includeCompletedJobsInSecondary'
> & {
  hasActivePublicSection: boolean;
}): PersonalNavItem[] {
  return [
    {
      key: 'my-requests',
      href: '/workspace?tab=my-requests',
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
      key: 'my-offers',
      href: '/workspace?tab=my-offers',
      label: t(I18N_KEYS.requestsPage.navMyOffers),
      icon: <IconSend />,
      badgeValue: normalizeWorkspaceNavCount(sentCount),
      value: normalizeWorkspaceNavCount(sentCount),
      hint: t(I18N_KEYS.requestsPage.summarySent),
      onClick: () => setWorkspaceTab('my-offers'),
      forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-offers',
      match: 'exact',
      tier: 'secondary',
    },
    ...(includeCompletedJobsInSecondary
      ? [{
          key: 'completed-jobs',
          href: '/workspace?tab=completed-jobs',
          label: t(I18N_KEYS.requestsPage.navCompletedJobs),
          icon: <IconCheck />,
          badgeValue: normalizeWorkspaceNavCount(completedJobsCount),
          value: normalizeWorkspaceNavCount(completedJobsCount),
          hint: t(I18N_KEYS.provider.jobs),
          onClick: () => setWorkspaceTab('completed-jobs'),
          forceActive: !hasActivePublicSection && activeWorkspaceTab === 'completed-jobs',
          match: 'exact' as const,
          tier: 'secondary' as const,
        }]
      : []),
    {
      key: 'my-favorites',
      href: '/workspace?tab=favorites',
      label: t(I18N_KEYS.requestsPage.navFavorites),
      icon: <IconHeart />,
      badgeValue: normalizeWorkspaceNavCount(favoriteRequestCount),
      value: normalizeWorkspaceNavCount(favoriteRequestCount),
      hint: t(I18N_KEYS.requestDetails.ctaSave),
      onClick: () => setWorkspaceTab('favorites'),
      forceActive: !hasActivePublicSection && activeWorkspaceTab === 'favorites',
      match: 'exact',
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
  setWorkspaceTab,
}: Pick<
  BuildWorkspacePersonalNavItemsArgs,
  | 't'
  | 'activeWorkspaceTab'
  | 'activePublicSection'
  | 'guestLoginHref'
  | 'onGuestLockedAction'
  | 'setWorkspaceTab'
> & {
  hasActivePublicSection: boolean;
}): PersonalNavItem[] {
  return [
    {
      key: 'guest-profile',
      href: '/workspace?section=profile',
      label: t(I18N_KEYS.auth.profileLabel),
      icon: <IconUser />,
      forceActive: activePublicSection === 'profile',
      match: 'prefix',
      tier: 'secondary',
    },
    {
      key: 'my-requests',
      href: '/workspace?tab=my-requests',
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
      key: 'my-offers',
      href: '/workspace?tab=my-offers',
      label: t(I18N_KEYS.requestsPage.navGuestOffers),
      icon: <IconSend />,
      hint: t(I18N_KEYS.requestsPage.summarySent),
      disabled: true,
      lockedHref: guestLoginHref,
      onClick: onGuestLockedAction,
      forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-offers',
      match: 'exact',
      tier: 'secondary',
    },
    {
      key: 'my-favorites',
      href: '/workspace?tab=favorites',
      label: t(I18N_KEYS.requestsPage.navFavorites),
      icon: <IconHeart />,
      hint: t(I18N_KEYS.requestDetails.ctaSave),
      onClick: () => setWorkspaceTab('favorites'),
      forceActive: !hasActivePublicSection && activeWorkspaceTab === 'favorites',
      match: 'exact',
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
  sentCount,
  completedJobsCount,
  favoriteRequestCount,
  navRatingValue,
  navReviewsCount,
  markPublicRequestsSeen,
  setWorkspaceTab,
  guestLoginHref,
  onGuestLockedAction,
  reviewsHref,
  reviewsMatch = 'prefix',
  reviewsForceActive,
  includeCompletedJobsInSecondary = true,
}: BuildWorkspacePersonalNavItemsArgs): PersonalNavItem[] {
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

  const reviewsItem = buildWorkspaceReviewsNavItem({
    t,
    navRatingValue,
    navReviewsCount,
    reviewsHref,
    reviewsMatch,
    reviewsForceActive,
  });

  if (isPersonalized) {
    return [
      ...publicPrimaryItems,
      reviewsItem,
      ...buildWorkspacePersonalizedSecondaryNavItems({
        t,
        activeWorkspaceTab,
        hasActivePublicSection,
        myRequestsTotal,
        sentCount,
        completedJobsCount,
        favoriteRequestCount,
        setWorkspaceTab,
        includeCompletedJobsInSecondary,
      }),
    ];
  }

  return [
    ...publicPrimaryItems,
    reviewsItem,
    ...buildWorkspaceGuestSecondaryNavItems({
      t,
      activeWorkspaceTab,
      activePublicSection,
      hasActivePublicSection,
      guestLoginHref,
      onGuestLockedAction,
      setWorkspaceTab,
    }),
  ];
}
