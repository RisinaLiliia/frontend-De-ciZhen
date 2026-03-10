'use client';

import { IconBriefcase, IconCheck, IconHeart, IconSend, IconStar, IconUser } from '@/components/ui/icons/icons';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';

type Translator = (key: I18nKey) => string;

export type StatsPayload = {
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

type BuildPublicNavItemsArgs = {
  t: Translator;
  formatNumber: Intl.NumberFormat;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  activePublicSection: PublicWorkspaceSection | null;
  markPublicRequestsSeen: () => void;
};

type BuildWorkspaceNavHeaderArgs = {
  t: Translator;
  userName?: string | null;
};

type BuildWorkspacePersonalNavItemsArgs = {
  t: Translator;
  formatNumber: Intl.NumberFormat;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection: PublicWorkspaceSection | null;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  myRequestsTotal: number;
  sentCount: number;
  completedJobsCount: number;
  favoriteRequestCount: number;
  navRatingValue: string;
  navReviewsCount: number;
  markPublicRequestsSeen: () => void;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
  reviewsHref: string;
  reviewsMatch?: 'exact' | 'prefix';
  reviewsForceActive: boolean;
  includeCompletedJobsInSecondary?: boolean;
};

function normalizeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function isPublicSectionActive(value: PublicWorkspaceSection | null) {
  return value === 'requests' || value === 'providers' || value === 'stats' || value === 'reviews' || value === 'profile';
}

export function buildPublicNavItems({
  t,
  formatNumber,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  activePublicSection,
  markPublicRequestsSeen,
}: BuildPublicNavItemsArgs): PersonalNavItem[] {
  return [
    {
      key: 'public-requests',
      href: '/workspace?section=requests',
      label: t(I18N_KEYS.homePublic.exploreAllOrders),
      icon: <IconBriefcase />,
      value: formatNumber.format(publicRequestsCount),
      badgeValue: publicRequestsCount,
      hint: t(I18N_KEYS.requestsPage.resultsLabel),
      onClick: markPublicRequestsSeen,
      forceActive: activePublicSection === 'requests',
    },
    {
      key: 'public-providers',
      href: '/workspace?section=providers',
      label: t(I18N_KEYS.homePublic.exploreAllProviders),
      icon: <IconUser />,
      value: formatNumber.format(publicProvidersCount),
      badgeValue: publicProvidersCount,
      hint: t(I18N_KEYS.requestsPage.heroProviderPrimaryCta),
      forceActive: activePublicSection === 'providers',
    },
    {
      key: 'public-stats',
      href: '/workspace?section=stats',
      label: t(I18N_KEYS.homePublic.exploreStats),
      icon: <IconCheck />,
      value: formatNumber.format(publicStatsCount),
      badgeValue: publicStatsCount,
      hint: t(I18N_KEYS.homePublic.activitySubtitle),
      forceActive: activePublicSection === 'stats',
    },
  ];
}

export function buildWorkspaceNavHeader({ t, userName }: BuildWorkspaceNavHeaderArgs) {
  return {
    navTitle: `${t(I18N_KEYS.requestsPage.navGreeting)}, ${(userName ?? '').trim() || t(I18N_KEYS.requestsPage.navUserFallback)}!`,
    navSubtitle: t(I18N_KEYS.requestsPage.navSubtitle),
  };
}

export function buildWorkspacePersonalNavItems({
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
  reviewsHref,
  reviewsMatch = 'prefix',
  reviewsForceActive,
  includeCompletedJobsInSecondary = true,
}: BuildWorkspacePersonalNavItemsArgs): PersonalNavItem[] {
  const hasActivePublicSection = isPublicSectionActive(activePublicSection);
  const publicPrimaryItems = buildPublicNavItems({
    t,
    formatNumber,
    publicRequestsCount,
    publicProvidersCount,
    publicStatsCount,
    activePublicSection,
    markPublicRequestsSeen,
  }).map((item) => ({ ...item, tier: 'primary' as const }));

  const reviewsItem: PersonalNavItem = {
    key: 'reviews',
    href: reviewsHref,
    label: t(I18N_KEYS.requestsPage.navReviews),
    icon: <IconStar />,
    badgeValue: normalizeCount(navReviewsCount),
    rating: {
      value: navRatingValue,
      reviewsCount: normalizeCount(navReviewsCount),
      reviewsLabel: t(I18N_KEYS.homePublic.reviews),
    },
    forceActive: reviewsForceActive,
    match: reviewsMatch,
    tier: 'primary',
  };

  if (isPersonalized) {
    const secondaryItems: PersonalNavItem[] = [
      {
        key: 'my-requests',
        href: '/workspace?tab=my-requests',
        label: t(I18N_KEYS.requestsPage.navMyOrders),
        icon: <IconBriefcase />,
        badgeValue: normalizeCount(myRequestsTotal),
        value: normalizeCount(myRequestsTotal),
        hint: t(I18N_KEYS.requestsPage.summaryAccepted),
        onClick: () => setWorkspaceTab('my-requests'),
        forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-requests',
        match: 'exact',
        tier: 'secondary',
      },
      {
        key: 'my-offers',
        href: '/workspace?tab=my-offers',
        label: t(I18N_KEYS.requestsPage.navMyOffers),
        icon: <IconSend />,
        badgeValue: normalizeCount(sentCount),
        value: normalizeCount(sentCount),
        hint: t(I18N_KEYS.requestsPage.summarySent),
        onClick: () => setWorkspaceTab('my-offers'),
        forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-offers',
        match: 'exact',
        tier: 'secondary',
      },
      ...(includeCompletedJobsInSecondary
        ? [{
            key: 'completed-jobs',
            href: '/workspace?tab=completed-jobs',
            label: t(I18N_KEYS.requestsPage.navCompletedJobs),
            icon: <IconCheck />,
            badgeValue: normalizeCount(completedJobsCount),
            value: normalizeCount(completedJobsCount),
            hint: t(I18N_KEYS.provider.jobs),
            onClick: () => setWorkspaceTab('completed-jobs'),
            forceActive: !hasActivePublicSection && activeWorkspaceTab === 'completed-jobs',
            match: 'exact' as const,
            tier: 'secondary' as const,
          }]
        : []),
      {
        key: 'my-favorites',
        href: '/workspace?tab=favorites',
        label: t(I18N_KEYS.requestsPage.navFavorites),
        icon: <IconHeart />,
        badgeValue: normalizeCount(favoriteRequestCount),
        value: normalizeCount(favoriteRequestCount),
        hint: t(I18N_KEYS.requestDetails.ctaSave),
        onClick: () => setWorkspaceTab('favorites'),
        forceActive: !hasActivePublicSection && activeWorkspaceTab === 'favorites',
        match: 'exact',
        tier: 'secondary',
      },
    ];

    return [...publicPrimaryItems, reviewsItem, ...secondaryItems];
  }

  return [
    ...publicPrimaryItems,
    reviewsItem,
    {
      key: 'guest-profile',
      href: '/workspace?section=profile',
      label: t(I18N_KEYS.auth.profileLabel),
      icon: <IconUser />,
      forceActive: activePublicSection === 'profile',
      match: 'prefix',
      tier: 'secondary',
    },
    {
      key: 'my-requests',
      href: '/workspace?tab=my-requests',
      label: t(I18N_KEYS.requestsPage.navGuestOrders),
      icon: <IconBriefcase />,
      badgeValue: 0,
      hint: t(I18N_KEYS.requestsPage.summaryAccepted),
      disabled: true,
      lockedHref: guestLoginHref,
      onClick: onGuestLockedAction,
      forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-requests',
      match: 'exact',
      tier: 'secondary',
    },
    {
      key: 'my-offers',
      href: '/workspace?tab=my-offers',
      label: t(I18N_KEYS.requestsPage.navGuestOffers),
      icon: <IconSend />,
      hint: t(I18N_KEYS.requestsPage.summarySent),
      disabled: true,
      lockedHref: guestLoginHref,
      onClick: onGuestLockedAction,
      forceActive: !hasActivePublicSection && activeWorkspaceTab === 'my-offers',
      match: 'exact',
      tier: 'secondary',
    },
    {
      key: 'my-favorites',
      href: '/workspace?tab=favorites',
      label: t(I18N_KEYS.requestsPage.navFavorites),
      icon: <IconHeart />,
      hint: t(I18N_KEYS.requestDetails.ctaSave),
      onClick: () => setWorkspaceTab('favorites'),
      forceActive: !hasActivePublicSection && activeWorkspaceTab === 'favorites',
      match: 'exact',
      tier: 'secondary',
    },
  ];
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function mapMonthlySeries(
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
