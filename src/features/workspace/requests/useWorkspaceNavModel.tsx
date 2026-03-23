'use client';

import * as React from 'react';

import {
  buildWorkspaceNavHeader,
  buildWorkspacePersonalNavItems,
} from '@/features/workspace/requests/workspaceState.nav';
import type { BuildWorkspacePersonalNavItemsArgs } from '@/features/workspace/requests/workspaceState.personalNav';

type WorkspaceNavModelParams = BuildWorkspacePersonalNavItemsArgs & {
  userName?: string | null;
};

export function useWorkspaceNavModel({
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
  markPublicRequestsSeen,
  setWorkspaceTab,
  guestLoginHref,
  onGuestLockedAction,
  reviewsHref,
  reviewsMatch = 'prefix',
  reviewsForceActive,
  includeCompletedJobsInSecondary = true,
}: WorkspaceNavModelParams) {
  const { navTitle, navSubtitle } = React.useMemo(
    () => buildWorkspaceNavHeader({ t, userName }),
    [t, userName],
  );

  const personalNavItems = React.useMemo(
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
        reviewsMatch,
        reviewsForceActive,
        includeCompletedJobsInSecondary,
      }),
    [
      activePublicSection,
      activeWorkspaceTab,
      completedJobsCount,
      favoriteRequestCount,
      formatNumber,
      guestLoginHref,
      includeCompletedJobsInSecondary,
      isPersonalized,
      markPublicRequestsSeen,
      myRequestsTotal,
      navRatingValue,
      navReviewsCount,
      onGuestLockedAction,
      publicProvidersCount,
      publicRequestsCount,
      publicStatsCount,
      reviewsForceActive,
      reviewsHref,
      reviewsMatch,
      sentCount,
      setWorkspaceTab,
      t,
    ],
  );

  return {
    navTitle,
    navSubtitle,
    personalNavItems,
  };
}
