'use client';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import type { useWorkspacePrivateNavModel } from '@/features/workspace/requests/useWorkspacePrivateNavModel';
import type { useWorkspacePrivateStatsModel } from '@/features/workspace/requests/useWorkspacePrivateStatsModel';
import type { useWorkspacePrivateTopProviders } from '@/features/workspace/requests/useWorkspacePrivateTopProviders';
import { clampPercent } from '@/features/workspace/requests/workspaceState.metrics';
import { EMPTY_WORKSPACE_PRIVATE_OVERVIEW } from '@/features/workspace/requests/workspacePrivateState.constants';

type WorkspacePrivateNavModelArgs = Parameters<typeof useWorkspacePrivateNavModel>[0];
type WorkspacePrivateStatsModelArgs = Parameters<typeof useWorkspacePrivateStatsModel>[0];
type WorkspacePrivateTopProvidersArgs = Parameters<typeof useWorkspacePrivateTopProviders>[0];

export function resolveWorkspacePrivateOverview(
  overview: WorkspacePrivateOverviewDto | null | undefined,
) {
  return overview ?? EMPTY_WORKSPACE_PRIVATE_OVERVIEW;
}

export function resolveWorkspacePrivateMeta(params: {
  overview: WorkspacePrivateOverviewDto;
  myOffers: OfferDto[];
}) {
  const ratedOffer = params.myOffers.find((offer) => typeof offer.providerRatingAvg === 'number');

  return {
    activityProgress: clampPercent(params.overview.kpis.activityProgress),
    navRatingValue: (ratedOffer?.providerRatingAvg ?? 0).toFixed(1),
    navReviewsCount: ratedOffer?.providerRatingCount ?? params.overview.reviews.asProvider,
  };
}

export function buildWorkspacePrivateNavModelArgs(params: {
  t: WorkspacePrivateNavModelArgs['t'];
  formatNumber: WorkspacePrivateNavModelArgs['formatNumber'];
  isPersonalized: WorkspacePrivateNavModelArgs['isPersonalized'];
  activeWorkspaceTab: WorkspacePrivateNavModelArgs['activeWorkspaceTab'];
  activePublicSection: WorkspacePrivateNavModelArgs['activePublicSection'];
  userName: WorkspacePrivateNavModelArgs['userName'];
  publicRequestsCount: WorkspacePrivateNavModelArgs['publicRequestsCount'];
  publicProvidersCount: WorkspacePrivateNavModelArgs['publicProvidersCount'];
  publicStatsCount: WorkspacePrivateNavModelArgs['publicStatsCount'];
  overview: WorkspacePrivateOverviewDto;
  navRatingValue: string;
  navReviewsCount: number;
  setWorkspaceTab: WorkspacePrivateNavModelArgs['setWorkspaceTab'];
  markPublicRequestsSeen: WorkspacePrivateNavModelArgs['markPublicRequestsSeen'];
  guestLoginHref: WorkspacePrivateNavModelArgs['guestLoginHref'];
  onGuestLockedAction: WorkspacePrivateNavModelArgs['onGuestLockedAction'];
}): WorkspacePrivateNavModelArgs {
  return {
    t: params.t,
    formatNumber: params.formatNumber,
    isPersonalized: params.isPersonalized,
    activeWorkspaceTab: params.activeWorkspaceTab,
    activePublicSection: params.activePublicSection,
    userName: params.userName,
    publicRequestsCount: params.publicRequestsCount,
    publicProvidersCount: params.publicProvidersCount,
    publicStatsCount: params.publicStatsCount,
    myRequestsTotal: params.overview.requestsByStatus.total,
    sentCount: params.overview.providerOffersByStatus.sent,
    completedJobsCount: params.overview.providerContractsByStatus.completed,
    favoriteRequestCount: params.overview.favorites.requests,
    navRatingValue: params.navRatingValue,
    navReviewsCount: params.navReviewsCount,
    setWorkspaceTab: params.setWorkspaceTab,
    markPublicRequestsSeen: params.markPublicRequestsSeen,
    guestLoginHref: params.guestLoginHref,
    onGuestLockedAction: params.onGuestLockedAction,
  };
}

export function buildWorkspacePrivateStatsModelArgs(params: {
  t: WorkspacePrivateStatsModelArgs['t'];
  locale: WorkspacePrivateStatsModelArgs['locale'];
  overview: WorkspacePrivateStatsModelArgs['overview'];
  chartMonthLabel: WorkspacePrivateStatsModelArgs['chartMonthLabel'];
  formatNumber: WorkspacePrivateStatsModelArgs['formatNumber'];
}): WorkspacePrivateStatsModelArgs {
  return {
    t: params.t,
    locale: params.locale,
    overview: params.overview,
    chartMonthLabel: params.chartMonthLabel,
    formatNumber: params.formatNumber,
  };
}

export function buildWorkspacePrivateTopProvidersArgs(params: {
  t: WorkspacePrivateTopProvidersArgs['t'];
  providers: WorkspacePrivateTopProvidersArgs['providers'];
}): WorkspacePrivateTopProvidersArgs {
  return {
    t: params.t,
    providers: params.providers,
  };
}

export function resolveWorkspacePrivateStateResult(params: {
  topProviders: ReturnType<typeof useWorkspacePrivateTopProviders>;
  activityProgress: number;
  nav: ReturnType<typeof useWorkspacePrivateNavModel>;
  stats: ReturnType<typeof useWorkspacePrivateStatsModel>;
}) {
  return {
    topProviders: params.topProviders,
    navTitle: params.nav.navTitle,
    navSubtitle: params.nav.navSubtitle,
    activityProgress: params.activityProgress,
    personalNavItems: params.nav.personalNavItems,
    insightText: params.stats.insightText,
    hasAnyStatsActivity: params.stats.hasAnyStatsActivity,
    providerStatsPayload: params.stats.providerStatsPayload,
    clientStatsPayload: params.stats.clientStatsPayload,
    statsOrder: params.stats.statsOrder,
  };
}
