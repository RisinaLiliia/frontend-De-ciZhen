'use client';

import * as React from 'react';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { DeltaResult } from '@/features/workspace/requests/metrics';
import { formatMoMDeltaLabel } from '@/features/workspace/requests/metrics';
import { getClientHint, getProviderHint } from '@/features/workspace/requests/workspace.content';
import { IconBriefcase, IconCheck, IconHeart, IconSend, IconUser } from '@/components/ui/icons/icons';
import {
  buildPublicNavItems,
  clampPercent,
  mapMonthlySeries,
  type StatsPayload,
} from '@/features/workspace/requests/workspaceState.shared';

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

const EMPTY_OVERVIEW: WorkspacePrivateOverviewDto = {
  updatedAt: '',
  user: { userId: '', role: 'client' },
  requestsByStatus: {
    draft: 0,
    published: 0,
    paused: 0,
    matched: 0,
    closed: 0,
    cancelled: 0,
    total: 0,
  },
  providerOffersByStatus: {
    sent: 0,
    accepted: 0,
    declined: 0,
    withdrawn: 0,
    total: 0,
  },
  clientOffersByStatus: {
    sent: 0,
    accepted: 0,
    declined: 0,
    withdrawn: 0,
    total: 0,
  },
  providerContractsByStatus: {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  },
  clientContractsByStatus: {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  },
  favorites: { requests: 0, providers: 0 },
  reviews: { asProvider: 0, asClient: 0 },
  profiles: { providerCompleteness: 0, clientCompleteness: 0 },
  kpis: {
    myOpenRequests: 0,
    providerActiveContracts: 0,
    clientActiveContracts: 0,
    acceptanceRate: 0,
    activityProgress: 0,
    avgResponseMinutes: null,
    recentOffers7d: 0,
  },
  insights: {
    providerCompletedThisMonth: 0,
    providerCompletedLastMonth: 0,
    providerCompletedDeltaKind: 'none',
    providerCompletedDeltaPercent: null,
  },
  providerMonthlySeries: [],
  clientMonthlySeries: [],
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
  const overview = workspacePrivateOverview ?? EMPTY_OVERVIEW;
  const hasActivePublicSection =
    activePublicSection === 'requests' || activePublicSection === 'providers' || activePublicSection === 'stats';
  const navTitle = `${t(I18N_KEYS.requestsPage.navGreeting)}, ${(userName ?? '').trim() || t(I18N_KEYS.requestsPage.navUserFallback)}!`;
  const activityProgress = clampPercent(overview.kpis.activityProgress);

  const ratedOffer = React.useMemo(
    () => myOffers.find((offer) => typeof offer.providerRatingAvg === 'number'),
    [myOffers],
  );
  const navRatingValue = (ratedOffer?.providerRatingAvg ?? 0).toFixed(1);
  const navReviewsCount = ratedOffer?.providerRatingCount ?? overview.reviews.asProvider;

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

  const myRequestsTotal = overview.requestsByStatus.total;
  const sentCount = overview.providerOffersByStatus.sent;
  const acceptedCount = overview.providerOffersByStatus.accepted;
  const declinedCount = overview.providerOffersByStatus.declined;
  const completedJobsCount = overview.providerContractsByStatus.completed;
  const favoriteRequestCount = overview.favorites.requests;

  const personalNavItems = React.useMemo<PersonalNavItem[]>(
    () =>
      isPersonalized
        ? [
            ...publicNavItems,
            {
              key: 'my-requests',
              href: '/workspace?tab=my-requests',
              label: t(I18N_KEYS.requestsPage.navMyOrders),
              icon: <IconBriefcase />,
              value: myRequestsTotal,
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
              value: sentCount,
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
              value: completedJobsCount,
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
              value: favoriteRequestCount,
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
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              onClick: () => setWorkspaceTab('reviews'),
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'reviews',
              match: 'exact',
            },
          ]
        : [
            ...publicNavItems,
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
            },
            {
              key: 'reviews',
              href: '/workspace?tab=reviews',
              label: t(I18N_KEYS.requestsPage.navReviews),
              icon: <IconUser />,
              rating: {
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              disabled: true,
              lockedHref: guestLoginHref,
              onClick: onGuestLockedAction,
              forceActive: !hasActivePublicSection && activeWorkspaceTab === 'reviews',
              match: 'exact',
            },
          ],
    [
      activeWorkspaceTab,
      completedJobsCount,
      favoriteRequestCount,
      guestLoginHref,
      hasActivePublicSection,
      isPersonalized,
      myRequestsTotal,
      navRatingValue,
      navReviewsCount,
      onGuestLockedAction,
      publicNavItems,
      sentCount,
      setWorkspaceTab,
      t,
    ],
  );

  const providerCompletedThisMonth = overview.insights.providerCompletedThisMonth;
  const completedMoMDelta: DeltaResult = React.useMemo(() => {
    if (
      overview.insights.providerCompletedDeltaKind === 'percent' &&
      typeof overview.insights.providerCompletedDeltaPercent === 'number'
    ) {
      return {
        kind: 'percent',
        value: overview.insights.providerCompletedDeltaPercent,
      };
    }
    if (overview.insights.providerCompletedDeltaKind === 'new') return { kind: 'new' };
    return { kind: 'none' };
  }, [overview.insights.providerCompletedDeltaKind, overview.insights.providerCompletedDeltaPercent]);
  const completedMoMLabel = React.useMemo(
    () => formatMoMDeltaLabel(completedMoMDelta, locale),
    [completedMoMDelta, locale],
  );
  const insightText = `${t(I18N_KEYS.requestsPage.navInsightClosedPrefix)} ${providerCompletedThisMonth} ${t(
    I18N_KEYS.requestsPage.navInsightClosedSuffix,
  )} ${completedMoMLabel}`;

  const providerChartPoints = React.useMemo(
    () => mapMonthlySeries(overview.providerMonthlySeries, chartMonthLabel),
    [chartMonthLabel, overview.providerMonthlySeries],
  );
  const clientChartPoints = React.useMemo(
    () => mapMonthlySeries(overview.clientMonthlySeries, chartMonthLabel),
    [chartMonthLabel, overview.clientMonthlySeries],
  );

  const myOpenRequestsCount = overview.kpis.myOpenRequests;
  const recentOffers7d = overview.kpis.recentOffers7d;
  const providerActiveContractsCount = overview.kpis.providerActiveContracts;
  const clientActiveContractsCount = overview.kpis.clientActiveContracts;
  const clientCompletedContractsCount = overview.clientContractsByStatus.completed;
  const acceptanceRate = clampPercent(overview.kpis.acceptanceRate);
  const avgResponseMinutes = overview.kpis.avgResponseMinutes;

  const providerProfileCompleteness = overview.profiles.providerCompleteness;
  const clientProfileCompleteness = overview.profiles.clientCompleteness;
  const providerHint = React.useMemo(
    () => getProviderHint(t, providerProfileCompleteness, recentOffers7d, acceptanceRate),
    [acceptanceRate, providerProfileCompleteness, recentOffers7d, t],
  );
  const clientHint = React.useMemo(
    () => getClientHint(t, myRequestsTotal, myOpenRequestsCount),
    [myOpenRequestsCount, myRequestsTotal, t],
  );

  const providerActivityCount =
    sentCount +
    acceptedCount +
    declinedCount +
    providerActiveContractsCount +
    completedJobsCount;
  const clientActivityCount =
    myRequestsTotal +
    myOpenRequestsCount +
    clientActiveContractsCount +
    clientCompletedContractsCount;
  const hasAnyStatsActivity = providerActivityCount + clientActivityCount > 0;

  const providerPriorityScore = providerProfileCompleteness + providerActivityCount * 5;
  const clientPriorityScore = clientProfileCompleteness + clientActivityCount * 5;

  const providerDelta = React.useMemo(() => {
    if (completedMoMDelta.kind === 'percent') {
      const delta = Math.round(completedMoMDelta.value);
      return `${delta >= 0 ? '+' : ''}${delta}%`;
    }
    return undefined;
  }, [completedMoMDelta]);

  const providerStatsPayload: StatsPayload = {
    kpis: [],
    showKpis: false,
    hasData: hasAnyStatsActivity,
    chartTitle: t(I18N_KEYS.requestsPage.statsProviderChartTitle),
    chartDelta: providerDelta,
    chartPoints: providerChartPoints,
    secondary: {
      leftLabel: t(I18N_KEYS.requestsPage.statsLabelSent),
      leftValue: formatNumber.format(sentCount),
      centerLabel: t(I18N_KEYS.requestsPage.statsLabelAccepted),
      centerValue: formatNumber.format(acceptedCount),
      rightLabel: t(I18N_KEYS.requestsPage.statsLabelActive),
      rightValue: formatNumber.format(providerActiveContractsCount),
      progressLabel: t(I18N_KEYS.requestsPage.statsLabelAcceptanceRate),
      progressValue: acceptanceRate,
      responseLabel: t(I18N_KEYS.requestsPage.statsLabelResponseTime),
      responseValue:
        typeof avgResponseMinutes === 'number'
          ? `${avgResponseMinutes} ${t(I18N_KEYS.requestsPage.statsMinutesSuffix)}`
          : '—',
    },
    hint: providerHint,
    emptyTitle: t(I18N_KEYS.requestsPage.statsProviderEmptyTitle),
    emptyCtaLabel: t(I18N_KEYS.requestsPage.statsProviderEmptyCta),
    emptyCtaHref: '/workspace?section=requests',
  };

  const clientStatsPayload: StatsPayload = {
    kpis: [
      {
        key: 'requests-total',
        label: t(I18N_KEYS.requestsPage.statsKpiMyRequests),
        value: formatNumber.format(myRequestsTotal),
      },
      {
        key: 'requests-open',
        label: t(I18N_KEYS.requestsPage.statsKpiOpen),
        value: formatNumber.format(myOpenRequestsCount),
      },
      {
        key: 'contracts-active',
        label: t(I18N_KEYS.requestsPage.statsKpiInProgress),
        value: formatNumber.format(clientActiveContractsCount),
      },
      {
        key: 'contracts-completed',
        label: t(I18N_KEYS.requestsPage.statsKpiCompleted),
        value: formatNumber.format(clientCompletedContractsCount),
      },
    ],
    chartTitle: t(I18N_KEYS.requestsPage.statsClientChartTitle),
    chartPoints: clientChartPoints,
    secondary: {
      leftLabel: t(I18N_KEYS.requestsPage.statsLabelTotal),
      leftValue: formatNumber.format(myRequestsTotal),
      centerLabel: t(I18N_KEYS.requestsPage.statsLabelOpen),
      centerValue: formatNumber.format(myOpenRequestsCount),
      rightLabel: t(I18N_KEYS.requestsPage.statsKpiInProgress),
      rightValue: formatNumber.format(clientActiveContractsCount),
      progressLabel: t(I18N_KEYS.requestsPage.statsLabelCompletionRate),
      progressValue: clampPercent(
        Math.round((clientCompletedContractsCount / Math.max(1, myRequestsTotal)) * 100),
      ),
      responseLabel: t(I18N_KEYS.requestsPage.statsLabelCompletedJobs),
      responseValue: formatNumber.format(clientCompletedContractsCount),
    },
    hint: clientHint,
    emptyTitle: t(I18N_KEYS.requestsPage.statsClientEmptyTitle),
    emptyCtaLabel: t(I18N_KEYS.requestsPage.statsClientEmptyCta),
    emptyCtaHref: '/request/create',
  };

  const statsOrder =
    providerPriorityScore >= clientPriorityScore
      ? [
          {
            tab: 'provider' as const,
            title: t(I18N_KEYS.requestsPage.statsProviderTitle),
            payload: providerStatsPayload,
          },
          {
            tab: 'client' as const,
            title: t(I18N_KEYS.requestsPage.statsClientTitle),
            payload: clientStatsPayload,
          },
        ]
      : [
          {
            tab: 'client' as const,
            title: t(I18N_KEYS.requestsPage.statsClientTitle),
            payload: clientStatsPayload,
          },
          {
            tab: 'provider' as const,
            title: t(I18N_KEYS.requestsPage.statsProviderTitle),
            payload: providerStatsPayload,
          },
        ];

  const topProviders = React.useMemo<TopProviderItem[]>(() => {
    const sorted = [...providers].sort((a, b) => b.ratingAvg - a.ratingAvg);
    return sorted.slice(0, 2).map((provider) =>
      mapPublicProviderToCard({
        t,
        provider,
        roleLabel: '',
        profileHref: `/providers/${provider.id}`,
        reviewsHref: `/providers/${provider.id}#reviews`,
        ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
        status: 'online',
      }),
    );
  }, [providers, t]);

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
