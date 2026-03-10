'use client';

import * as React from 'react';

import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import {
  buildWorkspaceNavHeader,
  buildWorkspacePersonalNavItems,
} from '@/features/workspace/requests/workspaceState.shared';

type Params = {
  t: (key: I18nKey) => string;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection?: PublicWorkspaceSection | null;
  userName?: string | null;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  platformRatingAvg: number;
  platformReviewsCount: number;
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
  platformRatingAvg,
  platformReviewsCount,
  setWorkspaceTab,
  markPublicRequestsSeen,
  guestLoginHref,
  onGuestLockedAction,
  formatNumber,
}: Params) {
  const { navTitle, navSubtitle } = React.useMemo(
    () => buildWorkspaceNavHeader({ t, userName }),
    [t, userName],
  );

  const personalNavItems = React.useMemo<PersonalNavItem[]>(
    () =>
      buildWorkspacePersonalNavItems({
        t,
        formatNumber,
        isPersonalized,
        activeWorkspaceTab,
        activePublicSection,
        publicRequestsCount,
        publicProvidersCount,
        publicStatsCount,
        myRequestsTotal: 0,
        sentCount: 0,
        completedJobsCount: 0,
        favoriteRequestCount: 0,
        navRatingValue: platformRatingAvg.toFixed(1),
        navReviewsCount: platformReviewsCount,
        markPublicRequestsSeen,
        setWorkspaceTab,
        guestLoginHref,
        onGuestLockedAction,
        reviewsHref: '/workspace?section=reviews',
        reviewsMatch: 'prefix',
        reviewsForceActive: activePublicSection === 'reviews',
        includeCompletedJobsInSecondary: true,
      }),
    [
      activePublicSection,
      activeWorkspaceTab,
      formatNumber,
      guestLoginHref,
      isPersonalized,
      markPublicRequestsSeen,
      onGuestLockedAction,
      platformRatingAvg,
      platformReviewsCount,
      publicProvidersCount,
      publicRequestsCount,
      publicStatsCount,
      setWorkspaceTab,
      t,
    ],
  );

  return {
    navTitle,
    navSubtitle,
    activityProgress: 12,
    personalNavItems,
    insightText: '',
  };
}
