'use client';

import * as React from 'react';

import type { AppMeDto } from '@/lib/api/dto/auth';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderProfileDto, ProviderPublicDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { WorkspaceTab } from '@/features/requests/page/workspace';
import {
  buildLastSixMonthSeries,
  calcMoMDeltaPercent,
  computeClientCompleteness,
  computeProfileCompleteness,
  countCompletedInMonth,
  formatMoMDeltaLabel,
} from '@/features/requests/page/metrics';
import { getClientHint, getProviderHint } from '@/features/requests/page/workspaceCopy';
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
  userName?: string | null;
  authMe: AppMeDto | null;
  myOffers: OfferDto[];
  myRequests: RequestResponseDto[];
  myProviderContracts: ContractDto[];
  myClientContracts: ContractDto[];
  myProviderProfile: ProviderProfileDto | null | undefined;
  providers: ProviderPublicDto[];
  newOrdersCount: number;
  favoriteRequestCount: number;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  markNewOrdersSeen: () => void;
  formatNumber: Intl.NumberFormat;
  chartMonthLabel: Intl.DateTimeFormat;
};

export function useRequestsWorkspaceState({
  t,
  locale,
  isPersonalized,
  activeWorkspaceTab,
  userName,
  authMe,
  myOffers,
  myRequests,
  myProviderContracts,
  myClientContracts,
  myProviderProfile,
  providers,
  newOrdersCount,
  favoriteRequestCount,
  setWorkspaceTab,
  markNewOrdersSeen,
  formatNumber,
  chartMonthLabel,
}: Params) {
  const sentCount = React.useMemo(
    () => myOffers.filter((offer) => offer.status === 'sent').length,
    [myOffers],
  );
  const acceptedCount = React.useMemo(
    () => myOffers.filter((offer) => offer.status === 'accepted').length,
    [myOffers],
  );
  const declinedCount = React.useMemo(
    () => myOffers.filter((offer) => offer.status === 'declined').length,
    [myOffers],
  );
  const completedJobsCount = React.useMemo(
    () => myProviderContracts.filter((item) => item.status === 'completed').length,
    [myProviderContracts],
  );

  const navTitle = `${t(I18N_KEYS.requestsPage.navGreeting)}, ${(userName ?? '').trim() || t(I18N_KEYS.requestsPage.navUserFallback)}!`;
  const activityBase = sentCount + acceptedCount;
  const activityProgress = activityBase > 0 ? Math.round((acceptedCount / activityBase) * 100) : 12;

  const myProviderRating = React.useMemo(() => {
    const rated = myOffers.find((offer) => typeof offer.providerRatingAvg === 'number');
    return {
      avg: rated?.providerRatingAvg ?? 0,
      count: rated?.providerRatingCount ?? 0,
    };
  }, [myOffers]);
  const navRatingValue = myProviderRating.avg.toFixed(1);
  const navReviewsCount = myProviderRating.count;

  const personalNavItems = React.useMemo<PersonalNavItem[]>(
    () =>
      isPersonalized
        ? [
            {
              key: 'new-orders',
              href: '/orders?tab=new-orders',
              label: t(I18N_KEYS.requestsPage.navNewOrders),
              icon: <IconBriefcase />,
              value: newOrdersCount,
              hint: t(I18N_KEYS.requestsPage.resultsLabel),
              onClick: () => {
                markNewOrdersSeen();
                setWorkspaceTab('new-orders');
              },
              forceActive: activeWorkspaceTab === 'new-orders',
              match: 'exact',
            },
            {
              key: 'my-orders',
              href: '/orders?tab=my-requests',
              label: t(I18N_KEYS.requestsPage.navMyOrders),
              icon: <IconBriefcase />,
              value: myRequests.length,
              hint: t(I18N_KEYS.requestsPage.summaryAccepted),
              onClick: () => setWorkspaceTab('my-requests'),
              forceActive: activeWorkspaceTab === 'my-requests',
              match: 'exact',
            },
            {
              key: 'my-offers',
              href: '/orders?tab=my-offers',
              label: t(I18N_KEYS.requestsPage.navMyOffers),
              icon: <IconSend />,
              value: sentCount,
              hint: t(I18N_KEYS.requestsPage.summarySent),
              onClick: () => setWorkspaceTab('my-offers'),
              forceActive: activeWorkspaceTab === 'my-offers',
              match: 'exact',
            },
            {
              key: 'completed-jobs',
              href: '/orders?tab=completed-jobs',
              label: t(I18N_KEYS.requestsPage.navCompletedJobs),
              icon: <IconCheck />,
              value: completedJobsCount,
              hint: t(I18N_KEYS.provider.jobs),
              onClick: () => setWorkspaceTab('completed-jobs'),
              forceActive: activeWorkspaceTab === 'completed-jobs',
              match: 'exact',
            },
            {
              key: 'my-favorites',
              href: '/orders?tab=favorites',
              label: t(I18N_KEYS.requestDetails.saved),
              icon: <IconHeart />,
              value: favoriteRequestCount,
              hint: t(I18N_KEYS.requestDetails.ctaSave),
              onClick: () => setWorkspaceTab('favorites'),
              forceActive: activeWorkspaceTab === 'favorites',
              match: 'exact',
            },
            {
              key: 'reviews',
              href: '/orders?tab=reviews',
              label: t(I18N_KEYS.requestsPage.navReviews),
              icon: <IconUser />,
              rating: {
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              onClick: () => setWorkspaceTab('reviews'),
              forceActive: activeWorkspaceTab === 'reviews',
              match: 'exact',
            },
          ]
        : [
            {
              key: 'new-orders',
              href: '/orders?tab=new-orders',
              label: t(I18N_KEYS.requestsPage.navNewOrders),
              icon: <IconBriefcase />,
              value: newOrdersCount,
              hint: t(I18N_KEYS.requestsPage.resultsLabel),
              onClick: () => {
                markNewOrdersSeen();
                setWorkspaceTab('new-orders');
              },
              forceActive: activeWorkspaceTab === 'new-orders',
              match: 'exact',
            },
            {
              key: 'my-orders',
              href: '/orders?tab=my-requests',
              label: t(I18N_KEYS.requestsPage.navMyOrders),
              icon: <IconBriefcase />,
              hint: t(I18N_KEYS.requestsPage.summaryAccepted),
              onClick: () => setWorkspaceTab('my-requests'),
              forceActive: activeWorkspaceTab === 'my-requests',
              match: 'exact',
            },
            {
              key: 'my-offers',
              href: '/orders?tab=my-offers',
              label: t(I18N_KEYS.requestsPage.navMyOffers),
              icon: <IconSend />,
              hint: t(I18N_KEYS.requestsPage.summarySent),
              onClick: () => setWorkspaceTab('my-offers'),
              forceActive: activeWorkspaceTab === 'my-offers',
              match: 'exact',
            },
            {
              key: 'my-favorites',
              href: '/orders?tab=favorites',
              label: t(I18N_KEYS.requestDetails.saved),
              icon: <IconHeart />,
              hint: t(I18N_KEYS.requestDetails.ctaSave),
              onClick: () => setWorkspaceTab('favorites'),
              forceActive: activeWorkspaceTab === 'favorites',
              match: 'exact',
            },
            {
              key: 'reviews',
              href: '/orders?tab=reviews',
              label: t(I18N_KEYS.requestsPage.navReviews),
              icon: <IconUser />,
              rating: {
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              onClick: () => setWorkspaceTab('reviews'),
              forceActive: activeWorkspaceTab === 'reviews',
              match: 'exact',
            },
          ],
    [
      activeWorkspaceTab,
      completedJobsCount,
      favoriteRequestCount,
      isPersonalized,
      markNewOrdersSeen,
      myRequests.length,
      navRatingValue,
      navReviewsCount,
      newOrdersCount,
      sentCount,
      setWorkspaceTab,
      t,
    ],
  );

  const providerCompletedContracts = React.useMemo(
    () => myProviderContracts.filter((item) => item.status === 'completed'),
    [myProviderContracts],
  );
  const providerActiveContracts = React.useMemo(
    () =>
      myProviderContracts.filter(
        (item) => item.status === 'pending' || item.status === 'confirmed' || item.status === 'in_progress',
      ),
    [myProviderContracts],
  );
  const providerCompletedThisMonth = React.useMemo(
    () => countCompletedInMonth(providerCompletedContracts, 0),
    [providerCompletedContracts],
  );
  const providerCompletedLastMonth = React.useMemo(
    () => countCompletedInMonth(providerCompletedContracts, -1),
    [providerCompletedContracts],
  );
  const completedMoMDelta = React.useMemo(
    () => calcMoMDeltaPercent(providerCompletedThisMonth, providerCompletedLastMonth),
    [providerCompletedLastMonth, providerCompletedThisMonth],
  );
  const completedMoMLabel = React.useMemo(
    () => formatMoMDeltaLabel(completedMoMDelta, locale),
    [completedMoMDelta, locale],
  );
  const insightText = `${t(I18N_KEYS.requestsPage.navInsightClosedPrefix)} ${providerCompletedThisMonth} ${t(
    I18N_KEYS.requestsPage.navInsightClosedSuffix,
  )} ${completedMoMLabel}`;

  const clientCompletedContracts = React.useMemo(
    () => myClientContracts.filter((item) => item.status === 'completed'),
    [myClientContracts],
  );
  const clientActiveContracts = React.useMemo(
    () =>
      myClientContracts.filter(
        (item) => item.status === 'pending' || item.status === 'confirmed' || item.status === 'in_progress',
      ),
    [myClientContracts],
  );
  const myOpenRequests = React.useMemo(
    () =>
      myRequests.filter(
        (item) =>
          item.status === 'draft' ||
          item.status === 'published' ||
          item.status === 'paused' ||
          item.status === 'matched',
      ),
    [myRequests],
  );

  const acceptedDecidedDenominator = acceptedCount + declinedCount;
  const acceptanceRate = Math.round((acceptedCount / Math.max(acceptedDecidedDenominator, 1)) * 100);

  const avgResponseMinutes = React.useMemo(() => {
    const samples = myOffers
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
  }, [myOffers]);

  const [nowTs, setNowTs] = React.useState(0);
  React.useEffect(() => {
    setNowTs(Date.now());
  }, []);
  const recentOffers7d = React.useMemo(
    () => myOffers.filter((item) => nowTs - new Date(item.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length,
    [myOffers, nowTs],
  );

  const providerProfileCompleteness = React.useMemo(
    () => computeProfileCompleteness(myProviderProfile),
    [myProviderProfile],
  );
  const clientProfileCompleteness = React.useMemo(
    () => computeClientCompleteness(authMe),
    [authMe],
  );

  const providerChartPoints = React.useMemo(
    () =>
      buildLastSixMonthSeries(chartMonthLabel, (start, end) => ({
        bars: providerCompletedContracts.filter((item) => {
          if (!item.completedAt) return false;
          const ts = new Date(item.completedAt).getTime();
          return ts >= start && ts < end;
        }).length,
        line: providerCompletedContracts.reduce((sum, item) => {
          if (!item.completedAt || typeof item.priceAmount !== 'number') return sum;
          const ts = new Date(item.completedAt).getTime();
          if (ts < start || ts >= end) return sum;
          return sum + item.priceAmount;
        }, 0),
      })),
    [chartMonthLabel, providerCompletedContracts],
  );

  const clientChartPoints = React.useMemo(
    () =>
      buildLastSixMonthSeries(chartMonthLabel, (start, end) => ({
        bars: myRequests.filter((item) => {
          const ts = new Date(item.createdAt).getTime();
          return ts >= start && ts < end;
        }).length,
        line: clientCompletedContracts.filter((item) => {
          if (!item.completedAt) return false;
          const ts = new Date(item.completedAt).getTime();
          return ts >= start && ts < end;
        }).length,
      })),
    [chartMonthLabel, clientCompletedContracts, myRequests],
  );

  const providerHint = React.useMemo(
    () => getProviderHint(t, providerProfileCompleteness, recentOffers7d, acceptanceRate),
    [acceptanceRate, providerProfileCompleteness, recentOffers7d, t],
  );

  const clientHint = React.useMemo(
    () => getClientHint(t, myRequests.length, myOpenRequests.length),
    [myOpenRequests.length, myRequests.length, t],
  );

  const providerActivityCount =
    sentCount + acceptedCount + declinedCount + providerActiveContracts.length + providerCompletedContracts.length;
  const clientActivityCount =
    myRequests.length + myOpenRequests.length + clientActiveContracts.length + clientCompletedContracts.length;
  const hasAnyStatsActivity = providerActivityCount + clientActivityCount > 0;

  const providerPriorityScore = providerProfileCompleteness + providerActivityCount * 5;
  const clientPriorityScore = clientProfileCompleteness + clientActivityCount * 5;

  const providerStatsPayload: StatsPayload = {
    kpis: [],
    showKpis: false,
    hasData: true,
    chartTitle: t(I18N_KEYS.requestsPage.statsProviderChartTitle),
    chartDelta:
      providerCompletedContracts.length > 0
        ? `+${Math.round((providerCompletedContracts.length / Math.max(1, myProviderContracts.length)) * 100)}%`
        : undefined,
    chartPoints: providerChartPoints,
    secondary: {
      leftLabel: t(I18N_KEYS.requestsPage.statsLabelSent),
      leftValue: formatNumber.format(sentCount),
      centerLabel: t(I18N_KEYS.requestsPage.statsLabelAccepted),
      centerValue: formatNumber.format(acceptedCount),
      rightLabel: t(I18N_KEYS.requestsPage.statsLabelActive),
      rightValue: formatNumber.format(providerActiveContracts.length),
      progressLabel: t(I18N_KEYS.requestsPage.statsLabelAcceptanceRate),
      progressValue: acceptanceRate,
      responseLabel: t(I18N_KEYS.requestsPage.statsLabelResponseTime),
      responseValue: avgResponseMinutes
        ? `${avgResponseMinutes} ${t(I18N_KEYS.requestsPage.statsMinutesSuffix)}`
        : '—',
    },
    hint: providerHint,
    emptyTitle: t(I18N_KEYS.requestsPage.statsProviderEmptyTitle),
    emptyCtaLabel: t(I18N_KEYS.requestsPage.statsProviderEmptyCta),
    emptyCtaHref: '/orders?tab=new-orders',
  };

  const clientStatsPayload: StatsPayload = {
    kpis: [
      {
        key: 'requests-total',
        label: t(I18N_KEYS.requestsPage.statsKpiMyRequests),
        value: formatNumber.format(myRequests.length),
      },
      {
        key: 'requests-open',
        label: t(I18N_KEYS.requestsPage.statsKpiOpen),
        value: formatNumber.format(myOpenRequests.length),
      },
      {
        key: 'contracts-active',
        label: t(I18N_KEYS.requestsPage.statsKpiInProgress),
        value: formatNumber.format(clientActiveContracts.length),
      },
      {
        key: 'contracts-completed',
        label: t(I18N_KEYS.requestsPage.statsKpiCompleted),
        value: formatNumber.format(clientCompletedContracts.length),
      },
    ],
    chartTitle: t(I18N_KEYS.requestsPage.statsClientChartTitle),
    chartPoints: clientChartPoints,
    secondary: {
      leftLabel: t(I18N_KEYS.requestsPage.statsLabelTotal),
      leftValue: formatNumber.format(myRequests.length),
      centerLabel: t(I18N_KEYS.requestsPage.statsLabelOpen),
      centerValue: formatNumber.format(myOpenRequests.length),
      rightLabel: t(I18N_KEYS.requestsPage.statsKpiInProgress),
      rightValue: formatNumber.format(clientActiveContracts.length),
      progressLabel: t(I18N_KEYS.requestsPage.statsLabelCompletionRate),
      progressValue: Math.round((clientCompletedContracts.length / Math.max(1, myRequests.length)) * 100),
      responseLabel: t(I18N_KEYS.requestsPage.statsLabelCompletedJobs),
      responseValue: formatNumber.format(clientCompletedContracts.length),
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
