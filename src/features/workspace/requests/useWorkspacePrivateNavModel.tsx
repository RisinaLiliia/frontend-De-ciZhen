'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { useWorkspaceNavModel } from '@/features/workspace/requests/useWorkspaceNavModel';

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
  return useWorkspaceNavModel({
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
    reviewsHref: isPersonalized ? '/workspace?tab=reviews' : '/workspace?section=reviews',
    reviewsMatch: isPersonalized ? 'exact' : 'prefix',
    reviewsForceActive:
      isPersonalized
        ? activePublicSection === null && activeWorkspaceTab === 'reviews'
        : activePublicSection === 'reviews',
    includeCompletedJobsInSecondary: true,
  });
}
