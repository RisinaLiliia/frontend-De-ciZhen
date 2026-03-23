'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { resolveWorkspacePublicMeta } from '@/features/workspace/requests/workspacePublicState.model';
import { useWorkspacePublicNavModel } from '@/features/workspace/requests/useWorkspacePublicNavModel';

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
  const { activityProgress, insightText, navRatingValue, navReviewsCount } = React.useMemo(
    () => resolveWorkspacePublicMeta({ platformRatingAvg, platformReviewsCount }),
    [platformRatingAvg, platformReviewsCount],
  );

  const { navTitle, navSubtitle, personalNavItems } = useWorkspacePublicNavModel({
    t,
    formatNumber,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName,
    publicRequestsCount,
    publicProvidersCount,
    publicStatsCount,
    navRatingValue,
    navReviewsCount,
    setWorkspaceTab,
    markPublicRequestsSeen,
    guestLoginHref,
    onGuestLockedAction,
  });

  return {
    navTitle,
    navSubtitle,
    activityProgress,
    personalNavItems,
    insightText,
  };
}
