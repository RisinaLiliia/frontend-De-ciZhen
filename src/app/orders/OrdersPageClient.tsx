'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { HeroSection } from '@/components/ui/HeroSection';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import {
  deleteMyRequest,
} from '@/lib/api/requests';
import { deleteOffer } from '@/lib/api/offers';
import type { OfferDto } from '@/lib/api/dto/offers';
import {
  buildProviderFavoriteLookup,
  isProviderInFavoriteLookup,
} from '@/lib/api/favorites';
import { createThread } from '@/lib/api/chat';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { HOME_PROOF_CASES } from '@/data/home';
import type { ProofCase } from '@/types/home';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
import { trackUXEvent } from '@/lib/analytics';
import {
  ALL_OPTION_KEY,
  WORKSPACE_PUBLIC_ORDERS_SEEN_TOTAL_KEY_PREFIX,
  SORT_OPTIONS,
} from '@/features/requests/page/public';
import {
  ORDERS_TAB_STORAGE_KEY,
  resolveFavoritesView,
  resolveReviewsView,
  resolveStatusFilter,
  resolveWorkspaceTab,
  type FavoritesView,
  type ReviewsView,
  type WorkspaceStatusFilter,
  type WorkspaceTab,
} from '@/features/requests/page/workspace';
import { useRequestsPageViewModel } from '@/features/requests/page/useRequestsPageViewModel';
import { useRequestsPageData } from '@/features/requests/page/useRequestsPageData';
import { useContractRequestsData } from '@/features/requests/page/useContractRequestsData';
import { useRequestsWorkspaceState } from '@/features/requests/page/useRequestsWorkspaceState';
import { useRequestsWorkspaceDerived } from '@/features/requests/page/useRequestsWorkspaceDerived';
import { WorkspaceFrame, WorkspaceTopProvidersAside } from '@/features/requests/page/WorkspaceFrame';
import { useProviderFavoriteToggle, useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';

const DEFAULT_GUEST_WORKSPACE_URL = '/workspace?section=orders';
type PublicWorkspaceSection = 'orders' | 'providers' | 'stats';

function resolvePublicSection(value: string | null): PublicWorkspaceSection | null {
  if (value === 'orders' || value === 'providers' || value === 'stats') return value;
  return null;
}

const HomeOrdersExplorePanel = dynamic(
  () => import('@/components/home/HomeOrdersExplorePanel').then((mod) => mod.HomeOrdersExplorePanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);
const HomePlatformActivityPanel = dynamic(
  () => import('@/components/home/HomePlatformActivityPanel').then((mod) => mod.HomePlatformActivityPanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);
const HomeNearbyPanel = dynamic(
  () => import('@/components/home/HomeNearbyPanel').then((mod) => mod.HomeNearbyPanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);
const HomeTopProvidersPanel = dynamic(
  () => import('@/components/home/HomeTopProvidersPanel').then((mod) => mod.HomeTopProvidersPanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);
const HomeProofPanel = dynamic(
  () => import('@/components/home/HomeProofPanel').then((mod) => mod.HomeProofPanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);
const HomeTrustLivePanel = dynamic(
  () => import('@/components/home/HomeTrustLivePanel').then((mod) => mod.HomeTrustLivePanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);
const PublicContent = dynamic(
  () => import('@/features/requests/page/PublicContent').then((mod) => mod.PublicContent),
  {
    loading: () => (
      <section className="panel requests-panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);
const WorkspaceContent = dynamic(
  () => import('@/features/requests/page/WorkspaceContent').then((mod) => mod.WorkspaceContent),
  {
    loading: () => (
      <section className="panel requests-panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);
const WorkspacePrivateIntro = dynamic(
  () => import('@/features/requests/page/WorkspacePrivateIntro').then((mod) => mod.WorkspacePrivateIntro),
  {
    loading: () => (
      <section className="home-intro-shell">
        <div className="panel">
          <div className="skeleton h-48 w-full" />
        </div>
      </section>
    ),
  },
);
const ProofReviewCard = dynamic(
  () => import('@/components/reviews/ProofReviewCard').then((mod) => mod.ProofReviewCard),
);

function RequestsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const t = useT();
  const { locale } = useI18n();
  const auth = useAuthSnapshot();
  const authStatus = auth.status;
  const isAuthed = authStatus === 'authenticated';
  const isWorkspaceRoute = pathname === '/workspace';
  const isWorkspaceAuthed = isWorkspaceRoute && isAuthed;
  const workspaceSection = searchParams.get('section');
  const activePublicSection = resolvePublicSection(workspaceSection);
  const isWorkspacePublicSection = activePublicSection !== null;
  const isWorkspaceGuestPreview =
    isWorkspaceRoute &&
    authStatus === 'unauthenticated' &&
    (workspaceSection === 'orders' || workspaceSection === 'providers' || workspaceSection === 'stats');
  const isPersonalized = isAuthed;
  const activeWorkspaceTab = React.useMemo(
    () => (isWorkspaceRoute ? resolveWorkspaceTab(searchParams.get('tab')) : 'my-requests'),
    [isWorkspaceRoute, searchParams],
  );
  const activeStatusFilter = React.useMemo(
    () => (isWorkspaceRoute ? resolveStatusFilter(searchParams.get('status')) : 'all'),
    [isWorkspaceRoute, searchParams],
  );
  const activeFavoritesView = React.useMemo(
    () => resolveFavoritesView(searchParams.get('fav')),
    [searchParams],
  );
  const activeReviewsView = React.useMemo(
    () => resolveReviewsView(searchParams.get('reviewRole')),
    [searchParams],
  );
  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, searchParams]);

  React.useEffect(() => {
    if (!isWorkspaceRoute || authStatus !== 'unauthenticated') return;
    if (workspaceSection === 'orders' || workspaceSection === 'providers' || workspaceSection === 'stats') return;
    router.replace(DEFAULT_GUEST_WORKSPACE_URL);
  }, [authStatus, isWorkspaceRoute, router, workspaceSection]);

  const { data: cities = [] } = useCities('DE');
  const { data: categories = [], isLoading: isCategoriesLoading } = useServiceCategories();
  const { data: services = [], isLoading: isServicesLoading } = useServices();

  const sortOptions = React.useMemo(
    () =>
      SORT_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t],
  );

  const {
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    filteredServices,
    onCategoryChange,
    onSubcategoryChange,
    onCityChange,
    onSortChange,
    onReset,
    setPage,
    isPending: isFiltersPending,
  } = useRequestsFilters({
    services,
    defaultSort: 'date_desc',
  });

  const onCategoryChangeTracked = React.useCallback((value: string) => {
    onCategoryChange(value);
    trackUXEvent('workspace_filter_change', { filter: 'category', value });
  }, [onCategoryChange]);

  const onSubcategoryChangeTracked = React.useCallback((value: string) => {
    onSubcategoryChange(value);
    trackUXEvent('workspace_filter_change', { filter: 'service', value });
  }, [onSubcategoryChange]);

  const onCityChangeTracked = React.useCallback((value: string) => {
    onCityChange(value);
    trackUXEvent('workspace_filter_change', { filter: 'city', value });
  }, [onCityChange]);

  const onSortChangeTracked = React.useCallback((value: string) => {
    onSortChange(value);
    trackUXEvent('workspace_filter_change', { filter: 'sort', value });
  }, [onSortChange]);

  const onResetTracked = React.useCallback(() => {
    onReset();
    trackUXEvent('workspace_filter_reset');
  }, [onReset]);

  const categoryOptions = React.useMemo(
    () => [
      { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.categoryAll) },
      ...categories
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          value: category.key,
          label: pickI18n(category.i18n, locale),
        })),
    ],
    [categories, locale, t],
  );

  const serviceOptions = React.useMemo(
    () => [
      { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.serviceAll) },
      ...filteredServices
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((service) => ({
          value: service.key,
          label: pickI18n(service.i18n, locale),
        })),
    ],
    [filteredServices, locale, t],
  );

  const cityOptions = React.useMemo(
    () => [
      { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.cityAll) },
      ...cities
        .slice()
        .sort((a, b) => pickI18n(a.i18n, locale).localeCompare(pickI18n(b.i18n, locale), locale))
        .map((city) => ({
          value: city.id,
          label: pickI18n(city.i18n, locale),
        })),
    ],
    [cities, locale, t],
  );
  const appliedFilterChips = React.useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (cityId !== ALL_OPTION_KEY) {
      const cityLabel = cityOptions.find((option) => option.value === cityId)?.label ?? cityId;
      chips.push({
        key: 'city',
        label: cityLabel,
        onRemove: () => onCityChangeTracked(ALL_OPTION_KEY),
      });
    }
    if (categoryKey !== ALL_OPTION_KEY) {
      const categoryLabel = categoryOptions.find((option) => option.value === categoryKey)?.label ?? categoryKey;
      chips.push({
        key: 'category',
        label: categoryLabel,
        onRemove: () => onCategoryChangeTracked(ALL_OPTION_KEY),
      });
    }
    if (subcategoryKey !== ALL_OPTION_KEY) {
      const serviceLabel = serviceOptions.find((option) => option.value === subcategoryKey)?.label ?? subcategoryKey;
      chips.push({
        key: 'service',
        label: serviceLabel,
        onRemove: () => onSubcategoryChangeTracked(ALL_OPTION_KEY),
      });
    }
    if (sortBy !== 'date_desc') {
      const sortLabel = sortOptions.find((option) => option.value === sortBy)?.label ?? sortBy;
      chips.push({
        key: 'sort',
        label: sortLabel,
        onRemove: () => onSortChangeTracked('date_desc'),
      });
    }
    return chips;
  }, [
    categoryKey,
    categoryOptions,
    cityId,
    cityOptions,
    onCategoryChangeTracked,
    onCityChangeTracked,
    onSortChangeTracked,
    onSubcategoryChangeTracked,
    serviceOptions,
    sortBy,
    sortOptions,
    subcategoryKey,
  ]);
  const hasActivePublicFilter = appliedFilterChips.length > 0;

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
    myProviderProfile,
    providers,
    isProvidersLoading,
    isProvidersError,
  } = useRequestsPageData({
    filter,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    activeWorkspaceTab,
    activeReviewsView,
    cityId,
    subcategoryKey,
  });

  const requests = React.useMemo(() => publicRequests?.items ?? [], [publicRequests]);
  const totalResults = publicRequests?.total ?? requests.length;
  const platformOrdersTotal = allRequestsSummary?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / limit));

  React.useEffect(() => {
    const isPublicOrdersContext =
      isWorkspaceGuestPreview || (isWorkspaceAuthed && activePublicSection === 'orders');
    if (!isPublicOrdersContext) return;
    if (isLoading || isError || requests.length > 0) return;
    trackUXEvent('workspace_empty_result', {
      tab: 'public-orders',
      hasFilters: hasActivePublicFilter,
      cityId: cityId === ALL_OPTION_KEY ? null : cityId,
      categoryKey: categoryKey === ALL_OPTION_KEY ? null : categoryKey,
      subcategoryKey: subcategoryKey === ALL_OPTION_KEY ? null : subcategoryKey,
      sortBy,
    });
  }, [
    activePublicSection,
    categoryKey,
    cityId,
    hasActivePublicFilter,
    isError,
    isLoading,
    isWorkspaceAuthed,
    isWorkspaceGuestPreview,
    requests.length,
    sortBy,
    subcategoryKey,
  ]);

  const favoriteRequestIds = React.useMemo(
    () => new Set(favoriteRequests.map((item) => item.id)),
    [favoriteRequests],
  );
  const requestById = React.useMemo(() => {
    const map = new Map<string, (typeof requests)[number]>();
    for (const request of requests) map.set(request.id, request);
    for (const request of favoriteRequests) map.set(request.id, request);
    return map;
  }, [favoriteRequests, requests]);
  const providerById = React.useMemo(() => {
    const map = new Map<string, (typeof providers)[number]>();
    for (const provider of providers) map.set(provider.id, provider);
    for (const provider of favoriteProviders) map.set(provider.id, provider);
    return map;
  }, [favoriteProviders, providers]);
  const favoriteProviderLookup = React.useMemo(
    () => buildProviderFavoriteLookup(favoriteProviders),
    [favoriteProviders],
  );
  const favoriteProviderIds = React.useMemo(
    () =>
      new Set(
        providers
          .filter((provider) => isProviderInFavoriteLookup(favoriteProviderLookup, provider))
          .map((provider) => provider.id),
      ),
    [favoriteProviderLookup, providers],
  );
  const offersByRequest = React.useMemo(() => {
    const map = new Map<string, (typeof myOffers)[number]>();
    myOffers.forEach((offer) => {
      if (!map.has(offer.requestId) || offer.updatedAt > (map.get(offer.requestId)?.updatedAt ?? '')) {
        map.set(offer.requestId, offer);
      }
    });
    return map;
  }, [myOffers]);

  const [pendingOfferRequestId, setPendingOfferRequestId] = React.useState<string | null>(null);
  const [pendingDeleteRequestId, setPendingDeleteRequestId] = React.useState<string | null>(null);
  const {
    pendingFavoriteRequestIds,
    toggleRequestFavorite,
  } = useRequestFavoriteToggle({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteRequestIds,
    requestById,
  });
  const {
    pendingFavoriteProviderIds,
    toggleProviderFavorite,
  } = useProviderFavoriteToggle({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteProviderLookup,
    providerById,
  });
  const onToggleRequestFavorite = React.useCallback((requestId: string) => {
    void toggleRequestFavorite(requestId);
  }, [toggleRequestFavorite]);
  const onToggleProviderFavorite = React.useCallback((providerId: string) => {
    void toggleProviderFavorite(providerId);
  }, [toggleProviderFavorite]);

  const onOpenOfferSheet = React.useCallback(
    (requestId: string) => {
      router.push(`/requests/${requestId}?offer=1`);
    },
    [router],
  );

  const onWithdrawOffer = React.useCallback(
    async (offerId: string) => {
      const offer = myOffers.find((item) => item.id === offerId);
      if (!offer) return;
      setPendingOfferRequestId(offer.requestId);
      try {
        await deleteOffer(offerId);
        toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
        await qc.invalidateQueries({ queryKey: ['offers-my'] });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      } finally {
        setPendingOfferRequestId(null);
      }
    },
    [myOffers, qc, t],
  );

  const onOpenChatThread = React.useCallback(
    async (offer: OfferDto) => {
      try {
        const providerUserId = offer.providerUserId?.trim();
        if (!providerUserId || !offer.requestId) {
          router.push('/chat');
          return;
        }
        const thread = await createThread({
          requestId: offer.requestId,
          providerUserId,
          offerId: offer.id,
        });
        await qc.invalidateQueries({ queryKey: ['chat-inbox'] });
        router.push(`/chat/${thread.id}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
        router.push('/chat');
      }
    },
    [qc, router, t],
  );

  const onDeleteMyRequest = React.useCallback(
    async (requestId: string) => {
      if (pendingDeleteRequestId === requestId) return;
      setPendingDeleteRequestId(requestId);
      try {
        await deleteMyRequest(requestId);
        toast.success(t(I18N_KEYS.client.requestDeleted));
        await qc.invalidateQueries({ queryKey: ['requests-my'] });
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
      } finally {
        setPendingDeleteRequestId(null);
      }
    },
    [pendingDeleteRequestId, qc, t],
  );
  const onDeleteMyRequestVoid = React.useCallback((requestId: string) => {
    void onDeleteMyRequest(requestId);
  }, [onDeleteMyRequest]);
  const ownerRequestActions = React.useMemo(
    () => ({
      onDelete: onDeleteMyRequestVoid,
      pendingDeleteRequestId,
    }),
    [onDeleteMyRequestVoid, pendingDeleteRequestId],
  );

  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const formatNumber = React.useMemo(() => new Intl.NumberFormat(localeTag), [localeTag]);
  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: 'short',
      }),
    [localeTag],
  );
  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(localeTag, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [localeTag],
  );
  const chartMonthLabel = React.useMemo(
    () => new Intl.DateTimeFormat(localeTag, { month: 'short' }),
    [localeTag],
  );

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);

  const createRequestHref = '/auth/login';
  const [seenTotal, setSeenTotal] = React.useState(0);
  const [exploreListDensity, setExploreListDensity] = React.useState<'single' | 'double'>('single');
  const proofCases = React.useMemo<ProofCase[]>(
    () =>
      HOME_PROOF_CASES.map((item) => ({
        id: item.id,
        title: t(item.titleKey),
        info: t(item.infoKey),
        review: t(item.reviewKey),
        price: t(item.priceKey),
        rating: item.rating,
        publishedAt: item.publishedAt,
      })),
    [t],
  );
  const proofCasesPreview = React.useMemo(() => proofCases.slice(0, 4), [proofCases]);
  const proofIndex = useRotatingIndex(proofCasesPreview.length, {
    intervalMs: 5200,
    holdMs: 600,
  });
  const exploreSidebarProvidersLimit = React.useMemo(
    () => (exploreListDensity === 'double' ? 2 : 5),
    [exploreListDensity],
  );
  const exploreSidebarNearbyLimit = React.useMemo(
    () => (exploreListDensity === 'double' ? 2 : 5),
    [exploreListDensity],
  );
  const exploreSidebarProofCases = React.useMemo(
    () => (exploreListDensity === 'double' ? proofCasesPreview.slice(0, 2) : proofCasesPreview),
    [exploreListDensity, proofCasesPreview],
  );
  const exploreTrustPanelClassName = exploreListDensity === 'double'
    ? 'home-trust-live-panel--compact'
    : undefined;

  React.useEffect(() => {
    if (typeof window === 'undefined' || !isAuthed) return;
    const storageKey = `${WORKSPACE_PUBLIC_ORDERS_SEEN_TOTAL_KEY_PREFIX}:${auth.user?.id ?? 'guest'}`;
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? Number(raw) : 0;
    setSeenTotal(Number.isFinite(parsed) ? parsed : 0);
  }, [auth.user?.id, isAuthed]);

  React.useEffect(() => {
    if (!isAuthed || typeof window === 'undefined') return;
    if (seenTotal > platformOrdersTotal) {
      const storageKey = `${WORKSPACE_PUBLIC_ORDERS_SEEN_TOTAL_KEY_PREFIX}:${auth.user?.id ?? 'guest'}`;
      window.localStorage.setItem(storageKey, String(platformOrdersTotal));
      setSeenTotal(platformOrdersTotal);
    }
  }, [auth.user?.id, isAuthed, platformOrdersTotal, seenTotal]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !isWorkspaceAuthed) return;
    if (isWorkspacePublicSection) return;
    const hasTabInQuery = Boolean(searchParams.get('tab'));
    if (hasTabInQuery) return;
    const storedTab = window.localStorage.getItem(ORDERS_TAB_STORAGE_KEY);
    const nextTab = resolveWorkspaceTab(storedTab);
    if (!nextTab || nextTab === 'my-requests') return;
    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', nextTab);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [isWorkspaceAuthed, isWorkspacePublicSection, pathname, router, searchParams]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !isWorkspaceAuthed) return;
    if (isWorkspacePublicSection) return;
    window.localStorage.setItem(ORDERS_TAB_STORAGE_KEY, activeWorkspaceTab);
  }, [activeWorkspaceTab, isWorkspaceAuthed, isWorkspacePublicSection]);

  const markPublicOrdersSeen = React.useCallback(() => {
    if (typeof window === 'undefined' || !isAuthed) return;
    const storageKey = `${WORKSPACE_PUBLIC_ORDERS_SEEN_TOTAL_KEY_PREFIX}:${auth.user?.id ?? 'guest'}`;
    window.localStorage.setItem(storageKey, String(platformOrdersTotal));
    setSeenTotal(platformOrdersTotal);
  }, [auth.user?.id, isAuthed, platformOrdersTotal]);

  React.useEffect(() => {
    if (!isWorkspaceAuthed || activePublicSection !== 'orders') return;
    if (isLoading || isError) return;
    markPublicOrdersSeen();
  }, [activePublicSection, isError, isLoading, isWorkspaceAuthed, markPublicOrdersSeen]);

  const setWorkspaceTab = React.useCallback(
    (tab: WorkspaceTab) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('section');
      next.set('tab', tab);
      next.set('status', 'all');
      if (tab !== 'favorites') next.delete('fav');
      if (tab !== 'reviews') next.delete('reviewRole');
      const query = next.toString();
      trackUXEvent('workspace_tab_change', { tab });
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );
  const setStatusFilter = React.useCallback(
    (status: WorkspaceStatusFilter) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('section');
      next.set('tab', activeWorkspaceTab);
      next.set('status', status);
      const query = next.toString();
      trackUXEvent('workspace_status_filter_change', { tab: activeWorkspaceTab, status });
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [activeWorkspaceTab, pathname, router, searchParams],
  );
  const setFavoritesView = React.useCallback(
    (view: FavoritesView) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('section');
      next.set('tab', 'favorites');
      next.set('fav', view);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );
  const setReviewsView = React.useCallback(
    (view: ReviewsView) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('section');
      next.set('tab', 'reviews');
      next.set('reviewRole', view);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const newOrdersCount = Math.max(0, platformOrdersTotal - seenTotal);
  const allMyContracts = React.useMemo(
    () =>
      [...myProviderContracts, ...myClientContracts].sort((a, b) =>
        a.updatedAt < b.updatedAt ? 1 : -1,
      ),
    [myClientContracts, myProviderContracts],
  );
  const {
    filteredMyRequests,
    filteredMyOffers,
    myOfferRequests,
    filteredContracts,
    hasFavoriteRequests,
    hasFavoriteProviders,
    resolvedFavoritesView,
    favoritesItems,
    isFavoritesLoading,
    resolvedReviews,
    showWorkspaceHeader,
    showWorkspaceHeading,
    statusFilters,
    primaryAction,
  } = useRequestsWorkspaceDerived({
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
  });
  const { contractRequests, contractOffersByRequest } = useContractRequestsData({
    filteredContracts,
    isWorkspaceAuthed,
    locale,
  });
  const favoriteProviderCityLabelById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const provider of favoriteProviders) {
      const cityIdValue = provider.cityId?.trim();
      if (!cityIdValue || map.has(provider.id)) continue;
      const city = cityById.get(cityIdValue);
      if (!city) continue;
      map.set(provider.id, pickI18n(city.i18n, locale));
    }
    return map;
  }, [cityById, favoriteProviders, locale]);
  const favoriteProviderRoleLabelById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const provider of favoriteProviders) {
      const serviceCandidates = [
        ...(Array.isArray(provider.serviceKeys) ? provider.serviceKeys : []),
        ...(provider.serviceKey ? [provider.serviceKey] : []),
      ]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value));
      const serviceKey = serviceCandidates.find((key) => serviceByKey.has(key));
      if (!serviceKey) continue;
      const service = serviceByKey.get(serviceKey);
      if (!service) continue;
      map.set(provider.id, pickI18n(service.i18n, locale));
    }
    return map;
  }, [favoriteProviders, locale, serviceByKey]);
  const favoriteProviderCards = React.useMemo(
    () =>
      favoriteProviders.map((item) => (
        <ProviderCard
          key={`fav-provider-${item.id}`}
          variant="list"
          canToggleFavorite
          isFavorite={isProviderInFavoriteLookup(favoriteProviderLookup, item)}
          isFavoritePending={pendingFavoriteProviderIds.has(item.id)}
          onToggleFavorite={onToggleProviderFavorite}
          provider={mapPublicProviderToCard({
            t,
            provider: item,
            roleLabel: favoriteProviderRoleLabelById.get(item.id) ?? '',
            cityLabel: favoriteProviderCityLabelById.get(item.id) ?? '',
            profileHref: `/providers/${item.id}`,
            reviewsHref: `/providers/${item.id}#reviews`,
            ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
            status: 'online',
          })}
        />
      )),
    [
      favoriteProviderCityLabelById,
      favoriteProviderLookup,
      favoriteProviderRoleLabelById,
      favoriteProviders,
      pendingFavoriteProviderIds,
      onToggleProviderFavorite,
      t,
    ],
  );
  const reviewCards = React.useMemo(
    () =>
      resolvedReviews.map((item) => {
        return (
          <ProofReviewCard
            key={item.id}
            title={item.author}
            info={item.createdLabel}
            review={`“${item.reviewText}”`}
            rating={item.rating?.toFixed(1) ?? '—'}
            price={item.roleLabel}
            isActive
          />
        );
      }),
    [resolvedReviews],
  );
  const {
    topProviders,
    navTitle,
    activityProgress,
    personalNavItems,
    insightText,
    providerStatsPayload,
    clientStatsPayload,
    statsOrder,
  } = useRequestsWorkspaceState({
    t,
    locale,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName: auth.user?.name,
    authMe: auth.me,
    myOffers,
    myRequests,
    myProviderContracts,
    myClientContracts,
    myProviderProfile,
    providers,
    newOrdersCount,
    favoriteRequestCount: favoriteRequestIds.size,
    setWorkspaceTab,
    markPublicOrdersSeen,
    formatNumber,
    chartMonthLabel,
  });

  const { workspaceContentProps, publicContentProps } = useRequestsPageViewModel({
    t,
    locale,
    activeWorkspaceTab,
    showWorkspaceHeader,
    showWorkspaceHeading,
    primaryAction,
    onPrimaryActionClick: () => trackUXEvent('workspace_primary_cta_click', { tab: activeWorkspaceTab }),
    statusFilters,
    activeStatusFilter,
    setStatusFilter,
    categoryOptions,
    serviceOptions,
    cityOptions,
    sortOptions,
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    totalResultsLabel: formatNumber.format(totalResults),
    isCategoriesLoading,
    isServicesLoading,
    isFiltersPending,
    appliedFilterChips,
    onCategoryChangeTracked,
    onSubcategoryChangeTracked,
    onCityChangeTracked,
    onSortChangeTracked,
    onResetTracked,
    hasActivePublicFilter,
    isWorkspaceRoute,
    isLoading,
    isError,
    requestsCount: requests.length,
    requests,
    isPersonalized,
    offersByRequest,
    favoriteRequestIds,
    onToggleRequestFavorite,
    onOpenOfferSheet,
    onWithdrawOffer,
    onOpenChatThread,
    pendingOfferRequestId,
    pendingFavoriteRequestIds,
    isAuthed,
    serviceByKey,
    categoryByKey,
    cityById,
    formatDate,
    formatPrice,
    isMyRequestsLoading,
    filteredMyRequests,
    ownerRequestActions,
    isMyOffersLoading,
    filteredMyOffers,
    myOfferRequests,
    isProviderContractsLoading,
    isClientContractsLoading,
    filteredContracts,
    contractRequests,
    contractOffersByRequest,
    isFavoritesLoading,
    favoritesItems,
    hasFavoriteRequests,
    hasFavoriteProviders,
    resolvedFavoritesView,
    setFavoritesView,
    favoriteRequests,
    isFavoriteRequestsLoading,
    favoriteProviderCards,
    isMyReviewsLoading,
    myReviews,
    activeReviewsView,
    setReviewsView,
    reviewCards,
    page,
    totalPages,
    setPage,
  });

  if (isWorkspaceRoute && authStatus !== 'authenticated' && !isWorkspaceGuestPreview) {
    return <LoadingScreen />;
  }

  return (
    <PageShell right={<AuthActions />} showBack={isWorkspaceAuthed} mainClassName="py-6 requests-screen">
      {!isAuthed ? (
        <HeroSection
          title={t(I18N_KEYS.requestsPage.heroTitle)}
          subtitle={t(I18N_KEYS.requestsPage.heroSubtitle)}
          ctas={[
            {
              href: createRequestHref,
              label: t(I18N_KEYS.requestsPage.heroPrimaryCta),
              variant: 'primary',
            },
          ]}
          mediaSrc="/Handwerker in einem modernen Wohnzimmer.jpg"
        />
      ) : null}

      {isWorkspaceAuthed ? (
        isWorkspacePublicSection ? (
          <div className="stack-md">
            <WorkspacePrivateIntro
              navTitle={navTitle}
              personalNavItems={personalNavItems}
              insightText={insightText}
              activityProgress={activityProgress}
              statsOrder={statsOrder}
              statsFallbackTitle={t(I18N_KEYS.requestsPage.statsProviderTitle)}
              statsTabsLabel={{
                provider: t(I18N_KEYS.homePublic.howItWorksProviderTab),
                client: t(I18N_KEYS.homePublic.howItWorksClientTab),
              }}
              statsErrorLabel={t(I18N_KEYS.requestsPage.statsLoadError)}
              providerStatsPayload={providerStatsPayload}
              clientStatsPayload={clientStatsPayload}
            />

            <div className="requests-grid requests-grid--equal-cols">
              <div>
                {activePublicSection === 'stats' ? (
                  <HomePlatformActivityPanel t={t} locale={locale} />
                ) : (
                  <HomeOrdersExplorePanel
                    t={t}
                    locale={locale}
                    contentType={activePublicSection === 'providers' ? 'providers' : 'requests'}
                    showHeading={false}
                    showBack={false}
                    backHref="/"
                    onListDensityChange={setExploreListDensity}
                  />
                )}
              </div>

              <aside className="stack-md hide-mobile">
                {activePublicSection === 'providers' ? (
                  <HomeNearbyPanel
                    t={t}
                    viewAllHref="/workspace?section=orders"
                    itemsLimit={exploreSidebarNearbyLimit}
                    visibleRows={exploreSidebarNearbyLimit}
                  />
                ) : (
                  <HomeTopProvidersPanel t={t} locale={locale} limit={exploreSidebarProvidersLimit} />
                )}
                <HomeProofPanel
                  t={t}
                  proofCases={exploreSidebarProofCases}
                  proofIndex={exploreSidebarProofCases.length ? proofIndex % exploreSidebarProofCases.length : 0}
                />
                <HomeTrustLivePanel className={exploreTrustPanelClassName} t={t} />
              </aside>
            </div>
          </div>
        ) : (
          <WorkspaceFrame
            intro={(
              <WorkspacePrivateIntro
                navTitle={navTitle}
                personalNavItems={personalNavItems}
                insightText={insightText}
                activityProgress={activityProgress}
                statsOrder={statsOrder}
                statsFallbackTitle={t(I18N_KEYS.requestsPage.statsProviderTitle)}
                statsTabsLabel={{
                  provider: t(I18N_KEYS.homePublic.howItWorksProviderTab),
                  client: t(I18N_KEYS.homePublic.howItWorksClientTab),
                }}
                statsErrorLabel={t(I18N_KEYS.requestsPage.statsLoadError)}
                providerStatsPayload={providerStatsPayload}
                clientStatsPayload={clientStatsPayload}
              />
            )}
            main={<WorkspaceContent {...workspaceContentProps} />}
            aside={(
              <WorkspaceTopProvidersAside
                isLoading={isProvidersLoading}
                isError={isProvidersError}
                errorLabel={t(I18N_KEYS.requestsPage.error)}
                title={t(I18N_KEYS.homePublic.topProviders)}
                subtitle={t(I18N_KEYS.homePublic.topProvidersSubtitle)}
                ctaLabel={t(I18N_KEYS.homePublic.topProvidersCta)}
                ctaHref="/workspace?section=orders"
                providers={topProviders}
                favoriteProviderIds={favoriteProviderIds}
                pendingFavoriteProviderIds={pendingFavoriteProviderIds}
                onToggleFavorite={onToggleProviderFavorite}
              />
            )}
          />
        )
      ) : (
        <WorkspaceFrame
          main={<PublicContent {...publicContentProps} />}
          aside={(
            <WorkspaceTopProvidersAside
              isLoading={isProvidersLoading}
              isError={isProvidersError}
              errorLabel={t(I18N_KEYS.requestsPage.error)}
              title={t(I18N_KEYS.homePublic.topProviders)}
              subtitle={t(I18N_KEYS.homePublic.topProvidersSubtitle)}
              ctaLabel={t(I18N_KEYS.homePublic.topProvidersCta)}
              ctaHref="/workspace?section=providers"
              providers={topProviders}
              favoriteProviderIds={favoriteProviderIds}
            />
          )}
        />
      )}
      {isWorkspaceAuthed &&
      activeWorkspaceTab !== 'favorites' &&
      activeWorkspaceTab !== 'my-requests' &&
      activeWorkspaceTab !== 'my-offers' ? (
        <div className="workspace-mobile-action">
          <Link
            href={primaryAction.href}
            className="btn-primary workspace-mobile-action__btn"
            onClick={() => trackUXEvent('workspace_primary_cta_click', { tab: activeWorkspaceTab, mobile: true })}
          >
            {primaryAction.label}
          </Link>
        </div>
      ) : null}
    </PageShell>
  );
}

export default function RequestsPage() {
  return (
    <React.Suspense fallback={null}>
      <RequestsPageContent />
    </React.Suspense>
  );
}
