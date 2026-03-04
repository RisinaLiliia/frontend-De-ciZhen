'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PublicContent } from '@/features/workspace/requests';
import { listPublicRequests } from '@/lib/api/requests';
import { deleteOffer, listMyProviderOffers } from '@/lib/api/offers';
import { listFavorites } from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useProviderFavoriteToggle, useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import { useRequestsExplorerFilters } from '@/components/requests/useRequestsExplorerFilters';
import { useProvidersExploreData } from '@/components/requests/useProvidersExploreData';
import { RequestsExplorerView } from '@/components/requests/RequestsExplorerView';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';

export type RequestsExplorerProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  contentType?: 'requests' | 'providers';
  backHref?: string;
  emptyCtaHref?: string;
  showBack?: boolean;
  onListDensityChange?: (value: 'single' | 'double') => void;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests?: boolean;
  initialPublicRequestsLoading?: boolean;
  initialPublicRequestsError?: boolean;
};

export function RequestsExplorer({
  t,
  locale,
  contentType = 'requests',
  backHref = '/',
  emptyCtaHref = '/workspace?section=requests',
  showBack = false,
  onListDensityChange,
  initialPublicRequests,
  preferInitialPublicRequests = false,
  initialPublicRequestsLoading = false,
  initialPublicRequestsError = false,
}: RequestsExplorerProps) {
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const isProvidersView = contentType === 'providers';

  const filters = useRequestsExplorerFilters({ t, locale });
  const {
    cities,
    categories,
    services,
    isCategoriesLoading,
    isServicesLoading,
    sortOptions,
    categoryOptions,
    serviceOptions,
    cityOptions,
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    setPage,
    isPending,
    onCategoryChange,
    onSubcategoryChange,
    onCityChange,
    onSortChange,
    onReset,
    appliedFilterChips,
    formatDate,
    formatPrice,
  } = filters;

  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, searchParams]);

  const providersData = useProvidersExploreData({
    locale,
    isAuthed,
    isProvidersView,
    cityId,
    subcategoryKey,
    categoryKey,
    sortBy,
    page,
    limit,
    setPage,
    services,
    cityOptions,
    onListDensityChange,
  });

  const {
    isProvidersLoading,
    isProvidersError,
    providerById,
    favoriteProviderLookup,
    favoriteProviderIds,
    pagedProviders,
    totalProviderPages,
    totalProvidersLabel,
    filteredProvidersCount,
    providersListDensity,
    setProvidersListDensity,
  } = providersData;

  const hasDefaultPublicFilter =
    !filter.cityId &&
    !filter.categoryKey &&
    !filter.subcategoryKey &&
    (filter.sort ?? 'date_desc') === 'date_desc' &&
    (filter.page ?? 1) === 1 &&
    (filter.limit ?? 10) === 10;
  const shouldUseInitialPublicRequests =
    preferInitialPublicRequests && hasDefaultPublicFilter;
  const hasInitialPublicRequests = Boolean(initialPublicRequests);

  const { data: publicRequests, isLoading, isError } = useQuery({
    queryKey: [
      'requests-explorer-public',
      filter.cityId,
      filter.categoryKey,
      filter.subcategoryKey,
      filter.sort,
      filter.page,
      filter.limit,
      locale,
    ],
    enabled:
      !isProvidersView &&
      (!shouldUseInitialPublicRequests ||
        hasInitialPublicRequests ||
        initialPublicRequestsError ||
        !initialPublicRequestsLoading),
    queryFn: () => listPublicRequests({ ...filter, locale }),
    initialData:
      !isProvidersView && shouldUseInitialPublicRequests
        ? initialPublicRequests
        : undefined,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const requests = React.useMemo(() => publicRequests?.items ?? [], [publicRequests?.items]);

  const { data: myOffers = [] } = useQuery({
    queryKey: ['offers-my'],
    enabled: !isProvidersView && isAuthed,
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), [], [401, 403]),
  });

  const offersByRequest = React.useMemo(() => {
    const map = new Map<string, OfferDto>();
    myOffers.forEach((offer) => {
      if (!map.has(offer.requestId) || offer.updatedAt > (map.get(offer.requestId)?.updatedAt ?? '')) {
        map.set(offer.requestId, offer);
      }
    });
    return map;
  }, [myOffers]);

  const requestById = React.useMemo(
    () => new Map(requests.map((request) => [request.id, request])),
    [requests],
  );

  const { data: favoriteRequests = [] } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: !isProvidersView && isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('request'), [], [401, 403]),
  });

  const favoriteRequestIds = React.useMemo(
    () => new Set(favoriteRequests.map((item) => item.id)),
    [favoriteRequests],
  );

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

  const [pendingOfferRequestId, setPendingOfferRequestId] = React.useState<string | null>(null);

  const totalResults = publicRequests?.total ?? requests.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / limit));

  const totalResultsLabel = React.useMemo(
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(totalResults),
    [locale, totalResults],
  );

  const openOfferSheet = React.useCallback(
    (requestId: string) => {
      router.push(`/requests/${requestId}?offer=1`);
    },
    [router],
  );

  const withdrawOffer = React.useCallback(
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

  const onWithdrawOffer = React.useCallback((offerId: string) => {
    void withdrawOffer(offerId);
  }, [withdrawOffer]);

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });

  React.useEffect(() => {
    if (isProvidersView) return;
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [isProvidersView, page, setPage, totalPages]);

  const providersContent = (
    <section className="panel requests-panel">
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
        totalResults={totalProvidersLabel}
        resultsLabel={t(I18N_KEYS.requestsPage.providersResultsLabel)}
        page={page}
        totalPages={totalProviderPages}
        isCategoriesLoading={isCategoriesLoading}
        isServicesLoading={isServicesLoading}
        isPending={isPending}
        appliedChips={appliedFilterChips.filter((chip) => chip.key !== 'sort')}
        onCategoryChange={onCategoryChange}
        onSubcategoryChange={onSubcategoryChange}
        onCityChange={onCityChange}
        onSortChange={onSortChange}
        onReset={onReset}
        listDensity={providersListDensity}
        onListDensityChange={setProvidersListDensity}
        onPrevPage={() => setPage(Math.max(1, page - 1))}
        onNextPage={() => setPage(Math.min(totalProviderPages, page + 1))}
      />

      <section
        id="providers-list"
        className={`requests-list requests-list--stable ${providersListDensity === 'double' ? 'is-double' : 'is-single'}`.trim()}
        aria-live="polite"
      >
        <WorkspaceContentState
          isLoading={isProvidersLoading}
          isEmpty={!isProvidersError && filteredProvidersCount === 0}
          emptyTitle={t(I18N_KEYS.requestsPage.emptyProvidersFilteredTitle)}
          emptyHint={t(I18N_KEYS.requestsPage.emptyProvidersFilteredHint)}
        >
          {pagedProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              variant="list"
              canToggleFavorite
              isFavorite={favoriteProviderIds.has(provider.id)}
              isFavoritePending={pendingFavoriteProviderIds.has(provider.id)}
              onToggleFavorite={(providerId) => {
                void toggleProviderFavorite(providerId);
              }}
              provider={{
                ...mapPublicProviderToCard({
                  t,
                  provider,
                  roleLabel: subcategoryKey !== ALL_OPTION_KEY
                    ? (serviceOptions.find((item) => item.value === subcategoryKey)?.label ?? '')
                    : '',
                  cityLabel: cityOptions.find((item) => item.value === provider.cityId)?.label ?? '',
                  profileHref: `/providers/${provider.id}`,
                  reviewsHref: `/providers/${provider.id}#reviews`,
                  ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
                  status: 'online',
                }),
                reviewPreview: t(I18N_KEYS.homePublic.providerReviewPreviewDefault),
              }}
            />
          ))}
        </WorkspaceContentState>
      </section>

      <div className="requests-pagination">
        <span className="requests-page-nav__label">
          {page}/{Math.max(1, totalProviderPages)}
        </span>
        <div className="requests-page-nav" role="group" aria-label={t(I18N_KEYS.requestsPage.paginationBottomLabel)}>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            aria-label={t(I18N_KEYS.requestsPage.paginationPrev)}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={() => setPage(Math.min(totalProviderPages, page + 1))}
            disabled={page >= totalProviderPages}
            aria-label={t(I18N_KEYS.requestsPage.paginationNext)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );

  const requestsContent = (
    <PublicContent
      t={t}
      filtersProps={{
        t,
        locale,
        categoryOptions,
        serviceOptions,
        cityOptions,
        sortOptions,
        categoryKey,
        subcategoryKey,
        cityId,
        sortBy,
        totalResults: totalResultsLabel,
        isCategoriesLoading,
        isServicesLoading,
        isPending,
        appliedChips: appliedFilterChips,
        onCategoryChange,
        onSubcategoryChange,
        onCityChange,
        onSortChange,
        onReset,
      }}
      statusFilters={[]}
      activeStatusFilter="all"
      onStatusFilterChange={() => {}}
      isLoading={isLoading}
      isError={isError}
      requestsCount={requests.length}
      hasActivePublicFilter={appliedFilterChips.length > 0}
      emptyCtaHref={emptyCtaHref}
      requestsListProps={{
        t,
        locale,
        requests,
        isLoading,
        isError,
        serviceByKey,
        categoryByKey,
        cityById,
        formatDate,
        formatPrice,
        enableOfferActions: isAuthed,
        offersByRequest,
        favoriteRequestIds,
        pendingFavoriteRequestIds,
        onToggleFavorite: (requestId) => {
          void toggleRequestFavorite(requestId);
        },
        onSendOffer: openOfferSheet,
        onEditOffer: openOfferSheet,
        onWithdrawOffer: onWithdrawOffer,
        pendingOfferRequestId,
        showFavoriteButton: true,
      }}
      page={page}
      totalPages={totalPages}
      resultsLabel={t(I18N_KEYS.requestsPage.countLabel)}
      onPrevPage={() => setPage(Math.max(1, page - 1))}
      onNextPage={() => setPage(Math.min(totalPages, page + 1))}
      onListDensityChange={onListDensityChange}
    />
  );

  return (
    <RequestsExplorerView
      isProvidersView={isProvidersView}
      showBack={showBack}
      backHref={backHref}
      providersContent={providersContent}
      requestsContent={requestsContent}
    />
  );
}
