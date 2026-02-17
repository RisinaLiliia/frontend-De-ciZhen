'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { PersonalNavSection } from '@/components/layout/PersonalNavSection';
import { HeroSection } from '@/components/ui/HeroSection';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestsList } from '@/components/requests/RequestsList';
import { RequestsStatsPanel } from '@/components/requests/RequestsStatsPanel';
import { UserHeaderCardSkeleton } from '@/components/ui/UserHeaderCardSkeleton';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import {
  deleteMyRequest,
  listMyRequests,
  listPublicRequests,
  type PublicRequestsSort,
} from '@/lib/api/requests';
import { getMyProviderProfile, listPublicProviders } from '@/lib/api/providers';
import { listMyContracts } from '@/lib/api/contracts';
import { deleteOffer, listMyProviderOffers } from '@/lib/api/offers';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { listMyReviews } from '@/lib/api/reviews';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { TopProvidersPanel } from '@/components/providers/TopProvidersPanel';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { IconBriefcase, IconCheck, IconHeart, IconSend, IconUser } from '@/components/ui/icons/icons';
import { trackUXEvent } from '@/lib/analytics';
import { getStatusBadgeClass } from '@/lib/statusBadge';
import type { I18nKey } from '@/lib/i18n/keys';

const ALL_OPTION_KEY = 'all';

type SortKey = PublicRequestsSort;

type SortOption = {
  value: SortKey;
  labelKey: I18nKey;
};

const SORT_OPTIONS: SortOption[] = [
  { value: 'date_desc', labelKey: I18N_KEYS.requestsPage.sortNewest },
  { value: 'date_asc', labelKey: I18N_KEYS.requestsPage.sortOldest },
  { value: 'price_asc', labelKey: I18N_KEYS.requestsPage.sortPriceAsc },
  { value: 'price_desc', labelKey: I18N_KEYS.requestsPage.sortPriceDesc },
];

const NEW_ORDERS_SEEN_TOTAL_KEY_PREFIX = 'dc_requests_new_seen_total_v1';

type WorkspaceTab = 'new-orders' | 'my-requests' | 'my-offers' | 'completed-jobs' | 'favorites' | 'reviews';
type WorkspaceStatusFilter = 'all' | 'open' | 'in_progress' | 'completed';

const WORKSPACE_TABS: WorkspaceTab[] = [
  'new-orders',
  'my-requests',
  'my-offers',
  'completed-jobs',
  'favorites',
  'reviews',
];

function resolveWorkspaceTab(value: string | null): WorkspaceTab {
  return value && WORKSPACE_TABS.includes(value as WorkspaceTab) ? (value as WorkspaceTab) : 'new-orders';
}

function resolveStatusFilter(value: string | null): WorkspaceStatusFilter {
  return value === 'open' || value === 'in_progress' || value === 'completed' ? value : 'all';
}

function mapRequestStatusToFilter(status?: string): WorkspaceStatusFilter {
  if (!status) return 'all';
  if (status === 'completed') return 'completed';
  if (status === 'in_progress' || status === 'assigned' || status === 'matched') return 'in_progress';
  return 'open';
}

function mapOfferStatusToFilter(status?: string): WorkspaceStatusFilter {
  if (!status) return 'all';
  if (status === 'accepted') return 'in_progress';
  if (status === 'declined') return 'completed';
  return 'open';
}

function mapContractStatusToFilter(status?: string): WorkspaceStatusFilter {
  if (!status) return 'all';
  if (status === 'completed') return 'completed';
  return 'in_progress';
}

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
  const isPersonalized = isAuthed;
  const activeWorkspaceTab = React.useMemo(
    () => resolveWorkspaceTab(searchParams.get('tab')),
    [searchParams],
  );
  const activeStatusFilter = React.useMemo(
    () => resolveStatusFilter(searchParams.get('status')),
    [searchParams],
  );

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
  } = useRequestsFilters({
    services,
    defaultSort: 'date_desc',
  });

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

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });

  const { data: publicRequests, isLoading, isError } = useQuery({
    queryKey: [
      'requests-public',
      filter.cityId,
      filter.categoryKey,
      filter.subcategoryKey,
      filter.sort,
      filter.page,
      filter.limit,
    ],
    queryFn: () => listPublicRequests(filter),
  });

  const { data: allRequestsSummary } = useQuery({
    queryKey: ['requests-public-summary-total'],
    enabled: isAuthed,
    queryFn: () =>
      listPublicRequests({
        sort: 'date_desc',
        page: 1,
        limit: 1,
      }),
  });

  const { data: myOffers = [], isLoading: isMyOffersLoading } = useQuery({
    queryKey: ['offers-my'],
    enabled: isAuthed,
    queryFn: async () => {
      try {
        return await listMyProviderOffers();
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const status = Number((error as { status?: number }).status ?? 0);
          if (status === 403 || status === 404) return [];
        }
        throw error;
      }
    },
  });

  const { data: favoriteRequests = [], isLoading: isFavoriteRequestsLoading } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: isAuthed,
    queryFn: async () => {
      try {
        return await listFavorites('request');
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const status = Number((error as { status?: number }).status ?? 0);
          if (status === 403 || status === 404) return [];
        }
        throw error;
      }
    },
  });

  const { data: favoriteProviders = [], isLoading: isFavoriteProvidersLoading } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: isAuthed,
    queryFn: async () => {
      try {
        return await listFavorites('provider');
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const status = Number((error as { status?: number }).status ?? 0);
          if (status === 403 || status === 404) return [];
        }
        throw error;
      }
    },
  });

  const { data: myReviews = [], isLoading: isMyReviewsLoading } = useQuery({
    queryKey: ['reviews-my', 'all'],
    enabled: isAuthed,
    queryFn: async () => {
      try {
        return await listMyReviews({ role: 'all' });
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const status = Number((error as { status?: number }).status ?? 0);
          if (status === 403 || status === 404) return [];
        }
        throw error;
      }
    },
  });

  const { data: myRequests = [], isLoading: isMyRequestsLoading } = useQuery({
    queryKey: ['requests-my'],
    enabled: isAuthed,
    queryFn: async () => {
      try {
        return await listMyRequests();
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const status = Number((error as { status?: number }).status ?? 0);
          if (status === 403 || status === 404) return [];
        }
        throw error;
      }
    },
  });

  const { data: myProviderContracts = [], isLoading: isProviderContractsLoading } = useQuery({
    queryKey: ['contracts-my-provider'],
    enabled: isAuthed,
    queryFn: async () => {
      try {
        return await listMyContracts({ role: 'provider' });
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const status = Number((error as { status?: number }).status ?? 0);
          if (status === 403 || status === 404) return [];
        }
        throw error;
      }
    },
  });

  const { data: myClientContracts = [], isLoading: isClientContractsLoading } = useQuery({
    queryKey: ['contracts-my-client'],
    enabled: isAuthed,
    queryFn: async () => {
      try {
        return await listMyContracts({ role: 'client' });
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const status = Number((error as { status?: number }).status ?? 0);
          if (status === 403 || status === 404) return [];
        }
        throw error;
      }
    },
  });

  const { data: myProviderProfile } = useQuery({
    queryKey: ['provider-profile-me'],
    enabled: isAuthed,
    queryFn: async () => {
      try {
        return await getMyProviderProfile();
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const status = Number((error as { status?: number }).status ?? 0);
          if (status === 403 || status === 404) return null;
        }
        throw error;
      }
    },
  });

  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useQuery({
    queryKey: ['providers-public', cityId, subcategoryKey],
    queryFn: () =>
      listPublicProviders({
        cityId: cityId === ALL_OPTION_KEY ? undefined : cityId,
        serviceKey: subcategoryKey === ALL_OPTION_KEY ? undefined : subcategoryKey,
      }),
  });

  const requests = publicRequests?.items ?? [];
  const totalResults = publicRequests?.total ?? requests.length;
  const totalAllRequests = allRequestsSummary?.total ?? totalResults;
  const totalPages = Math.max(1, Math.ceil(totalResults / limit));

  const topProviders = React.useMemo(() => {
    const sorted = [...providers].sort((a, b) => b.ratingAvg - a.ratingAvg);
    return sorted.slice(0, 2).map((provider) => {
      const name = provider.displayName ?? t(I18N_KEYS.provider.unnamed);
      const avatarLetter = name.trim().charAt(0).toUpperCase() || 'A';
      const rating = provider.ratingAvg.toFixed(1);
      const reviewsLabel = `${provider.ratingCount} ${t(I18N_KEYS.homePublic.reviews)}`;
      const jobsLabel = `${provider.completedJobs} ${t(I18N_KEYS.provider.jobs)}`;
      const badges = [t(I18N_KEYS.homePublic.topProvider1Badge1)];
      if (provider.ratingAvg >= 4.8 || provider.completedJobs >= 100) {
        badges.push(t(I18N_KEYS.homePublic.topProvider2Badge1));
      }
      return {
        id: provider.id,
        badges,
        status: 'online' as const,
        statusLabel: t(I18N_KEYS.homePublic.topProviderStatus),
        avatarLetter,
        avatarUrl: provider.avatarUrl,
        name,
        role: jobsLabel,
        rating,
        reviewsCount: provider.ratingCount,
        reviewsLabel,
        ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
        profileHref: `/providers/${provider.id}`,
        reviewsHref: `/providers/${provider.id}#reviews`,
      };
    });
  }, [providers, t]);

  const favoriteRequestIds = React.useMemo(
    () => new Set(favoriteRequests.map((item) => item.id)),
    [favoriteRequests],
  );
  const favoriteProviderIds = React.useMemo(
    () => new Set(favoriteProviders.map((item) => item.id)),
    [favoriteProviders],
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
  const [pendingFavoriteRequestIds, setPendingFavoriteRequestIds] = React.useState<Set<string>>(
    () => new Set(),
  );

  const onToggleRequestFavorite = React.useCallback(
    async (requestId: string) => {
      if (pendingFavoriteRequestIds.has(requestId)) return;
      const isSaved = favoriteRequestIds.has(requestId);
      setPendingFavoriteRequestIds((prev) => {
        const next = new Set(prev);
        next.add(requestId);
        return next;
      });
      try {
        if (isSaved) {
          await removeFavorite('request', requestId);
          toast.message(t(I18N_KEYS.requestDetails.favoritesRemoved));
        } else {
          await addFavorite('request', requestId);
          toast.success(t(I18N_KEYS.requestDetails.saved));
        }
        await qc.invalidateQueries({ queryKey: ['favorite-requests'] });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.favoritesFailed));
      } finally {
        setPendingFavoriteRequestIds((prev) => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
      }
    },
    [favoriteRequestIds, pendingFavoriteRequestIds, qc, t],
  );

  const onToggleProviderFavorite = React.useCallback(
    async (providerId: string) => {
      const isSaved = favoriteProviderIds.has(providerId);
      try {
        if (isSaved) {
          await removeFavorite('provider', providerId);
          toast.message(t(I18N_KEYS.requestDetails.favoritesRemoved));
        } else {
          await addFavorite('provider', providerId);
          toast.success(t(I18N_KEYS.requestDetails.saved));
        }
        await qc.invalidateQueries({ queryKey: ['favorite-providers'] });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.favoritesFailed));
      }
    },
    [favoriteProviderIds, qc, t],
  );

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

  const onDeleteMyRequest = React.useCallback(
    async (requestId: string) => {
      if (pendingDeleteRequestId === requestId) return;
      setPendingDeleteRequestId(requestId);
      try {
        await deleteMyRequest(requestId);
        toast.success('Anfrage entfernt');
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

  const sentCount = React.useMemo(
    () => myOffers.filter((offer) => offer.status === 'sent').length,
    [myOffers],
  );
  const acceptedCount = React.useMemo(
    () => myOffers.filter((offer) => offer.status === 'accepted').length,
    [myOffers],
  );
  const completedJobsCount = React.useMemo(
    () => myProviderContracts.filter((item) => item.status === 'completed').length,
    [myProviderContracts],
  );
  const declinedCount = React.useMemo(
    () => myOffers.filter((offer) => offer.status === 'declined').length,
    [myOffers],
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

  const createRequestHref = '/auth/login?next=/request/create&role=client';
  const [seenTotal, setSeenTotal] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !isAuthed) return;
    const storageKey = `${NEW_ORDERS_SEEN_TOTAL_KEY_PREFIX}:${auth.user?.id ?? 'guest'}`;
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? Number(raw) : 0;
    setSeenTotal(Number.isFinite(parsed) ? parsed : 0);
  }, [auth.user?.id, isAuthed]);

  React.useEffect(() => {
    if (!isAuthed || totalAllRequests <= 0 || typeof window === 'undefined') return;
    if (seenTotal > totalAllRequests) {
      const storageKey = `${NEW_ORDERS_SEEN_TOTAL_KEY_PREFIX}:${auth.user?.id ?? 'guest'}`;
      window.localStorage.setItem(storageKey, String(totalAllRequests));
      setSeenTotal(totalAllRequests);
    }
  }, [auth.user?.id, isAuthed, seenTotal, totalAllRequests]);

  const markNewOrdersSeen = React.useCallback(() => {
    if (typeof window === 'undefined' || !isAuthed) return;
    const storageKey = `${NEW_ORDERS_SEEN_TOTAL_KEY_PREFIX}:${auth.user?.id ?? 'guest'}`;
    window.localStorage.setItem(storageKey, String(totalAllRequests));
    setSeenTotal(totalAllRequests);
  }, [auth.user?.id, isAuthed, totalAllRequests]);

  const setWorkspaceTab = React.useCallback(
    (tab: WorkspaceTab) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('tab', tab);
      next.set('status', 'all');
      const query = next.toString();
      trackUXEvent('workspace_tab_change', { tab });
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );
  const setStatusFilter = React.useCallback(
    (status: WorkspaceStatusFilter) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('tab', activeWorkspaceTab);
      next.set('status', status);
      const query = next.toString();
      trackUXEvent('workspace_status_filter_change', { tab: activeWorkspaceTab, status });
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [activeWorkspaceTab, pathname, router, searchParams],
  );

  const newOrdersCount = Math.max(0, totalAllRequests - seenTotal);
  const resolvedName = auth.user?.name?.trim() || 'User';
  const navTitle = `${t(I18N_KEYS.requestsPage.navGreeting)}, ${resolvedName}!`;
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
  const allMyContracts = React.useMemo(
    () =>
      [...myProviderContracts, ...myClientContracts].sort((a, b) =>
        a.updatedAt < b.updatedAt ? 1 : -1,
      ),
    [myClientContracts, myProviderContracts],
  );
  const filteredMyRequests = React.useMemo(
    () =>
      myRequests.filter(
        (item) =>
          activeStatusFilter === 'all' || mapRequestStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, myRequests],
  );
  const filteredMyOffers = React.useMemo(
    () =>
      myOffers.filter(
        (item) => activeStatusFilter === 'all' || mapOfferStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, myOffers],
  );
  const filteredContracts = React.useMemo(
    () =>
      allMyContracts.filter(
        (item) =>
          activeStatusFilter === 'all' || mapContractStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, allMyContracts],
  );
  const statusFilters = React.useMemo(
    () =>
      activeWorkspaceTab === 'new-orders' || activeWorkspaceTab === 'favorites' || activeWorkspaceTab === 'reviews'
        ? []
        : [
            { key: 'all' as const, label: 'Alle' },
            { key: 'open' as const, label: 'Offen' },
            { key: 'in_progress' as const, label: 'In Arbeit' },
            { key: 'completed' as const, label: 'Abgeschlossen' },
          ],
    [activeWorkspaceTab],
  );
  const primaryAction = React.useMemo(() => {
    if (activeWorkspaceTab === 'my-requests') {
      return { label: 'Neue Anfrage erstellen', href: '/request/create' };
    }
    if (activeWorkspaceTab === 'my-offers') {
      return { label: 'Neue Auftraege finden', href: '/requests?tab=new-orders' };
    }
    if (activeWorkspaceTab === 'completed-jobs') {
      return { label: 'Aktive Auftraege', href: '/requests?tab=my-offers&status=in_progress' };
    }
    if (activeWorkspaceTab === 'favorites') {
      return { label: 'Neue Favoriten', href: '/requests?tab=new-orders' };
    }
    if (activeWorkspaceTab === 'reviews') {
      return { label: 'Meine Auftraege', href: '/requests?tab=my-offers' };
    }
    return { label: 'Neue Anfrage erstellen', href: '/request/create' };
  }, [activeWorkspaceTab]);
  const personalNavItems = React.useMemo(
    () =>
      isPersonalized
        ? [
            {
              key: 'new-orders',
              href: '/requests?tab=new-orders',
              label: t(I18N_KEYS.requestsPage.navNewOrders),
              icon: <IconBriefcase />,
              value: newOrdersCount,
              hint: t(I18N_KEYS.requestsPage.resultsLabel),
              onClick: () => {
                markNewOrdersSeen();
                setWorkspaceTab('new-orders');
              },
              forceActive: activeWorkspaceTab === 'new-orders',
              match: 'exact' as const,
            },
            {
              key: 'my-orders',
              href: '/requests?tab=my-requests',
              label: 'Meine Auftraege',
              icon: <IconBriefcase />,
              value: myRequests.length,
              hint: t(I18N_KEYS.requestsPage.summaryAccepted),
              onClick: () => setWorkspaceTab('my-requests'),
              forceActive: activeWorkspaceTab === 'my-requests',
              match: 'exact' as const,
            },
            {
              key: 'my-offers',
              href: '/requests?tab=my-offers',
              label: t(I18N_KEYS.requestsPage.navMyOffers),
              icon: <IconSend />,
              value: sentCount,
              hint: t(I18N_KEYS.requestsPage.summarySent),
              onClick: () => setWorkspaceTab('my-offers'),
              forceActive: activeWorkspaceTab === 'my-offers',
              match: 'exact' as const,
            },
            {
              key: 'completed-jobs',
              href: '/requests?tab=completed-jobs',
              label: 'Abgeschlossene Jobs',
              icon: <IconCheck />,
              value: completedJobsCount,
              hint: t(I18N_KEYS.provider.jobs),
              onClick: () => setWorkspaceTab('completed-jobs'),
              forceActive: activeWorkspaceTab === 'completed-jobs',
              match: 'exact' as const,
            },
            {
              key: 'my-favorites',
              href: '/requests?tab=favorites',
              label: 'Meine Favoriten',
              icon: <IconHeart />,
              value: favoriteRequestIds.size,
              hint: t(I18N_KEYS.requestDetails.ctaSave),
              onClick: () => setWorkspaceTab('favorites'),
              forceActive: activeWorkspaceTab === 'favorites',
              match: 'exact' as const,
            },
            {
              key: 'reviews',
              href: '/requests?tab=reviews',
              label: t(I18N_KEYS.requestsPage.navReviews),
              icon: <IconUser />,
              rating: {
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              onClick: () => setWorkspaceTab('reviews'),
              forceActive: activeWorkspaceTab === 'reviews',
              match: 'exact' as const,
            },
          ]
        : [
            {
              key: 'new-orders',
              href: '/requests?tab=new-orders',
              label: t(I18N_KEYS.requestsPage.navNewOrders),
              icon: <IconBriefcase />,
              value: newOrdersCount,
              hint: t(I18N_KEYS.requestsPage.resultsLabel),
              onClick: () => {
                markNewOrdersSeen();
                setWorkspaceTab('new-orders');
              },
              forceActive: activeWorkspaceTab === 'new-orders',
              match: 'exact' as const,
            },
            {
              key: 'my-orders',
              href: '/requests?tab=my-requests',
              label: 'Meine Auftraege',
              icon: <IconBriefcase />,
              hint: t(I18N_KEYS.requestsPage.summaryAccepted),
              onClick: () => setWorkspaceTab('my-requests'),
              forceActive: activeWorkspaceTab === 'my-requests',
              match: 'exact' as const,
            },
            {
              key: 'my-offers',
              href: '/requests?tab=my-offers',
              label: t(I18N_KEYS.requestsPage.navMyOffers),
              icon: <IconSend />,
              hint: t(I18N_KEYS.requestsPage.summarySent),
              onClick: () => setWorkspaceTab('my-offers'),
              forceActive: activeWorkspaceTab === 'my-offers',
              match: 'exact' as const,
            },
            {
              key: 'my-favorites',
              href: '/requests?tab=favorites',
              label: 'Meine Favoriten',
              icon: <IconHeart />,
              hint: t(I18N_KEYS.requestDetails.ctaSave),
              onClick: () => setWorkspaceTab('favorites'),
              forceActive: activeWorkspaceTab === 'favorites',
              match: 'exact' as const,
            },
            {
              key: 'reviews',
              href: '/requests?tab=reviews',
              label: t(I18N_KEYS.requestsPage.navReviews),
              icon: <IconUser />,
              rating: {
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              onClick: () => setWorkspaceTab('reviews'),
              forceActive: activeWorkspaceTab === 'reviews',
              match: 'exact' as const,
            },
          ],
    [
      activeWorkspaceTab,
      completedJobsCount,
      favoriteRequestIds.size,
      isPersonalized,
      markNewOrdersSeen,
      myRequests.length,
      navRatingValue,
      navReviewsCount,
      newOrdersCount,
      setWorkspaceTab,
      sentCount,
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
  const acceptanceRate = Math.round(
    (acceptedCount / Math.max(acceptedDecidedDenominator, 1)) * 100,
  );

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
    const avg = Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length);
    return avg;
  }, [myOffers]);

  const now = Date.now();
  const recentOffers7d = React.useMemo(
    () =>
      myOffers.filter(
        (item) => now - new Date(item.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000,
      ).length,
    [myOffers, now],
  );

  const providerProfileCompleteness = React.useMemo(
    () => computeProfileCompleteness(myProviderProfile),
    [myProviderProfile],
  );
  const clientProfileCompleteness = React.useMemo(
    () => computeClientCompleteness(auth.me),
    [auth.me],
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

  const providerHint = React.useMemo(() => {
    if (providerProfileCompleteness < 80) {
      return {
        text: `Profil zu ${providerProfileCompleteness}% ausgefuellt. Vervollstaendige es fuer bessere Annahmequoten.`,
        ctaLabel: 'Profil vervollstaendigen',
        ctaHref: '/profile/workspace',
      };
    }
    if (recentOffers7d === 0) {
      return {
        text: 'Seit 7 Tagen keine neuen Angebote. Pruefe Services, Standort und Verfuegbarkeit.',
        ctaLabel: 'Auftraege ansehen',
        ctaHref: '/requests',
      };
    }
    if (acceptanceRate < 25) {
      return {
        text: 'Deine Annahmequote ist niedrig. Optimiere Preis und Nachricht fuer mehr Zusagen.',
        ctaLabel: 'Angebote verbessern',
        ctaHref: '/requests',
      };
    }
    return {
      text: 'Starke Performance. Halte Profil und Preise aktuell fuer stabile Auslastung.',
      ctaLabel: 'Meine Vertraege',
      ctaHref: '/provider/contracts',
    };
  }, [acceptanceRate, providerProfileCompleteness, recentOffers7d]);

  const clientHint = React.useMemo(() => {
    if (myRequests.length === 0) {
      return {
        text: 'Noch keine Anfrage erstellt. Starte mit deinem ersten Auftrag.',
        ctaLabel: 'Anfrage erstellen',
        ctaHref: '/request/create',
      };
    }
    if (myOpenRequests.length > 0) {
      return {
        text: 'Du hast aktive Anfragen. Vergleiche Angebote und entscheide schneller.',
        ctaLabel: 'Meine Anfragen',
        ctaHref: '/client/requests',
      };
    }
    return {
      text: 'Deine Anfragen laufen stabil. Lege neue Aufgaben an, wenn du weitere Hilfe brauchst.',
      ctaLabel: 'Neue Anfrage',
      ctaHref: '/request/create',
    };
  }, [myOpenRequests.length, myRequests.length]);

  const providerActivityCount =
    sentCount +
    acceptedCount +
    declinedCount +
    providerActiveContracts.length +
    providerCompletedContracts.length;
  const clientActivityCount =
    myRequests.length + myOpenRequests.length + clientActiveContracts.length + clientCompletedContracts.length;
  const hasAnyStatsActivity = providerActivityCount + clientActivityCount > 0;

  const providerPriorityScore = providerProfileCompleteness + providerActivityCount * 5;
  const clientPriorityScore = clientProfileCompleteness + clientActivityCount * 5;

  const providerStatsPayload = {
    kpis: [],
    showKpis: false,
    hasData: true,
    chartTitle: 'Jobs / Einnahmen',
    chartDelta:
      providerCompletedContracts.length > 0
        ? `+${Math.round((providerCompletedContracts.length / Math.max(1, myProviderContracts.length)) * 100)}%`
        : undefined,
    chartPoints: providerChartPoints,
    secondary: {
      leftLabel: 'gesendet',
      leftValue: formatNumber.format(sentCount),
      centerLabel: 'angenommen',
      centerValue: formatNumber.format(acceptedCount),
      rightLabel: 'aktiv',
      rightValue: formatNumber.format(providerActiveContracts.length),
      progressLabel: 'Annahmequote',
      progressValue: acceptanceRate,
      responseLabel: 'Antwortzeit',
      responseValue: avgResponseMinutes ? `${avgResponseMinutes} min` : '—',
    },
    hint: providerHint,
    emptyTitle: 'Noch keine Angebote. Starte mit dem ersten Auftrag.',
    emptyCtaLabel: 'Auftraege ansehen',
    emptyCtaHref: '/requests',
  };

  const clientStatsPayload = {
    kpis: [
      {
        key: 'requests-total',
        label: 'Meine Anfragen',
        value: formatNumber.format(myRequests.length),
      },
      {
        key: 'requests-open',
        label: 'Aktiv',
        value: formatNumber.format(myOpenRequests.length),
      },
      {
        key: 'contracts-active',
        label: 'In Arbeit',
        value: formatNumber.format(clientActiveContracts.length),
      },
      {
        key: 'contracts-completed',
        label: 'Abgeschlossen',
        value: formatNumber.format(clientCompletedContracts.length),
      },
    ],
    chartTitle: 'Anfragen / Abschluesse',
    chartPoints: clientChartPoints,
    secondary: {
      leftLabel: 'gesamt',
      leftValue: formatNumber.format(myRequests.length),
      centerLabel: 'offen',
      centerValue: formatNumber.format(myOpenRequests.length),
      rightLabel: 'in Arbeit',
      rightValue: formatNumber.format(clientActiveContracts.length),
      progressLabel: 'Abschlussquote',
      progressValue: Math.round((clientCompletedContracts.length / Math.max(1, myRequests.length)) * 100),
      responseLabel: 'Abgeschlossene Auftraege',
      responseValue: formatNumber.format(clientCompletedContracts.length),
    },
    hint: clientHint,
    emptyTitle: 'Noch keine Anfrage erstellt.',
    emptyCtaLabel: 'Anfrage erstellen',
    emptyCtaHref: '/request/create',
  };

  const statsOrder =
    providerPriorityScore >= clientPriorityScore
      ? [
          { tab: 'provider' as const, title: 'Statistik Anbieter', payload: providerStatsPayload },
          { tab: 'client' as const, title: 'Statistik Kunde', payload: clientStatsPayload },
        ]
      : [
          { tab: 'client' as const, title: 'Statistik Kunde', payload: clientStatsPayload },
          { tab: 'provider' as const, title: 'Statistik Anbieter', payload: providerStatsPayload },
        ];

  return (
    <PageShell right={<AuthActions />} showBack={isAuthed} mainClassName="py-6 requests-screen">
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
          mediaSrc="/Handwerker%20in%20einem%20modernen%20Wohnzimmer.jpg"
        />
      ) : null}

      <div className="requests-grid">
        <div className="stack-md">
          {isAuthed ? (
            <PersonalNavSection
              className="personal-nav--left"
              title={navTitle}
              items={personalNavItems}
              insightText={insightText}
              progressPercent={activityProgress}
            />
          ) : null}
          {/* <HomeStatsPanel t={t} stats={stats} formatNumber={formatNumber} /> */}
          <section className="panel requests-panel" aria-labelledby="workspace-section-title">
            <div className="requests-header">
              <div className="section-heading">
                <p id="workspace-section-title" className="section-title">
                  {activeWorkspaceTab === 'new-orders'
                    ? t(I18N_KEYS.requestsPage.title)
                    : activeWorkspaceTab === 'my-requests'
                      ? 'Meine Auftraege'
                      : activeWorkspaceTab === 'my-offers'
                        ? 'Meine Angebote'
                        : activeWorkspaceTab === 'completed-jobs'
                          ? 'Abgeschlossene Jobs'
                          : activeWorkspaceTab === 'favorites'
                            ? 'Meine Favoriten'
                            : 'Bewertungen'}
                </p>
                <p id="workspace-section-subtitle" className="section-subtitle">
                  {activeWorkspaceTab === 'new-orders'
                    ? t(I18N_KEYS.requestsPage.subtitle)
                    : 'Workspace-Ansicht fuer deine eigenen Daten und Aktionen.'}
                </p>
              </div>
              <Link
                href={primaryAction.href}
                className="btn-primary requests-primary-cta"
                onClick={() => trackUXEvent('workspace_primary_cta_click', { tab: activeWorkspaceTab })}
              >
                {primaryAction.label}
              </Link>
            </div>

            {activeWorkspaceTab === 'new-orders' ? (
              <RequestsFilters
                t={t}
                locale={locale}
                categoryOptions={categoryOptions}
                serviceOptions={serviceOptions}
                cityOptions={cityOptions}
                sortOptions={sortOptions}
                categoryKey={categoryKey}
                subcategoryKey={subcategoryKey}
                cityId={cityId}
                sortBy={sortBy}
                totalResults={formatNumber.format(totalResults)}
                isCategoriesLoading={isCategoriesLoading}
                isServicesLoading={isServicesLoading}
                onCategoryChange={onCategoryChange}
                onSubcategoryChange={onSubcategoryChange}
                onCityChange={onCityChange}
                onSortChange={onSortChange}
                onReset={onReset}
              />
            ) : null}
            {statusFilters.length > 0 ? (
              <div className="chip-row" role="tablist" aria-label="Statusfilter">
                {statusFilters.map((filterItem) => (
                  <button
                    key={filterItem.key}
                    type="button"
                    className={`chip ${activeStatusFilter === filterItem.key ? 'is-active' : ''}`.trim()}
                    onClick={() => setStatusFilter(filterItem.key)}
                    aria-pressed={activeStatusFilter === filterItem.key}
                  >
                    {filterItem.label}
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section
            id="requests-list"
            className="requests-list"
            role="tabpanel"
            aria-labelledby="workspace-section-title"
            aria-describedby="workspace-section-subtitle"
            aria-live="polite"
          >
            {activeWorkspaceTab === 'new-orders' ? (
              <RequestsList
                t={t}
                locale={locale}
                requests={requests}
                isLoading={isLoading}
                isError={isError}
                serviceByKey={serviceByKey}
                categoryByKey={categoryByKey}
                cityById={cityById}
                formatDate={formatDate}
                formatPrice={formatPrice}
                isProviderPersonalized={isPersonalized}
                offersByRequest={offersByRequest}
                favoriteRequestIds={favoriteRequestIds}
                onToggleFavorite={onToggleRequestFavorite}
                onSendOffer={onOpenOfferSheet}
                onEditOffer={onOpenOfferSheet}
                onWithdrawOffer={onWithdrawOffer}
                pendingOfferRequestId={pendingOfferRequestId}
                pendingFavoriteRequestIds={pendingFavoriteRequestIds}
                showStaticFavoriteIcon={!isAuthed}
              />
            ) : null}

            {activeWorkspaceTab === 'my-requests' ? (
              <div className="stack-sm">
                <Link href="/request/create" className="card stack-xs no-underline">
                  <p className="text-2xl font-semibold leading-none">+</p>
                  <p className="text-sm font-semibold">Neue Anfrage erstellen</p>
                  <p className="typo-small">Kostenlos · mehrere Angebote</p>
                </Link>
                <WorkspaceContentState
                  isLoading={isMyRequestsLoading}
                  isEmpty={filteredMyRequests.length === 0}
                  emptyTitle="Noch keine passenden Anfragen."
                  emptyHint="Erstelle eine neue Anfrage oder wechsle den Statusfilter."
                  emptyCtaLabel="Neue Anfrage erstellen"
                  emptyCtaHref="/request/create"
                >
                  {filteredMyRequests.map((item) => (
                    <article key={item.id} className="card stack-xs workspace-list-item">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{item.title || item.serviceKey}</p>
                          <p className="typo-small">{item.cityName || item.cityId}</p>
                        </div>
                        <span className={`${getStatusBadgeClass(item.status)} capitalize`}>{item.status}</span>
                      </div>
                      <p className="typo-small">
                        Erstellt: {new Date(item.createdAt).toLocaleDateString(localeTag)}
                      </p>
                      <div className="offer-actions">
                        <Link href={`/requests/${item.id}`} className="badge offer-actions__btn" aria-label={`Anfrage ${item.title || item.serviceKey} ansehen`}>Ansehen</Link>
                        <Link href={`/requests/${item.id}`} className="badge offer-actions__btn" aria-label={`Anfrage ${item.title || item.serviceKey} bearbeiten`}>Bearbeiten</Link>
                        <button
                          type="button"
                          className="btn-ghost offer-actions__btn"
                          onClick={() => {
                            void onDeleteMyRequest(item.id);
                          }}
                          disabled={pendingDeleteRequestId === item.id}
                          aria-label={`Anfrage ${item.title || item.serviceKey} loeschen`}
                        >
                          {pendingDeleteRequestId === item.id ? 'Loeschen...' : 'Loeschen'}
                        </button>
                      </div>
                    </article>
                  ))}
                </WorkspaceContentState>
              </div>
            ) : null}

            {activeWorkspaceTab === 'my-offers' ? (
              <div className="stack-sm">
                <WorkspaceContentState
                  isLoading={isMyOffersLoading}
                  isEmpty={filteredMyOffers.length === 0}
                  emptyTitle="Noch keine passenden Angebote."
                  emptyHint="Noch keine Angebote. Anfrage erstellen oder offene Auftraege ansehen."
                  emptyCtaLabel="Auftraege ansehen"
                  emptyCtaHref="/requests?tab=new-orders"
                >
                  {filteredMyOffers.map((item) => (
                    <article key={item.id} className="card stack-xs workspace-list-item">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{item.requestTitle || item.requestServiceKey}</p>
                          <p className="typo-small">{item.requestCityId ?? '—'}</p>
                        </div>
                        <span className={`${getStatusBadgeClass(item.status)} capitalize`}>{item.status}</span>
                      </div>
                      <p className="typo-small">{typeof item.amount === 'number' ? `€ ${item.amount}` : '€ —'}</p>
                      <div className="offer-actions">
                        <Link href={`/requests/${item.requestId}`} className="badge offer-actions__btn" aria-label="Zugehoerige Anfrage ansehen">Anfrage</Link>
                        <button
                          type="button"
                          className="badge offer-actions__btn"
                          onClick={() => onOpenOfferSheet(item.requestId)}
                          disabled={item.status !== 'sent'}
                          aria-label="Angebot bearbeiten"
                        >
                          Bearbeiten
                        </button>
                        <button
                          type="button"
                          className="btn-ghost offer-actions__btn"
                          onClick={() => {
                            void onWithdrawOffer(item.id);
                          }}
                          disabled={item.status !== 'sent' || pendingOfferRequestId === item.requestId}
                          aria-label="Angebot zurueckziehen"
                        >
                          Zurueckziehen
                        </button>
                      </div>
                    </article>
                  ))}
                </WorkspaceContentState>
              </div>
            ) : null}

            {activeWorkspaceTab === 'completed-jobs' ? (
              <div className="stack-sm">
                <WorkspaceContentState
                  isLoading={isProviderContractsLoading || isClientContractsLoading}
                  isEmpty={filteredContracts.length === 0}
                  emptyTitle="Noch keine passenden Vertraege."
                  emptyHint="Sobald ein Angebot angenommen wird, erscheint es hier."
                  emptyCtaLabel="Meine Angebote"
                  emptyCtaHref="/requests?tab=my-offers"
                >
                  {filteredContracts.map((item) => (
                    <article key={item.id} className="card stack-xs workspace-list-item">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold truncate">Contract #{item.id.slice(-6)}</p>
                        <span className={`${getStatusBadgeClass(item.status)} capitalize`}>{item.status}</span>
                      </div>
                      <p className="typo-small">
                        {item.priceAmount != null ? `€ ${item.priceAmount}` : 'Preis folgt'} ·
                        {' '}
                        {new Date(item.updatedAt).toLocaleDateString(localeTag)}
                      </p>
                      <Link href="/requests?tab=completed-jobs" className="badge offer-actions__btn" aria-label="Vertragsdetails ansehen">Details</Link>
                    </article>
                  ))}
                </WorkspaceContentState>
              </div>
            ) : null}

            {activeWorkspaceTab === 'favorites' ? (
              <div className="stack-sm">
                <WorkspaceContentState
                  isLoading={isFavoriteRequestsLoading || isFavoriteProvidersLoading}
                  isEmpty={favoriteRequests.length + favoriteProviders.length === 0}
                  emptyTitle="Noch keine Favoriten gespeichert."
                  emptyHint="Speichere interessante Anfragen oder Anbieter fuer schnellen Zugriff."
                  emptyCtaLabel="Anfragen entdecken"
                  emptyCtaHref="/requests?tab=new-orders"
                >
                  {favoriteRequests.map((item) => (
                    <article key={`fav-request-${item.id}`} className="card stack-xs workspace-list-item">
                      <p className="text-sm font-semibold truncate">{item.title || item.serviceKey}</p>
                      <Link href={`/requests/${item.id}`} className="badge offer-actions__btn">Anfrage ansehen</Link>
                    </article>
                  ))}
                  {favoriteProviders.map((item) => (
                    <article key={`fav-provider-${item.id}`} className="card stack-xs workspace-list-item">
                      <p className="text-sm font-semibold truncate">{item.displayName || 'Provider'}</p>
                      <Link href={`/providers/${item.id}`} className="badge offer-actions__btn">Profil ansehen</Link>
                    </article>
                  ))}
                </WorkspaceContentState>
              </div>
            ) : null}

            {activeWorkspaceTab === 'reviews' ? (
              <div className="stack-sm">
                <WorkspaceContentState
                  isLoading={isMyReviewsLoading}
                  isEmpty={myReviews.length === 0}
                  emptyTitle="Noch keine Bewertungen vorhanden."
                  emptyHint="Nach abgeschlossenen Auftraegen erscheinen Bewertungen hier."
                  emptyCtaLabel="Auftraege verwalten"
                  emptyCtaHref="/requests?tab=completed-jobs"
                >
                  {myReviews.map((item) => (
                    <article key={item.id} className="card stack-xs workspace-list-item">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold">{item.rating?.toFixed(1) ?? '—'} ★</p>
                        <span className="badge capitalize">{item.targetRole ?? 'all'}</span>
                      </div>
                      <p className="typo-small">{item.text || item.comment || 'Kein Kommentar'}</p>
                      <p className="typo-small">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</p>
                    </article>
                  ))}
                </WorkspaceContentState>
              </div>
            ) : null}
          </section>

          {activeWorkspaceTab === 'new-orders' ? (
            <div className="requests-pagination">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                ←
              </button>
              <span className="typo-small">
                {t(I18N_KEYS.requestsPage.resultsLabel)} {formatNumber.format(totalResults)} •{' '}
                {page}/{totalPages}
              </span>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
              >
                →
              </button>
            </div>
          ) : null}
        </div>

        <aside className="stack-md hide-mobile">
          {isAuthed && hasAnyStatsActivity
            ? statsOrder.map((section) => (
                <RequestsStatsPanel
                  key={section.tab}
                  title={section.title}
                  tabsLabel={{ provider: 'Anbieter', client: 'Kunde' }}
                  tab={section.tab}
                  showTabs={false}
                  provider={providerStatsPayload}
                  client={clientStatsPayload}
                />
              ))
            : null}
          {isProvidersLoading ? (
            <section className="panel hide-mobile top-providers-panel">
              <div className="panel-header">
                <div className="skeleton is-wide h-5 w-40" />
              </div>
              <div className="skeleton is-wide h-4 w-48" />
              <div className="provider-list">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={`provider-skeleton-${index}`} className="provider-card">
                    <UserHeaderCardSkeleton />
                    <div className="skeleton is-wide h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </section>
          ) : isProvidersError ? (
            <section className="panel hide-mobile top-providers-panel">
              <div className="panel-header">
                <div className="skeleton is-wide h-5 w-40" />
              </div>
              <div className="skeleton is-wide h-4 w-48" />
              <div className="provider-list">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={`provider-error-skeleton-${index}`} className="provider-card">
                    <UserHeaderCardSkeleton />
                    <div className="skeleton is-wide h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
              <p className="typo-small text-center mt-3">
                {t(I18N_KEYS.requestsPage.error)}
              </p>
            </section>
          ) : (
            <TopProvidersPanel
              title={t(I18N_KEYS.homePublic.topProviders)}
              subtitle={t(I18N_KEYS.homePublic.topProvidersSubtitle)}
              ctaLabel={t(I18N_KEYS.homePublic.topProvidersCta)}
              ctaHref="/requests"
              providers={topProviders}
              favoriteProviderIds={favoriteProviderIds}
              onToggleFavorite={isAuthed ? onToggleProviderFavorite : undefined}
            />
          )}
        </aside>
      </div>
      {isAuthed ? (
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

function buildLastSixMonthSeries(
  monthFormatter: Intl.DateTimeFormat,
  map: (startTs: number, endTs: number) => { bars: number; line: number },
) {
  const out: Array<{ label: string; bars: number; line: number }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const point = map(start.getTime(), end.getTime());
    out.push({
      label: monthFormatter.format(start),
      bars: point.bars,
      line: point.line,
    });
  }
  return out;
}

function computeProfileCompleteness(profile: {
  displayName?: string | null;
  bio?: string | null;
  cityId?: string | null;
  serviceKeys?: string[];
  basePrice?: number | null;
  companyName?: string | null;
  vatId?: string | null;
  status?: string;
  isBlocked?: boolean;
} | null | undefined) {
  if (!profile) return 0;
  let score = 0;
  if (profile.displayName?.trim()) score += 15;
  if (profile.bio?.trim()) score += 15;
  if (profile.cityId?.trim()) score += 15;
  if ((profile.serviceKeys?.length ?? 0) > 0) score += 25;
  if (typeof profile.basePrice === 'number' && profile.basePrice > 0) score += 10;
  if (profile.companyName?.trim() || profile.vatId?.trim()) score += 10;
  if (profile.status === 'active' && !profile.isBlocked) score += 10;
  return Math.max(0, Math.min(100, score));
}

function computeClientCompleteness(me: {
  name?: string;
  email?: string;
  city?: string;
  phone?: string;
  avatar?: { url?: string };
  acceptedPrivacyPolicy?: boolean;
  clientProfile?: { id?: string; status?: string } | null;
} | null) {
  if (!me) return 0;
  let score = 0;
  if (me.name?.trim()) score += 20;
  if (me.email?.trim()) score += 20;
  if (me.city?.trim()) score += 20;
  if (me.phone?.trim()) score += 15;
  if (me.avatar?.url?.trim()) score += 15;
  if (me.acceptedPrivacyPolicy) score += 5;
  if (me.clientProfile?.id) score += 5;
  return Math.max(0, Math.min(100, score));
}

type DeltaResult =
  | { kind: 'percent'; value: number }
  | { kind: 'new' }
  | { kind: 'none' };

function calcMoMDeltaPercent(current: number, previous: number): DeltaResult {
  if (previous <= 0) {
    if (current <= 0) return { kind: 'none' };
    return { kind: 'new' };
  }
  const raw = ((current - previous) / previous) * 100;
  const rounded = Math.round(raw);
  if (Object.is(rounded, -0) || rounded === 0) return { kind: 'percent', value: 0 };
  return { kind: 'percent', value: rounded };
}

function formatMoMDeltaLabel(delta: DeltaResult, locale: string): string {
  const isDe = locale.startsWith('de');
  if (delta.kind === 'new') {
    return isDe ? 'Neu zum letzten Monat.' : 'New vs last month.';
  }
  if (delta.kind === 'none') {
    return isDe ? '0% zum letzten Monat.' : '0% vs last month.';
  }
  const sign = delta.value > 0 ? '+' : '';
  return isDe ? `${sign}${delta.value}% zum letzten Monat.` : `${sign}${delta.value}% vs last month.`;
}

function countCompletedInMonth(
  contracts: Array<{ completedAt: string | null }>,
  monthOffsetFromNow: number,
) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffsetFromNow, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffsetFromNow + 1, 1);
  const startTs = start.getTime();
  const endTs = end.getTime();
  return contracts.filter((item) => {
    if (!item.completedAt) return false;
    const ts = new Date(item.completedAt).getTime();
    return Number.isFinite(ts) && ts >= startTs && ts < endTs;
  }).length;
}
