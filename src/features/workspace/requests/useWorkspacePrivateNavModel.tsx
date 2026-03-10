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
        reviewsHref: isPersonalized ? '/workspace?tab=reviews' : '/workspace?section=reviews',
        reviewsMatch: isPersonalized ? 'exact' : 'prefix',
        reviewsForceActive:
          isPersonalized
            ? activePublicSection === null && activeWorkspaceTab === 'reviews'
            : activePublicSection === 'reviews',
        includeCompletedJobsInSecondary: true,
      }),
    [
      activePublicSection,
      activeWorkspaceTab,
      completedJobsCount,
      favoriteRequestCount,
      formatNumber,
      guestLoginHref,
      isPersonalized,
      myRequestsTotal,
      markPublicRequestsSeen,
      navRatingValue,
      navReviewsCount,
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
