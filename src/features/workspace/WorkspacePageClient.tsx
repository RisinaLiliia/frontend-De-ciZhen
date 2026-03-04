'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { getWorkspacePublicOverview } from '@/lib/api/workspace';
import { trackUXEvent } from '@/lib/analytics';
import { useDevRenderMetric } from '@/lib/perf/useDevRenderMetric';
import {
  useWorkspaceData,
  useWorkspacePrivateState,
  useWorkspacePrivateViewModel,
  useWorkspacePublicState,
} from '@/features/workspace/requests';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import {
  type PublicWorkspaceSection,
  type WorkspaceTab,
  ProofReviewCard,
  useExploreSidebar,
  usePublicRequestsSeenTotal,
  useWorkspaceActions,
  useWorkspaceCollections,
  useWorkspaceContentData,
  useWorkspaceFavoriteToggles,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
  useWorkspacePresentation,
  useWorkspacePublicFilters,
  useWorkspacePublicRequestsState,
  useWorkspaceRouteState,
  useWorkspaceTabPersistence,
  WorkspaceContent,
  WorkspaceMobilePrimaryAction,
  WorkspacePageLayout,
  WorkspacePrivateIntro,
  WorkspacePublicIntro,
} from '@/features/workspace';
import type { Locale } from '@/lib/i18n/t';

const WORKSPACE_PATH = '/workspace';
const PUBLIC_REQUESTS_SEED_LIMIT = 10;
const PUBLIC_CITY_ACTIVITY_FETCH_LIMIT = 20;
const EMPTY_PROVIDER_IDS = new Set<string>();
const NOOP_PROVIDER_TOGGLE = () => {};

const EMPTY_EXPLORE: React.ComponentProps<typeof WorkspacePageLayout>['explore'] = {
  setExploreListDensity: () => {},
  sidebarNearbyLimit: 0,
  sidebarTopProvidersLimit: 0,
  sidebarProofCases: [],
  proofIndex: 0,
};

const EMPTY_ASIDE_BASE_PROPS: React.ComponentProps<typeof WorkspacePageLayout>['workspaceAsideBaseProps'] = {
  isLoading: false,
  isError: false,
  errorLabel: '',
  title: '',
  subtitle: '',
  ctaLabel: '',
  providers: [],
  favoriteProviderIds: EMPTY_PROVIDER_IDS,
};

type WorkspacePageClientProps = {
  activePublicSection?: PublicWorkspaceSection | null;
  activeWorkspaceTab?: WorkspaceTab | null;
};

type RouteState = ReturnType<typeof useWorkspaceRouteState>;
type AuthSnapshot = ReturnType<typeof useAuthSnapshot>;
type Translator = ReturnType<typeof useT>;

type BranchProps = {
  t: Translator;
  locale: Locale;
  auth: AuthSnapshot;
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isPersonalized: boolean;
  routeState: RouteState;
};

function WorkspacePublicBranch({
  t,
  locale,
  auth,
  isAuthed,
  isWorkspaceAuthed,
  isPersonalized,
  routeState,
}: BranchProps) {
  const { activePublicSection, activeWorkspaceTab, guestLoginHref, onGuestLockedAction } = routeState;

  const {
    data: platformSnapshot,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery({
    queryKey: workspaceQK.workspacePublicOverview({
      cityId: undefined,
      categoryKey: undefined,
      subcategoryKey: undefined,
      sort: 'date_desc',
      page: 1,
      limit: PUBLIC_REQUESTS_SEED_LIMIT,
      activityRange: '30d',
      cityActivityLimit: PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
    }),
    queryFn: () =>
      getWorkspacePublicOverview({
        sort: 'date_desc',
        page: 1,
        limit: PUBLIC_REQUESTS_SEED_LIMIT,
        activityRange: '30d',
        cityActivityLimit: PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const platformRequestsTotal = platformSnapshot?.summary.totalPublishedRequests ?? 0;
  const platformProvidersTotal = platformSnapshot?.summary.totalActiveProviders ?? 0;
  const cityActivity = platformSnapshot?.cityActivity;
  const platformSummary = platformSnapshot?.summary;
  const { localeTag, formatNumber } = useWorkspaceFormatters(locale);
  const explore = useExploreSidebar(t);
  const exploreWithSeed = React.useMemo(
    () => ({
      ...explore,
      initialPublicRequests: platformSnapshot?.requests,
      preferInitialPublicRequests: true,
      initialPublicRequestsLoading: isSummaryLoading,
      initialPublicRequestsError: isSummaryError,
    }),
    [explore, isSummaryError, isSummaryLoading, platformSnapshot?.requests],
  );

  const { setWorkspaceTab } = useWorkspaceNavigation({
    activeWorkspaceTab,
    workspacePath: WORKSPACE_PATH,
  });

  const { markPublicRequestsSeen } = usePublicRequestsSeenTotal({
    isAuthed,
    userId: auth.user?.id,
    platformRequestsTotal,
    autoMarkSeen:
      isWorkspaceAuthed &&
      activePublicSection === 'requests' &&
      !isSummaryLoading &&
      !isSummaryError,
  });

  const { navTitle, activityProgress, personalNavItems, insightText } = useWorkspacePublicState({
    t,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName: auth.user?.name,
    publicRequestsCount: platformRequestsTotal,
    publicProvidersCount: platformProvidersTotal,
    publicStatsCount: platformRequestsTotal,
    setWorkspaceTab,
    markPublicRequestsSeen,
    guestLoginHref,
    onGuestLockedAction,
    formatNumber,
  });

  const workspaceIntroNode = React.useMemo(
    () => (
      <WorkspacePublicIntro
        t={t}
        locale={locale}
        navTitle={navTitle}
        personalNavItems={personalNavItems}
        insightText={isPersonalized ? insightText : ''}
        activityProgress={activityProgress}
        cityActivity={cityActivity}
        summary={platformSummary}
        quickActionHref="/request/create"
      />
    ),
    [
      activityProgress,
      insightText,
      isPersonalized,
      locale,
      navTitle,
      personalNavItems,
      cityActivity,
      platformSummary,
      t,
    ],
  );

  useDevRenderMetric('workspace.public', () => ({
    isAuthed,
    activeWorkspaceTab,
    activePublicSection,
    platformRequestsTotal,
    localeTag,
  }));

  return (
    <WorkspacePageLayout
      isWorkspacePublicSection={true}
      isWorkspaceAuthed={isWorkspaceAuthed}
      activePublicSection={activePublicSection}
      t={t}
      locale={locale}
      intro={workspaceIntroNode}
      explore={exploreWithSeed}
      privateMain={null}
      publicMain={null}
      workspaceAsideBaseProps={EMPTY_ASIDE_BASE_PROPS}
      pendingFavoriteProviderIds={EMPTY_PROVIDER_IDS}
      onToggleProviderFavorite={NOOP_PROVIDER_TOGGLE}
    />
  );
}

function WorkspacePrivateBranch({
  t,
  locale,
  auth,
  isAuthed,
  isWorkspaceAuthed,
  isPersonalized,
  routeState,
}: BranchProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const {
    activePublicSection,
    activeWorkspaceTab,
    activeStatusFilter,
    activeFavoritesView,
    activeReviewsView,
    nextPath,
    guestLoginHref,
    onGuestLockedAction,
  } = routeState;

  const {
    cities,
    categories,
    services,
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    setPage,
    hasActivePublicFilter,
  } = useWorkspacePublicFilters({
    t,
    locale,
    shouldLoadCatalog: true,
  });

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });

  const {
    publicRequests,
    isLoading,
    isError,
    allRequestsSummary,
    myOffers,
    isMyOffersLoading,
    myOfferRequestsById,
    favoriteRequests,
    isFavoriteRequestsLoading,
    favoriteProviders,
    isFavoriteProvidersLoading,
    myReviews,
    isMyReviewsLoading,
    myRequests,
    isMyRequestsLoading,
    myProviderContracts,
    isProviderContractsLoading,
    myClientContracts,
    isClientContractsLoading,
    providers,
    workspacePrivateOverview,
    isProvidersLoading,
    isProvidersError,
  } = useWorkspaceData({
    filter,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    isWorkspacePublicSection: false,
    shouldLoadPrivateData: true,
    activeWorkspaceTab,
    activeReviewsView,
  });

  const { requests, platformRequestsTotal } = useWorkspacePublicRequestsState({
    publicRequests,
    allRequestsSummary,
    limit,
    page,
    setPage,
    isWorkspacePublicSection: false,
    activePublicSection,
    isLoading,
    isError,
    hasActivePublicFilter,
    cityId,
    categoryKey,
    subcategoryKey,
    sortBy,
  });

  const {
    favoriteRequestIds,
    requestById,
    providerById,
    favoriteProviderLookup,
    favoriteProviderIds,
    offersByRequest,
    allMyContracts,
    favoriteProviderCityLabelById,
    favoriteProviderRoleLabelById,
  } = useWorkspaceCollections({
    requests,
    favoriteRequests,
    providers,
    favoriteProviders,
    myOffers,
    myProviderContracts,
    myClientContracts,
    cityById,
    serviceByKey,
    locale,
  });

  const {
    pendingFavoriteRequestIds,
    pendingFavoriteProviderIds,
    onToggleRequestFavorite,
    onToggleProviderFavorite,
  } = useWorkspaceFavoriteToggles({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteRequestIds,
    requestById,
    favoriteProviderLookup,
    providerById,
  });

  const {
    pendingOfferRequestId,
    ownerRequestActions,
    onOpenOfferSheet,
    onWithdrawOffer,
    onOpenChatThread,
  } = useWorkspaceActions({
    isAuthed,
    myOffers,
    t,
    qc,
    router,
  });

  const { localeTag, formatNumber, formatDate, formatPrice, chartMonthLabel } =
    useWorkspaceFormatters(locale);

  const { markPublicRequestsSeen } = usePublicRequestsSeenTotal({
    isAuthed,
    userId: auth.user?.id,
    platformRequestsTotal,
    autoMarkSeen: false,
  });

  useWorkspaceTabPersistence({
    isWorkspaceAuthed,
    isWorkspacePublicSection: false,
    activeWorkspaceTab,
  });

  const {
    setWorkspaceTab,
    setStatusFilter,
    setFavoritesView,
    setReviewsView,
  } = useWorkspaceNavigation({
    activeWorkspaceTab,
    workspacePath: WORKSPACE_PATH,
  });

  const {
    viewModelPatch,
    primaryAction,
  } = useWorkspaceContentData({
    derivedArgs: {
      t,
      activeStatusFilter,
      activeWorkspaceTab,
      activeFavoritesView,
      activeReviewsView,
      myRequests,
      myOffers,
      myOfferRequestsById,
      allMyContracts,
      favoriteRequests,
      favoriteProviders,
      isFavoriteRequestsLoading,
      isFavoriteProvidersLoading,
      myReviews,
      localeTag,
    },
    contractArgs: {
      isWorkspaceAuthed,
      locale,
    },
    cardsArgs: {
      t,
      favoriteProviders,
      favoriteProviderLookup,
      pendingFavoriteProviderIds,
      onToggleProviderFavorite,
      favoriteProviderRoleLabelById,
      favoriteProviderCityLabelById,
      ProofReviewCardComponent: ProofReviewCard,
    },
  });

  const {
    topProviders,
    navTitle,
    activityProgress,
    personalNavItems,
    insightText,
    providerStatsPayload,
    clientStatsPayload,
    statsOrder,
  } = useWorkspacePrivateState({
    t,
    locale,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName: auth.user?.name,
    myOffers,
    providers,
    publicRequestsCount: platformRequestsTotal,
    publicProvidersCount: allRequestsSummary?.totalActiveProviders ?? providers.length,
    publicStatsCount: platformRequestsTotal,
    workspacePrivateOverview,
    setWorkspaceTab,
    markPublicRequestsSeen,
    guestLoginHref,
    onGuestLockedAction,
    formatNumber,
    chartMonthLabel,
  });

  const { workspaceIntroNode, workspaceAsideBaseProps } = useWorkspacePresentation({
    t,
    WorkspacePrivateIntroComponent: WorkspacePrivateIntro,
    navTitle,
    personalNavItems,
    insightText,
    activityProgress,
    statsOrder,
    providerStatsPayload,
    clientStatsPayload,
    createRequestHref: '/request/create',
    isProvidersLoading,
    isProvidersError,
    topProviders,
    favoriteProviderIds,
  });

  const { workspaceContentProps } = useWorkspacePrivateViewModel({
    t,
    locale,
    activeWorkspaceTab,
    ...viewModelPatch,
    onPrimaryActionClick: () => trackUXEvent('workspace_primary_cta_click', { tab: activeWorkspaceTab }),
    activeStatusFilter,
    setStatusFilter,
    isPersonalized,
    offersByRequest,
    favoriteRequestIds,
    onToggleRequestFavorite,
    onOpenOfferSheet,
    onWithdrawOffer,
    onOpenChatThread,
    pendingOfferRequestId,
    pendingFavoriteRequestIds,
    serviceByKey,
    categoryByKey,
    cityById,
    formatDate,
    formatPrice,
    isMyRequestsLoading,
    ownerRequestActions,
    isMyOffersLoading,
    isProviderContractsLoading,
    isClientContractsLoading,
    setFavoritesView,
    favoriteRequests,
    isFavoriteRequestsLoading,
    isMyReviewsLoading,
    myReviews,
    activeReviewsView,
    setReviewsView,
  });

  const privateMain = <WorkspaceContent {...workspaceContentProps} />;

  useDevRenderMetric('workspace.private', () => ({
    isAuthed,
    activeWorkspaceTab,
    isLoading,
    requestsCount: requests.length,
  }));

  return (
    <>
      <WorkspacePageLayout
        isWorkspacePublicSection={false}
        isWorkspaceAuthed={isWorkspaceAuthed}
        activePublicSection={activePublicSection}
        t={t}
        locale={locale}
        intro={workspaceIntroNode}
        explore={EMPTY_EXPLORE}
        privateMain={privateMain}
        publicMain={null}
        workspaceAsideBaseProps={workspaceAsideBaseProps}
        pendingFavoriteProviderIds={pendingFavoriteProviderIds}
        onToggleProviderFavorite={onToggleProviderFavorite}
      />
      <WorkspaceMobilePrimaryAction
        isWorkspaceAuthed={isWorkspaceAuthed}
        activeWorkspaceTab={activeWorkspaceTab}
        href={primaryAction.href}
        label={primaryAction.label}
      />
    </>
  );
}

function WorkspacePageView({
  activePublicSection: forcedPublicSection,
  activeWorkspaceTab: forcedWorkspaceTab,
}: WorkspacePageClientProps) {
  const searchParams = useSearchParams();
  const t = useT();
  const { locale } = useI18n();
  const auth = useAuthSnapshot();
  const isAuthed = auth.status === 'authenticated';
  const isWorkspaceAuthed = isAuthed;
  const isPersonalized = isAuthed;

  const routeState = useWorkspaceRouteState({
    forcedPublicSection,
    forcedWorkspaceTab,
    searchParams,
    workspacePath: WORKSPACE_PATH,
    t,
  });

  const sharedProps: BranchProps = {
    t,
    locale,
    auth,
    isAuthed,
    isWorkspaceAuthed,
    isPersonalized,
    routeState,
  };

  if (routeState.isWorkspacePublicSection) {
    return <WorkspacePublicBranch {...sharedProps} />;
  }

  return <WorkspacePrivateBranch {...sharedProps} />;
}

export default function WorkspacePageClient(props: WorkspacePageClientProps) {
  return (
    <React.Suspense fallback={null}>
      <WorkspacePageView {...props} />
    </React.Suspense>
  );
}
