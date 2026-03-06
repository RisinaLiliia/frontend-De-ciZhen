'use client';

import * as React from 'react';

import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { IconBriefcase, IconCheck, IconHeart, IconSend, IconUser } from '@/components/ui/icons/icons';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { buildPublicNavItems } from '@/features/workspace/requests/workspaceState.shared';

type Translator = (key: I18nKey) => string;

type Params = {
  t: Translator;
  formatNumber: Intl.NumberFormat;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection: PublicWorkspaceSection | null;
  userName?: string | null;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  myRequestsTotal: number;
  sentCount: number;
  completedJobsCount: number;
  favoriteRequestCount: number;
  navRatingValue: string;
  navReviewsCount: number;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  markPublicRequestsSeen: () => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
};

export function useWorkspacePrivateNavModel({
  t,
  formatNumber,
  isPersonalized,
  activeWorkspaceTab,
  activePublicSection,
  userName,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  myRequestsTotal,
  sentCount,
  completedJobsCount,
  favoriteRequestCount,
  navRatingValue,
  navReviewsCount,
  setWorkspaceTab,
  markPublicRequestsSeen,
  guestLoginHref,
  onGuestLockedAction,
}: Params) {
  const hasActivePublicSection =
    activePublicSection === 'requests' ||
    activePublicSection === 'providers' ||
    activePublicSection === 'stats' ||
    activePublicSection === 'reviews';
  const navTitle = `${t(I18N_KEYS.requestsPage.navGreeting)}, ${(userName ?? '').trim() || t(I18N_KEYS.requestsPage.navUserFallback)}!`;

  const publicNavItems = React.useMemo(
    () =>
      buildPublicNavItems({
        t,
        formatNumber,
        publicRequestsCount,
        publicProvidersCount,
        publicStatsCount,
        activePublicSection,
        markPublicRequestsSeen,
      }),
    [
      activePublicSection,
      formatNumber,
      markPublicRequestsSeen,
      publicProvidersCount,
      publicRequestsCount,
      publicStatsCount,
      t,
    ],
  );

  const personalNavItems = React.useMemo<PersonalNavItem[]>(
    () =>
      isPersonalized
        ? [
            ...publicNavItems,
            {
              key: 'my-requests',
              href: '/workspace?tab=my-requests',
              label: t(I18N_KEYS.requestsPage.navMyOrders),
              icon: <IconBriefcase />,
              value: myRequestsTotal,
              hint: t(I18N_KEYS.requestsPage.summaryAccepted),
              onClick: () => setWorkspaceTab('my-requests'),
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-requests',
              match: 'exact',
            },
            {
              key: 'my-offers',
              href: '/workspace?tab=my-offers',
              label: t(I18N_KEYS.requestsPage.navMyOffers),
              icon: <IconSend />,
              value: sentCount,
              hint: t(I18N_KEYS.requestsPage.summarySent),
              onClick: () => setWorkspaceTab('my-offers'),
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-offers',
              match: 'exact',
            },
            {
              key: 'completed-jobs',
              href: '/workspace?tab=completed-jobs',
              label: t(I18N_KEYS.requestsPage.navCompletedJobs),
              icon: <IconCheck />,
              value: completedJobsCount,
              hint: t(I18N_KEYS.provider.jobs),
              onClick: () => setWorkspaceTab('completed-jobs'),
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'completed-jobs',
              match: 'exact',
            },
            {
              key: 'my-favorites',
              href: '/workspace?tab=favorites',
              label: t(I18N_KEYS.requestDetails.saved),
              icon: <IconHeart />,
              value: favoriteRequestCount,
              hint: t(I18N_KEYS.requestDetails.ctaSave),
              onClick: () => setWorkspaceTab('favorites'),
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'favorites',
              match: 'exact',
            },
            {
              key: 'reviews',
              href: '/workspace?tab=reviews',
              label: t(I18N_KEYS.requestsPage.navReviews),
              icon: <IconUser />,
              rating: {
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              onClick: () => setWorkspaceTab('reviews'),
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'reviews',
              match: 'exact',
            },
          ]
        : [
            ...publicNavItems,
            {
              key: 'my-requests',
              href: '/workspace?tab=my-requests',
              label: t(I18N_KEYS.requestsPage.navMyOrders),
              icon: <IconBriefcase />,
              hint: t(I18N_KEYS.requestsPage.summaryAccepted),
              disabled: true,
              lockedHref: guestLoginHref,
              onClick: onGuestLockedAction,
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-requests',
              match: 'exact',
            },
            {
              key: 'my-offers',
              href: '/workspace?tab=my-offers',
              label: t(I18N_KEYS.requestsPage.navMyOffers),
              icon: <IconSend />,
              hint: t(I18N_KEYS.requestsPage.summarySent),
              disabled: true,
              lockedHref: guestLoginHref,
              onClick: onGuestLockedAction,
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-offers',
              match: 'exact',
            },
            {
              key: 'my-favorites',
              href: '/workspace?tab=favorites',
              label: t(I18N_KEYS.requestDetails.saved),
              icon: <IconHeart />,
              hint: t(I18N_KEYS.requestDetails.ctaSave),
              disabled: true,
              lockedHref: guestLoginHref,
              onClick: onGuestLockedAction,
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'favorites',
              match: 'exact',
            },
            {
              key: 'reviews',
              href: '/workspace?section=reviews',
              label: t(I18N_KEYS.requestsPage.navReviews),
              icon: <IconUser />,
              rating: {
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              forceActive: activePublicSection === 'reviews',
              match: 'prefix',
            },
          ],
    [
      activePublicSection,
      activeWorkspaceTab,
      completedJobsCount,
      favoriteRequestCount,
      guestLoginHref,
      hasActivePublicSection,
      isPersonalized,
      myRequestsTotal,
      navRatingValue,
      navReviewsCount,
      onGuestLockedAction,
      publicNavItems,
      sentCount,
      setWorkspaceTab,
      t,
    ],
  );

  return {
    navTitle,
    personalNavItems,
  };
}
