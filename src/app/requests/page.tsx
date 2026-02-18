'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { PersonalNavSection } from '@/components/layout/PersonalNavSection';
import { HeroSection } from '@/components/ui/HeroSection';
import { RequestsStatsPanel } from '@/components/requests/RequestsStatsPanel';
import { ProofReviewCard } from '@/components/reviews/ProofReviewCard';
import { UserHeaderCardSkeleton } from '@/components/ui/UserHeaderCardSkeleton';
import {
  deleteMyRequest,
  getPublicRequestById,
} from '@/lib/api/requests';
import { deleteOffer } from '@/lib/api/offers';
import { addFavorite, removeFavorite } from '@/lib/api/favorites';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { TopProvidersPanel } from '@/components/providers/TopProvidersPanel';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { trackUXEvent } from '@/lib/analytics';
import {
  ALL_OPTION_KEY,
  NEW_ORDERS_SEEN_TOTAL_KEY_PREFIX,
  SORT_OPTIONS,
} from '@/features/requests/page/public';
import {
  ORDERS_TAB_STORAGE_KEY,
  mapContractStatusToFilter,
  mapOfferStatusToFilter,
  mapRequestStatusToFilter,
  resolveFavoritesView,
  resolveReviewsView,
  resolveStatusFilter,
  resolveWorkspaceTab,
  type FavoritesView,
  type ReviewsView,
  type WorkspaceStatusFilter,
  type WorkspaceTab,
} from '@/features/requests/page/workspace';
import { PublicContent } from '@/features/requests/page/PublicContent';
import { WorkspaceContent } from '@/features/requests/page/WorkspaceContent';
import { useRequestsPageViewModel } from '@/features/requests/page/useRequestsPageViewModel';
import { useRequestsPageData } from '@/features/requests/page/useRequestsPageData';
import { useContractRequestsData } from '@/features/requests/page/useContractRequestsData';
import { useRequestsWorkspaceState } from '@/features/requests/page/useRequestsWorkspaceState';

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
  const isWorkspaceRoute = pathname === '/orders';
  const isWorkspaceAuthed = isWorkspaceRoute && isAuthed;
  const isPersonalized = isAuthed;
  const activeWorkspaceTab = React.useMemo(
    () => (isWorkspaceRoute ? resolveWorkspaceTab(searchParams.get('tab')) : 'new-orders'),
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
    isAuthed,
    isWorkspaceAuthed,
    activeReviewsView,
    cityId,
    subcategoryKey,
  });

  const requests = publicRequests?.items ?? [];
  const totalResults = publicRequests?.total ?? requests.length;
  const totalAllRequests = allRequestsSummary?.total ?? totalResults;
  const totalPages = Math.max(1, Math.ceil(totalResults / limit));

  React.useEffect(() => {
    if (activeWorkspaceTab !== 'new-orders') return;
    if (isLoading || isError || requests.length > 0) return;
    trackUXEvent('workspace_empty_result', {
      tab: 'new-orders',
      hasFilters: hasActivePublicFilter,
      cityId: cityId === ALL_OPTION_KEY ? null : cityId,
      categoryKey: categoryKey === ALL_OPTION_KEY ? null : categoryKey,
      subcategoryKey: subcategoryKey === ALL_OPTION_KEY ? null : subcategoryKey,
      sortBy,
    });
  }, [
    activeWorkspaceTab,
    categoryKey,
    cityId,
    hasActivePublicFilter,
    isError,
    isLoading,
    requests.length,
    sortBy,
    subcategoryKey,
  ]);

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

  const createRequestHref = '/auth/login?next=/request/create';
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

  React.useEffect(() => {
    if (typeof window === 'undefined' || !isWorkspaceAuthed) return;
    const hasTabInQuery = Boolean(searchParams.get('tab'));
    if (hasTabInQuery) return;
    const storedTab = window.localStorage.getItem(ORDERS_TAB_STORAGE_KEY);
    const nextTab = resolveWorkspaceTab(storedTab);
    if (!nextTab || nextTab === 'new-orders') return;
    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', nextTab);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [isWorkspaceAuthed, pathname, router, searchParams]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !isWorkspaceAuthed) return;
    window.localStorage.setItem(ORDERS_TAB_STORAGE_KEY, activeWorkspaceTab);
  }, [activeWorkspaceTab, isWorkspaceAuthed]);

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
      next.set('tab', 'reviews');
      next.set('reviewRole', view);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const newOrdersCount = Math.max(0, totalAllRequests - seenTotal);
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
  const myOfferRequests = React.useMemo(() => {
    const fallbackDate = new Date().toISOString();
    const items: Awaited<ReturnType<typeof getPublicRequestById>>[] = [];
    const seen = new Set<string>();

    filteredMyOffers.forEach((offer) => {
      if (!offer.requestId || seen.has(offer.requestId)) return;
      seen.add(offer.requestId);
      const request = myOfferRequestsById.get(offer.requestId);
      if (request) {
        items.push(request);
        return;
      }
      items.push({
        id: offer.requestId,
        serviceKey: offer.requestServiceKey || 'service',
        cityId: offer.requestCityId || 'city',
        cityName: offer.requestCityId || null,
        categoryKey: null,
        categoryName: null,
        subcategoryName: offer.requestServiceKey || null,
        propertyType: 'apartment',
        area: 0,
        price: typeof offer.amount === 'number' ? offer.amount : null,
        preferredDate: offer.requestPreferredDate || offer.updatedAt || offer.createdAt || fallbackDate,
        isRecurring: false,
        title: offer.requestServiceKey || null,
        description: offer.message || null,
        photos: null,
        imageUrl: null,
        tags: null,
        clientId: offer.clientUserId,
        clientName: null,
        clientAvatarUrl: null,
        clientCity: null,
        clientRatingAvg: null,
        clientRatingCount: null,
        clientIsOnline: null,
        clientLastSeenAt: null,
        status: (offer.requestStatus === 'matched'
          ? 'matched'
          : offer.requestStatus === 'closed'
            ? 'closed'
            : offer.requestStatus === 'cancelled'
              ? 'cancelled'
              : offer.requestStatus === 'draft'
                ? 'draft'
                : offer.requestStatus === 'paused'
                  ? 'paused'
                  : 'published'),
        createdAt: offer.createdAt,
      });
    });

    return items;
  }, [filteredMyOffers, myOfferRequestsById]);
  const filteredContracts = React.useMemo(
    () =>
      allMyContracts.filter(
        (item) =>
          activeStatusFilter === 'all' || mapContractStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, allMyContracts],
  );
  const { contractRequests, contractOffersByRequest } = useContractRequestsData({
    filteredContracts,
    isWorkspaceAuthed,
  });
  const hasFavoriteRequests = favoriteRequests.length > 0;
  const hasFavoriteProviders = favoriteProviders.length > 0;
  const areFavoritesLoaded = !isFavoriteRequestsLoading && !isFavoriteProvidersLoading;
  const resolvedFavoritesView = React.useMemo<FavoritesView>(() => {
    if (
      areFavoritesLoaded &&
      activeFavoritesView === 'requests' &&
      !hasFavoriteRequests &&
      hasFavoriteProviders
    ) {
      return 'providers';
    }
    return activeFavoritesView;
  }, [activeFavoritesView, areFavoritesLoaded, hasFavoriteProviders, hasFavoriteRequests]);
  const favoritesItems = resolvedFavoritesView === 'requests' ? favoriteRequests : favoriteProviders;
  const isFavoritesLoading = resolvedFavoritesView === 'requests' ? isFavoriteRequestsLoading : isFavoriteProvidersLoading;
  const favoriteProviderCards = React.useMemo(
    () =>
      favoriteProviders.map((item) => (
        <article key={`fav-provider-${item.id}`} className="card stack-xs workspace-list-item">
          <p className="text-sm font-semibold truncate">{item.displayName || 'Provider'}</p>
          <Link href={`/providers/${item.id}`} className="badge offer-actions__btn">
            Profil ansehen
          </Link>
        </article>
      )),
    [favoriteProviders],
  );
  const reviewCards = React.useMemo(
    () =>
      myReviews.map((item) => {
        const role = item.targetRole ?? activeReviewsView;
        const roleLabel = role === 'client' ? 'Als Kunde' : 'Als Anbieter';
        const createdLabel = item.createdAt ? new Date(item.createdAt).toLocaleDateString(localeTag) : '—';
        const author = item.authorName?.trim() || 'Bewertung';
        const reviewText = item.text || item.comment || 'Kein Kommentar';
        return (
          <ProofReviewCard
            key={item.id}
            title={author}
            info={createdLabel}
            review={`“${reviewText}”`}
            rating={item.rating?.toFixed(1) ?? '—'}
            price={roleLabel}
            isActive
          />
        );
      }),
    [activeReviewsView, localeTag, myReviews],
  );
  const showWorkspaceHeader = activeWorkspaceTab !== 'favorites';
  const showWorkspaceHeading =
    showWorkspaceHeader && activeWorkspaceTab !== 'new-orders';
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
      return { label: 'Neue Auftraege finden', href: '/orders?tab=new-orders' };
    }
    if (activeWorkspaceTab === 'completed-jobs') {
      return { label: 'Aktive Auftraege', href: '/orders?tab=my-offers&status=in_progress' };
    }
    if (activeWorkspaceTab === 'favorites') {
      return { label: 'Neue Favoriten', href: '/orders?tab=new-orders' };
    }
    if (activeWorkspaceTab === 'reviews') {
      return { label: 'Meine Auftraege', href: '/orders?tab=my-offers' };
    }
    return { label: 'Neue Anfrage erstellen', href: '/request/create' };
  }, [activeWorkspaceTab]);
  const {
    topProviders,
    navTitle,
    activityProgress,
    personalNavItems,
    insightText,
    hasAnyStatsActivity,
    providerStatsPayload,
    clientStatsPayload,
    statsOrder,
  } = useRequestsWorkspaceState({
    t,
    locale,
    isPersonalized,
    activeWorkspaceTab,
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
    markNewOrdersSeen,
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

  if (isWorkspaceRoute && authStatus !== 'authenticated') {
    return null;
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
          mediaSrc="/Handwerker%20in%20einem%20modernen%20Wohnzimmer.jpg"
        />
      ) : null}

      <div className="requests-grid">
        <div className="stack-md">
          {isWorkspaceAuthed ? (
            <PersonalNavSection
              className="personal-nav--left"
              title={navTitle}
              items={personalNavItems}
              insightText={insightText}
              progressPercent={activityProgress}
            />
          ) : null}
          {/* <HomeStatsPanel t={t} stats={stats} formatNumber={formatNumber} /> */}
          {isWorkspaceAuthed ? <WorkspaceContent {...workspaceContentProps} /> : <PublicContent {...publicContentProps} />}
        </div>

        <aside className="stack-md hide-mobile">
          {isWorkspaceAuthed && hasAnyStatsActivity
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
      {isWorkspaceAuthed &&
      activeWorkspaceTab !== 'new-orders' &&
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
