'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PublicContent } from '@/features/requests/page/PublicContent';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { listPublicRequests } from '@/lib/api/requests';
import { listPublicProviders } from '@/lib/api/providers';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { pickI18n } from '@/lib/i18n/helpers';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { ALL_OPTION_KEY, SORT_OPTIONS } from '@/features/requests/page/public';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import { listReviews } from '@/lib/api/reviews';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type OrdersExplorerProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  contentType?: 'requests' | 'providers';
  backHref?: string;
  emptyCtaHref?: string;
  showBack?: boolean;
  onListDensityChange?: (value: 'single' | 'double') => void;
};

export function OrdersExplorer({
  t,
  locale,
  contentType = 'requests',
  backHref = '/',
  emptyCtaHref = '/workspace?section=orders',
  showBack = false,
  onListDensityChange,
}: OrdersExplorerProps) {
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [pendingFavoriteProviderIds, setPendingFavoriteProviderIds] = React.useState<Set<string>>(
    () => new Set(),
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
    isPending,
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

  const appliedFilterChips = React.useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (cityId !== ALL_OPTION_KEY) {
      const cityLabel = cityOptions.find((option) => option.value === cityId)?.label ?? cityId;
      chips.push({
        key: 'city',
        label: cityLabel,
        onRemove: () => onCityChange(ALL_OPTION_KEY),
      });
    }
    if (categoryKey !== ALL_OPTION_KEY) {
      const categoryLabel = categoryOptions.find((option) => option.value === categoryKey)?.label ?? categoryKey;
      chips.push({
        key: 'category',
        label: categoryLabel,
        onRemove: () => onCategoryChange(ALL_OPTION_KEY),
      });
    }
    if (subcategoryKey !== ALL_OPTION_KEY) {
      const serviceLabel = serviceOptions.find((option) => option.value === subcategoryKey)?.label ?? subcategoryKey;
      chips.push({
        key: 'service',
        label: serviceLabel,
        onRemove: () => onSubcategoryChange(ALL_OPTION_KEY),
      });
    }
    if (sortBy !== 'date_desc') {
      const sortLabel = sortOptions.find((option) => option.value === sortBy)?.label ?? sortBy;
      chips.push({
        key: 'sort',
        label: sortLabel,
        onRemove: () => onSortChange('date_desc'),
      });
    }
    return chips;
  }, [
    categoryKey,
    categoryOptions,
    cityId,
    cityOptions,
    onCategoryChange,
    onCityChange,
    onSortChange,
    onSubcategoryChange,
    serviceOptions,
    sortBy,
    sortOptions,
    subcategoryKey,
  ]);

  const isProvidersView = contentType === 'providers';
  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, searchParams]);

  const { data: publicRequests, isLoading, isError } = useQuery({
    queryKey: [
      'orders-explorer-public',
      filter.cityId,
      filter.categoryKey,
      filter.subcategoryKey,
      filter.sort,
      filter.page,
      filter.limit,
      locale,
    ],
    enabled: !isProvidersView,
    queryFn: () => listPublicRequests({ ...filter, locale }),
  });

  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useQuery({
    queryKey: ['orders-explorer-providers', cityId, subcategoryKey],
    enabled: isProvidersView,
    queryFn: () =>
      listPublicProviders({
        cityId: cityId === ALL_OPTION_KEY ? undefined : cityId,
        serviceKey: subcategoryKey === ALL_OPTION_KEY ? undefined : subcategoryKey,
      }),
  });
  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: isProvidersView && isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), [], [401, 403]),
  });
  const favoriteProviderIds = React.useMemo(
    () => new Set(favoriteProviders.map((item) => item.id)),
    [favoriteProviders],
  );

  const requests = publicRequests?.items ?? [];
  const totalResults = publicRequests?.total ?? requests.length;
  const categoryServiceKeys = React.useMemo(() => {
    if (categoryKey === ALL_OPTION_KEY) return null;
    const keys = services
      .filter((service) => service.categoryKey === categoryKey)
      .map((service) => service.key);
    return new Set(keys);
  }, [categoryKey, services]);

  const filteredProviders = React.useMemo(() => {
    const getProviderServiceKeys = (provider: (typeof providers)[number]) => {
      const direct = (provider as { serviceKey?: string | null }).serviceKey;
      const list = (provider as { serviceKeys?: string[] | null }).serviceKeys;
      const values = [
        ...(Array.isArray(list) ? list : []),
        ...(typeof direct === 'string' && direct.trim().length > 0 ? [direct] : []),
      ]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value));
      return new Set(values);
    };
    const selectedCityLabel =
      cityId !== ALL_OPTION_KEY
        ? cityOptions.find((option) => option.value === cityId)?.label?.trim().toLowerCase()
        : '';

    return providers.filter((provider) => {
      if (cityId !== ALL_OPTION_KEY) {
        const providerCityId = (provider as { cityId?: string | null }).cityId ?? '';
        const providerCityName = (
          (provider as { cityName?: string | null }).cityName ??
          (provider as { city?: string | null }).city ??
          ''
        )
          .trim()
          .toLowerCase();
        const matchesById = providerCityId === cityId;
        const matchesByName = Boolean(selectedCityLabel) && providerCityName === selectedCityLabel;
        if (!matchesById && !matchesByName) return false;
      }

      const providerServiceKeys = getProviderServiceKeys(provider);
      if (subcategoryKey !== ALL_OPTION_KEY) {
        return providerServiceKeys.has(subcategoryKey);
      }
      if (categoryServiceKeys) {
        if (providerServiceKeys.size === 0) return false;
        for (const key of providerServiceKeys) {
          if (categoryServiceKeys.has(key)) return true;
        }
        return false;
      }
      return true;
    });
  }, [categoryServiceKeys, cityId, cityOptions, providers, subcategoryKey]);

  const totalProviders = filteredProviders.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / limit));
  const totalProviderPages = Math.max(1, Math.ceil(totalProviders / limit));
  const totalResultsLabel = React.useMemo(
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(totalResults),
    [locale, totalResults],
  );
  const totalProvidersLabel = React.useMemo(
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(totalProviders),
    [locale, totalProviders],
  );
  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        day: '2-digit',
        month: 'short',
      }),
    [locale],
  );
  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });

  React.useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, setPage, totalPages]);

  const [providersListDensity, setProvidersListDensity] = React.useState<'single' | 'double'>('single');
  React.useEffect(() => {
    if (!isProvidersView) return;
    onListDensityChange?.(providersListDensity);
  }, [isProvidersView, onListDensityChange, providersListDensity]);

  React.useEffect(() => {
    if (!isProvidersView) return;
    if (page <= totalProviderPages) return;
    setPage(totalProviderPages);
  }, [isProvidersView, page, setPage, totalProviderPages]);

  const sortedProviders = React.useMemo(() => {
    const copy = [...filteredProviders];
    copy.sort((a, b) => {
      if (sortBy === 'date_asc') return a.ratingAvg - b.ratingAvg;
      if (sortBy === 'price_asc') return (a.basePrice ?? 0) - (b.basePrice ?? 0);
      if (sortBy === 'price_desc') return (b.basePrice ?? 0) - (a.basePrice ?? 0);
      return b.ratingAvg - a.ratingAvg;
    });
    return copy;
  }, [filteredProviders, sortBy]);

  const pagedProviders = React.useMemo(() => {
    const start = (Math.max(1, page) - 1) * limit;
    return sortedProviders.slice(start, start + limit);
  }, [limit, page, sortedProviders]);
  const handleToggleProviderFavorite = React.useCallback(
    async (providerId: string) => {
      if (!isAuthed) {
        router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
        toast.message(t(I18N_KEYS.requestDetails.favoritesSoon));
        return;
      }
      if (pendingFavoriteProviderIds.has(providerId)) return;
      const isSaved = favoriteProviderIds.has(providerId);
      setPendingFavoriteProviderIds((prev) => {
        const next = new Set(prev);
        next.add(providerId);
        return next;
      });
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
      } finally {
        setPendingFavoriteProviderIds((prev) => {
          const next = new Set(prev);
          next.delete(providerId);
          return next;
        });
      }
    },
    [favoriteProviderIds, isAuthed, nextPath, pendingFavoriteProviderIds, qc, router, t],
  );

  const providerIdsForPage = React.useMemo(() => pagedProviders.map((provider) => provider.id), [pagedProviders]);
  const { data: providerReviewPreviewById = new Map<string, string>() } = useQuery({
    queryKey: ['orders-explorer-provider-review-preview', ...providerIdsForPage],
    enabled: isProvidersView && providerIdsForPage.length > 0,
    queryFn: async () => {
      const pairs = await Promise.all(
        providerIdsForPage.map(async (providerId) => {
          try {
            const reviews = await listReviews({ targetUserId: providerId, targetRole: 'provider', limit: 1, offset: 0 });
            const first = reviews[0];
            const text = first?.text?.trim() || first?.comment?.trim() || '';
            return [providerId, text] as const;
          } catch {
            return [providerId, ''] as const;
          }
        }),
      );
      const map = new Map<string, string>();
      for (const [id, text] of pairs) {
        if (text) map.set(id, text);
      }
      return map;
    },
  });

  if (isProvidersView) {
    return (
      <section className="stack-sm">
        {showBack ? (
          <Link href={backHref} className="back-button w-fit" prefetch={false}>
            <span aria-hidden="true">←</span>
            <span className="back-button__label">{t(I18N_KEYS.common.back)}</span>
          </Link>
        ) : null}

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
              isEmpty={!isProvidersError && filteredProviders.length === 0}
              emptyTitle={t(I18N_KEYS.requestsPage.emptyProvidersFilteredTitle)}
              emptyHint={t(I18N_KEYS.requestsPage.emptyProvidersFilteredHint)}
            >
              {pagedProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  variant="list"
                  canToggleFavorite
                  isFavorite={favoriteProviderIds.has(provider.id)}
                  onToggleFavorite={(providerId) => {
                    void handleToggleProviderFavorite(providerId);
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
                    reviewPreview:
                      providerReviewPreviewById.get(provider.id) ?? t(I18N_KEYS.homePublic.providerReviewPreviewDefault),
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
      </section>
    );
  }

  return (
    <section className="stack-sm">
      {showBack ? (
        <Link href={backHref} className="back-button w-fit" prefetch={false}>
          <span aria-hidden="true">←</span>
          <span className="back-button__label">{t(I18N_KEYS.common.back)}</span>
        </Link>
      ) : null}
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
          showStaticFavoriteIcon: true,
        }}
        page={page}
        totalPages={totalPages}
        resultsLabel={t(I18N_KEYS.requestsPage.countLabel)}
        onPrevPage={() => setPage(Math.max(1, page - 1))}
        onNextPage={() => setPage(Math.min(totalPages, page + 1))}
        onListDensityChange={onListDensityChange}
      />
    </section>
  );
}
