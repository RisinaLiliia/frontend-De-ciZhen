'use client';

import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import type { useWorkspacePrivateNavModel } from '@/features/workspace/requests/useWorkspacePrivateNavModel';
import type { useWorkspacePrivateTopProviders } from '@/features/workspace/requests/useWorkspacePrivateTopProviders';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceRequestsScope } from '@/features/workspace/requests/workspaceRequestsScope.model';
import { clampPercent } from '@/features/workspace/requests/workspaceState.metrics';
import { EMPTY_WORKSPACE_PRIVATE_OVERVIEW } from '@/features/workspace/requests/workspacePrivateState.constants';

type WorkspacePrivateNavModelArgs = Parameters<typeof useWorkspacePrivateNavModel>[0];
type WorkspacePrivateTopProvidersArgs = Parameters<typeof useWorkspacePrivateTopProviders>[0];

export type WorkspacePrivateOverviewState = {
  activityProgress: number;
  navRatingValue: string;
  navReviewsCount: number;
  preferredRequestsRole: 'customer' | 'provider' | null;
  myRequestsTotal: number;
  sentCount: number;
  completedJobsCount: number;
  favoriteRequestCount: number;
};

export function shouldBuildWorkspacePrivateTopProviders(params: {
  activePublicSection: PublicWorkspaceSection | null;
  requestsScope: WorkspaceRequestsScope;
}) {
  return !(params.activePublicSection === 'requests' && params.requestsScope === 'my');
}

export function resolveWorkspacePrivateOverview(
  overview: WorkspacePrivateOverviewDto | null | undefined,
) {
  return overview ?? EMPTY_WORKSPACE_PRIVATE_OVERVIEW;
}

export function resolveWorkspacePrivateOverviewState(
  overview: WorkspacePrivateOverviewDto | null | undefined,
): WorkspacePrivateOverviewState {
  const resolvedOverview = resolveWorkspacePrivateOverview(overview);
  const ratingAverage = Number(resolvedOverview.ratingSummary?.average ?? 0);
  const ratingCount = Number(
    resolvedOverview.ratingSummary?.count ?? resolvedOverview.reviews.asProvider ?? 0,
  );

  return {
    activityProgress: clampPercent(resolvedOverview.kpis.activityProgress),
    navRatingValue: ratingAverage.toFixed(1),
    navReviewsCount: Math.max(0, ratingCount),
    preferredRequestsRole: resolvedOverview.preferredRole ?? null,
    myRequestsTotal: resolvedOverview.requestsByStatus.total,
    sentCount: resolvedOverview.providerOffersByStatus.sent,
    completedJobsCount: resolvedOverview.providerContractsByStatus.completed,
    favoriteRequestCount: resolvedOverview.favorites.requests,
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
  privateOverviewState: WorkspacePrivateOverviewState;
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
    myRequestsTotal: params.privateOverviewState.myRequestsTotal,
    sentCount: params.privateOverviewState.sentCount,
    completedJobsCount: params.privateOverviewState.completedJobsCount,
    favoriteRequestCount: params.privateOverviewState.favoriteRequestCount,
    navRatingValue: params.privateOverviewState.navRatingValue,
    navReviewsCount: params.privateOverviewState.navReviewsCount,
    setWorkspaceTab: params.setWorkspaceTab,
    markPublicRequestsSeen: params.markPublicRequestsSeen,
    guestLoginHref: params.guestLoginHref,
    onGuestLockedAction: params.onGuestLockedAction,
  };
}

export function buildWorkspacePrivateTopProvidersArgs(params: {
  t: WorkspacePrivateTopProvidersArgs['t'];
  locale: WorkspacePrivateTopProvidersArgs['locale'];
  providers: WorkspacePrivateTopProvidersArgs['providers'];
}): WorkspacePrivateTopProvidersArgs {
  return {
    t: params.t,
    locale: params.locale,
    providers: params.providers,
  };
}

export function resolveWorkspacePrivateStateResult(params: {
  topProviders: ReturnType<typeof useWorkspacePrivateTopProviders>;
  privateOverviewState: WorkspacePrivateOverviewState;
  nav: ReturnType<typeof useWorkspacePrivateNavModel>;
}) {
  return {
    topProviders: params.topProviders,
    navTitle: params.nav.navTitle,
    navSubtitle: params.nav.navSubtitle,
    activityProgress: params.privateOverviewState.activityProgress,
    preferredRequestsRole: params.privateOverviewState.preferredRequestsRole,
    personalNavItems: params.nav.personalNavItems,
  };
}
