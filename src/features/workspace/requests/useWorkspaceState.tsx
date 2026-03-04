'use client';

import * as React from 'react';

import type { AppMeDto } from '@/lib/api/dto/auth';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderProfileDto, ProviderPublicDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import {
  calcMoMDeltaPercent,
  computeClientCompleteness,
  computeProfileCompleteness,
  countCompletedInMonth,
  type DeltaResult,
  formatMoMDeltaLabel,
} from '@/features/workspace/requests/metrics';
import { getClientHint, getProviderHint } from '@/features/workspace/requests/workspace.content';
import { IconBriefcase, IconCheck, IconHeart, IconSend, IconUser } from '@/components/ui/icons/icons';

type StatsPayload = {
  kpis: Array<{ key: string; label: string; value: string }>;
  showKpis?: boolean;
  hasData?: boolean;
  chartTitle: string;
  chartDelta?: string;
  chartPoints: Array<{ label: string; bars: number; line: number }>;
  secondary: {
    leftLabel: string;
    leftValue: string;
    centerLabel: string;
    centerValue: string;
    rightLabel: string;
    rightValue: string;
    progressLabel: string;
    progressValue: number;
    responseLabel: string;
    responseValue: string;
  };
  hint: { text: string; ctaLabel: string; ctaHref: string };
  emptyTitle: string;
  emptyCtaLabel: string;
  emptyCtaHref: string;
};

type Params = {
  t: (key: I18nKey) => string;
  locale: string;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection?: PublicWorkspaceSection | null;
  userName?: string | null;
  authMe: AppMeDto | null;
  myOffers: OfferDto[];
  myRequests: RequestResponseDto[];
  myProviderContracts: ContractDto[];
  myClientContracts: ContractDto[];
  myProviderProfile: ProviderProfileDto | null | undefined;
  providers: ProviderPublicDto[];
  publicRequestsCount: number;
  publicProvidersCount?: number;
  favoriteRequestCount: number;
  workspacePrivateOverview?: WorkspacePrivateOverviewDto | null;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  markPublicRequestsSeen: () => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
  formatNumber: Intl.NumberFormat;
  chartMonthLabel: Intl.DateTimeFormat;
};

export function useWorkspaceState({
  t,
  locale,
  isPersonalized,
  activeWorkspaceTab,
  activePublicSection = null,
  userName,
  authMe,
  myOffers,
  myRequests,
  myProviderContracts,
  myClientContracts,
  myProviderProfile,
  providers,
  publicRequestsCount,
  publicProvidersCount,
  favoriteRequestCount,
  workspacePrivateOverview,
  setWorkspaceTab,
  markPublicRequestsSeen,
  guestLoginHref,
  onGuestLockedAction,
  formatNumber,
  chartMonthLabel,
}: Params) {
  const sentCount = React.useMemo(
    () =>
      workspacePrivateOverview?.providerOffersByStatus.sent ??
      myOffers.filter((offer) => offer.status === 'sent').length,
    [myOffers, workspacePrivateOverview],
  );
  const acceptedCount = React.useMemo(
    () =>
      workspacePrivateOverview?.providerOffersByStatus.accepted ??
      myOffers.filter((offer) => offer.status === 'accepted').length,
    [myOffers, workspacePrivateOverview],
  );
  const declinedCount = React.useMemo(
    () =>
      workspacePrivateOverview?.providerOffersByStatus.declined ??
      myOffers.filter((offer) => offer.status === 'declined').length,
    [myOffers, workspacePrivateOverview],
  );
  const completedJobsCount = React.useMemo(
    () =>
      workspacePrivateOverview?.providerContractsByStatus.completed ??
      myProviderContracts.filter((item) => item.status === 'completed').length,
    [myProviderContracts, workspacePrivateOverview],
  );
  const publicStatsCount = React.useMemo(
    () =>
      workspacePrivateOverview
        ? workspacePrivateOverview.providerContractsByStatus.total +
          workspacePrivateOverview.clientContractsByStatus.total
        : myProviderContracts.length + myClientContracts.length,
    [myClientContracts.length, myProviderContracts.length, workspacePrivateOverview],
  );

  const navTitle = `${t(I18N_KEYS.requestsPage.navGreeting)}, ${(userName ?? '').trim() || t(I18N_KEYS.requestsPage.navUserFallback)}!`;
  const activityProgress = React.useMemo(() => {
    if (workspacePrivateOverview) {
      return clampPercent(workspacePrivateOverview.kpis.activityProgress);
    }
    const activityBase = sentCount + acceptedCount;
    return activityBase > 0 ? clampPercent(Math.round((acceptedCount / activityBase) * 100)) : 12;
  }, [acceptedCount, sentCount, workspacePrivateOverview]);

  const myProviderRating = React.useMemo(() => {
    const rated = myOffers.find((offer) => typeof offer.providerRatingAvg === 'number');
    return {
      avg: rated?.providerRatingAvg ?? 0,
      count: rated?.providerRatingCount ?? 0,
    };
  }, [myOffers]);
  const navRatingValue = myProviderRating.avg.toFixed(1);
  const navReviewsCount = myProviderRating.count;

  const hasActivePublicSection =
    activePublicSection === 'requests' || activePublicSection === 'providers' || activePublicSection === 'stats';
  const resolvedPublicProvidersCount = publicProvidersCount ?? providers.length;

  const publicNavItems = React.useMemo<PersonalNavItem[]>(
    () => [
      {
        key: 'public-requests',
        href: '/workspace?section=requests',
        label: t(I18N_KEYS.homePublic.exploreAllOrders),
        icon: <IconBriefcase />,
        value: formatNumber.format(publicRequestsCount),
        hint: t(I18N_KEYS.requestsPage.resultsLabel),
        onClick: markPublicRequestsSeen,
        forceActive: activePublicSection === 'requests',
      },
      {
        key: 'public-providers',
        href: '/workspace?section=providers',
        label: t(I18N_KEYS.homePublic.exploreAllProviders),
        icon: <IconUser />,
        value: formatNumber.format(resolvedPublicProvidersCount),
        hint: t(I18N_KEYS.requestsPage.heroProviderPrimaryCta),
        forceActive: activePublicSection === 'providers',
      },
      {
        key: 'public-stats',
        href: '/workspace?section=stats',
        label: t(I18N_KEYS.homePublic.exploreStats),
        icon: <IconCheck />,
        value: formatNumber.format(publicStatsCount),
        hint: t(I18N_KEYS.homePublic.activitySubtitle),
        forceActive: activePublicSection === 'stats',
      },
    ],
    [
      activePublicSection,
      formatNumber,
      markPublicRequestsSeen,
      publicRequestsCount,
      publicStatsCount,
      resolvedPublicProvidersCount,
      t,
    ],
  );

  const myRequestsTotal = React.useMemo(
    () => workspacePrivateOverview?.requestsByStatus.total ?? myRequests.length,
    [myRequests.length, workspacePrivateOverview],
  );
  const myOpenRequestsCount = React.useMemo(
    () => workspacePrivateOverview?.kpis.myOpenRequests ?? countOpenRequests(myRequests),
    [myRequests, workspacePrivateOverview],
  );
  const recentOffers7d = React.useMemo(
    () => workspacePrivateOverview?.kpis.recentOffers7d ?? countRecentOffers7d(myOffers),
    [myOffers, workspacePrivateOverview],
  );
  const providerActiveContractsCount = React.useMemo(
    () =>
      workspacePrivateOverview?.kpis.providerActiveContracts ??
      myProviderContracts.filter(
        (item) => item.status === 'pending' || item.status === 'confirmed' || item.status === 'in_progress',
      ).length,
    [myProviderContracts, workspacePrivateOverview],
  );
  const clientActiveContractsCount = React.useMemo(
    () =>
      workspacePrivateOverview?.kpis.clientActiveContracts ??
      myClientContracts.filter(
        (item) => item.status === 'pending' || item.status === 'confirmed' || item.status === 'in_progress',
      ).length,
    [myClientContracts, workspacePrivateOverview],
  );
  const clientCompletedContractsCount = React.useMemo(
    () =>
      workspacePrivateOverview?.clientContractsByStatus.completed ??
      myClientContracts.filter((item) => item.status === 'completed').length,
    [myClientContracts, workspacePrivateOverview],
  );

  const acceptanceRate = React.useMemo(() => {
    if (workspacePrivateOverview) {
      return clampPercent(workspacePrivateOverview.kpis.acceptanceRate);
    }
    const acceptedDecidedDenominator = acceptedCount + declinedCount;
    return clampPercent(Math.round((acceptedCount / Math.max(acceptedDecidedDenominator, 1)) * 100));
  }, [acceptedCount, declinedCount, workspacePrivateOverview]);
  const avgResponseMinutes = React.useMemo(
    () => workspacePrivateOverview?.kpis.avgResponseMinutes ?? calcAverageResponseMinutes(myOffers),
    [myOffers, workspacePrivateOverview],
  );

  const providerProfileCompleteness = React.useMemo(
    () =>
      workspacePrivateOverview?.profiles.providerCompleteness ??
      computeProfileCompleteness(myProviderProfile),
    [myProviderProfile, workspacePrivateOverview],
  );
  const clientProfileCompleteness = React.useMemo(
    () =>
      workspacePrivateOverview?.profiles.clientCompleteness ??
      computeClientCompleteness(authMe),
    [authMe, workspacePrivateOverview],
  );

  const providerCompletedContracts = React.useMemo(
    () => myProviderContracts.filter((item) => item.status === 'completed'),
    [myProviderContracts],
  );
  const providerCompletedThisMonth = React.useMemo(
    () =>
      workspacePrivateOverview?.insights.providerCompletedThisMonth ??
      countCompletedInMonth(providerCompletedContracts, 0),
    [providerCompletedContracts, workspacePrivateOverview],
  );
  const providerCompletedLastMonth = React.useMemo(
    () =>
      workspacePrivateOverview?.insights.providerCompletedLastMonth ??
      countCompletedInMonth(providerCompletedContracts, -1),
    [providerCompletedContracts, workspacePrivateOverview],
  );
  const completedMoMDelta = React.useMemo<DeltaResult>(() => {
    const privateDeltaKind = workspacePrivateOverview?.insights.providerCompletedDeltaKind;
    const privateDeltaPercent = workspacePrivateOverview?.insights.providerCompletedDeltaPercent;
    if (
      privateDeltaKind === 'percent' &&
      typeof privateDeltaPercent === 'number'
    ) {
      return {
        kind: 'percent',
        value: privateDeltaPercent,
      };
    }
    if (privateDeltaKind === 'new') return { kind: 'new' };
    if (privateDeltaKind === 'none') return { kind: 'none' };
    return calcMoMDeltaPercent(providerCompletedThisMonth, providerCompletedLastMonth);
  }, [providerCompletedLastMonth, providerCompletedThisMonth, workspacePrivateOverview]);
  const completedMoMLabel = React.useMemo(
    () => formatMoMDeltaLabel(completedMoMDelta, locale),
    [completedMoMDelta, locale],
  );
  const insightText = `${t(I18N_KEYS.requestsPage.navInsightClosedPrefix)} ${providerCompletedThisMonth} ${t(
    I18N_KEYS.requestsPage.navInsightClosedSuffix,
  )} ${completedMoMLabel}`;

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
      hasActivePublicSection,
      activeWorkspaceTab,
      completedJobsCount,
      favoriteRequestCount,
      guestLoginHref,
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

  const providerChartPoints = React.useMemo(
    () => mapMonthlySeries(workspacePrivateOverview?.providerMonthlySeries, chartMonthLabel),
    [chartMonthLabel, workspacePrivateOverview],
  );
  const clientChartPoints = React.useMemo(
    () => mapMonthlySeries(workspacePrivateOverview?.clientMonthlySeries, chartMonthLabel),
    [chartMonthLabel, workspacePrivateOverview],
  );

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
          { tab: 'provider' as const, title: t(I18N_KEYS.requestsPage.statsProviderTitle), payload: providerStatsPayload },
          { tab: 'client' as const, title: t(I18N_KEYS.requestsPage.statsClientTitle), payload: clientStatsPayload },
        ]
      : [
          { tab: 'client' as const, title: t(I18N_KEYS.requestsPage.statsClientTitle), payload: clientStatsPayload },
          { tab: 'provider' as const, title: t(I18N_KEYS.requestsPage.statsProviderTitle), payload: providerStatsPayload },
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

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countOpenRequests(items: RequestResponseDto[]) {
  return items.filter(
    (item) =>
      item.status === 'draft' ||
      item.status === 'published' ||
      item.status === 'paused' ||
      item.status === 'matched',
  ).length;
}

function countRecentOffers7d(items: OfferDto[]) {
  const nowTs = Date.now();
  return items.filter((item) => nowTs - new Date(item.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length;
}

function calcAverageResponseMinutes(items: OfferDto[]) {
  const samples = items
    .map((item) => {
      const created = new Date(item.createdAt).getTime();
      const updated = new Date(item.updatedAt).getTime();
      if (!Number.isFinite(created) || !Number.isFinite(updated)) return null;
      const diff = Math.round((updated - created) / (1000 * 60));
      return diff > 0 ? diff : null;
    })
    .filter((value): value is number => value !== null);

  if (samples.length === 0) return null;
  return Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length);
}

function mapMonthlySeries(
  series: WorkspacePrivateOverviewDto['providerMonthlySeries'] | undefined,
  chartMonthLabel: Intl.DateTimeFormat,
) {
  return (series ?? []).map((point) => {
    const ts = new Date(point.monthStart);
    return {
      label: Number.isFinite(ts.getTime()) ? chartMonthLabel.format(ts) : point.monthStart.slice(0, 7),
      bars: Math.max(0, point.bars),
      line: Math.max(0, point.line),
    };
  });
}
