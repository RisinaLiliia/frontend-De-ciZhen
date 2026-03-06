'use client';

import * as React from 'react';

import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { IconBriefcase, IconCheck, IconHeart, IconSend, IconUser } from '@/components/ui/icons/icons';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { buildPublicNavItems } from '@/features/workspace/requests/workspaceState.shared';

type Params = {
  t: (key: I18nKey) => string;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection?: PublicWorkspaceSection | null;
  userName?: string | null;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  markPublicRequestsSeen: () => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
  formatNumber: Intl.NumberFormat;
};

export function useWorkspacePublicState({
  t,
  isPersonalized,
  activeWorkspaceTab,
  activePublicSection = null,
  userName,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  setWorkspaceTab,
  markPublicRequestsSeen,
  guestLoginHref,
  onGuestLockedAction,
  formatNumber,
}: Params) {
  const navTitle = `${t(I18N_KEYS.requestsPage.navGreeting)}, ${(userName ?? '').trim() || t(I18N_KEYS.requestsPage.navUserFallback)}!`;
  const hasActivePublicSection =
    activePublicSection === 'requests' || activePublicSection === 'providers' || activePublicSection === 'stats';

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
    () => {
      if (isPersonalized) {
        return [
            ...publicNavItems,
            {
              key: 'my-requests',
              href: '/workspace?tab=my-requests',
              label: t(I18N_KEYS.requestsPage.navMyOrders),
              icon: <IconBriefcase />,
              value: 0,
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
              value: 0,
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
              value: 0,
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
              value: 0,
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
                value: '0.0',
                reviewsCount: 0,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              onClick: () => setWorkspaceTab('reviews'),
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'reviews',
              match: 'exact',
            },
          ];
      }

      const publicRequests = publicNavItems.find((item) => item.key === 'public-requests');
      const publicProviders = publicNavItems.find((item) => item.key === 'public-providers');
      const publicStats = publicNavItems.find((item) => item.key === 'public-stats');

      return [
        ...(publicRequests ? [{ ...publicRequests, tier: 'primary' as const }] : []),
        ...(publicProviders ? [{ ...publicProviders, tier: 'primary' as const }] : []),
        ...(publicStats ? [{ ...publicStats, tier: 'primary' as const }] : []),
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
          tier: 'secondary',
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
          tier: 'secondary',
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
          tier: 'secondary',
        },
        {
          key: 'reviews',
          href: '/workspace?tab=reviews',
          label: t(I18N_KEYS.requestsPage.navReviews),
          icon: <IconUser />,
          rating: {
            value: '0.0',
            reviewsCount: 0,
            reviewsLabel: t(I18N_KEYS.homePublic.reviews),
          },
          disabled: true,
          lockedHref: guestLoginHref,
          onClick: onGuestLockedAction,
          forceActive: !hasActivePublicSection && activeWorkspaceTab === 'reviews',
          match: 'exact',
          tier: 'secondary',
        },
      ];
    },
    [
      activeWorkspaceTab,
      guestLoginHref,
      hasActivePublicSection,
      isPersonalized,
      onGuestLockedAction,
      publicNavItems,
      setWorkspaceTab,
      t,
    ],
  );

  return {
    navTitle,
    activityProgress: 12,
    personalNavItems,
    insightText: '',
  };
}
