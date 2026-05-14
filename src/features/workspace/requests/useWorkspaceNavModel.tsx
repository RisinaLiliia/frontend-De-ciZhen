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
  markPublicRequestsSeen,
  setWorkspaceTab,
  guestLoginHref,
  onGuestLockedAction,
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
        markPublicRequestsSeen,
        setWorkspaceTab,
        guestLoginHref,
        onGuestLockedAction,
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
      onGuestLockedAction,
      publicProvidersCount,
      publicRequestsCount,
      publicStatsCount,
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
