'use client';

import * as React from 'react';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { clampPercent } from '@/features/workspace/requests/workspaceState.shared';
import { EMPTY_WORKSPACE_PRIVATE_OVERVIEW } from '@/features/workspace/requests/workspacePrivateState.constants';
import { useWorkspacePrivateNavModel } from '@/features/workspace/requests/useWorkspacePrivateNavModel';
import { useWorkspacePrivateStatsModel } from '@/features/workspace/requests/useWorkspacePrivateStatsModel';
import { useWorkspacePrivateTopProviders } from '@/features/workspace/requests/useWorkspacePrivateTopProviders';

type Params = {
  t: (key: I18nKey) => string;
  locale: string;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection?: PublicWorkspaceSection | null;
  userName?: string | null;
  myOffers: OfferDto[];
  providers: ProviderPublicDto[];
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  workspacePrivateOverview?: WorkspacePrivateOverviewDto | null;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  markPublicRequestsSeen: () => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
  formatNumber: Intl.NumberFormat;
  chartMonthLabel: Intl.DateTimeFormat;
};

export function useWorkspacePrivateState({
  t,
  locale,
  isPersonalized,
  activeWorkspaceTab,
  activePublicSection = null,
  userName,
  myOffers,
  providers,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  workspacePrivateOverview,
  setWorkspaceTab,
  markPublicRequestsSeen,
  guestLoginHref,
  onGuestLockedAction,
  formatNumber,
  chartMonthLabel,
}: Params) {
  const overview = workspacePrivateOverview ?? EMPTY_WORKSPACE_PRIVATE_OVERVIEW;
  const activityProgress = clampPercent(overview.kpis.activityProgress);

  const ratedOffer = React.useMemo(
    () => myOffers.find((offer) => typeof offer.providerRatingAvg === 'number'),
    [myOffers],
  );
  const navRatingValue = (ratedOffer?.providerRatingAvg ?? 0).toFixed(1);
  const navReviewsCount = ratedOffer?.providerRatingCount ?? overview.reviews.asProvider;

  const {
    navTitle,
    personalNavItems,
  } = useWorkspacePrivateNavModel({
    t,
    formatNumber,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName,
    publicRequestsCount,
    publicProvidersCount,
    publicStatsCount,
    myRequestsTotal: overview.requestsByStatus.total,
    sentCount: overview.providerOffersByStatus.sent,
    completedJobsCount: overview.providerContractsByStatus.completed,
    favoriteRequestCount: overview.favorites.requests,
    navRatingValue,
    navReviewsCount,
    setWorkspaceTab,
    markPublicRequestsSeen,
    guestLoginHref,
    onGuestLockedAction,
  });

  const {
    insightText,
    hasAnyStatsActivity,
    providerStatsPayload,
    clientStatsPayload,
    statsOrder,
  } = useWorkspacePrivateStatsModel({
    t,
    locale,
    overview,
    chartMonthLabel,
    formatNumber,
  });

  const topProviders = useWorkspacePrivateTopProviders({ t, providers });

  return {
    topProviders,
    navTitle,
    activityProgress,
    personalNavItems,
    insightText,
    hasAnyStatsActivity,
    providerStatsPayload,
    clientStatsPayload,
    statsOrder,
  };
}
