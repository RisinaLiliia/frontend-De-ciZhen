'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { HeroSection } from '@/components/ui/HeroSection';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestsList } from '@/components/requests/RequestsList';
import {
  listPublicRequests,
  type PublicRequestsSort,
} from '@/lib/api/requests';
import { listPublicProviders } from '@/lib/api/providers';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { TopProvidersPanel } from '@/components/providers/TopProvidersPanel';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
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

export default function RequestsPage() {
  const t = useT();
  const { locale } = useI18n();
  const authStatus = useAuthStatus();

  const { data: cities = [], isLoading: isCitiesLoading } = useCities('DE');
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
        .sort((a, b) => a.sortOrder - b.sortOrder)
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
        reviewsLabel,
        ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
        profileHref: `/providers/${provider.id}`,
        reviewsHref: `/providers/${provider.id}#reviews`,
      };
    });
  }, [providers, t]);

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

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);

  const createRequestHref =
    authStatus === 'authenticated'
      ? '/request/create'
      : '/auth/login?next=/request/create&role=client';

  return (
    <PageShell right={<AuthActions />} showBack={false} mainClassName="py-6 requests-screen">
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

      <div className="requests-grid">
        <div className="stack-md">
          {/* <HomeStatsPanel t={t} stats={stats} formatNumber={formatNumber} /> */}
          <section className="panel requests-panel">
            <div className="requests-header">
              <div className="section-heading">
                <p className="section-title">{t(I18N_KEYS.requestsPage.title)}</p>
                <p className="section-subtitle">{t(I18N_KEYS.requestsPage.subtitle)}</p>
              </div>
            </div>

            <RequestsFilters
              t={t}
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
              isCitiesLoading={isCitiesLoading}
              onCategoryChange={onCategoryChange}
              onSubcategoryChange={onSubcategoryChange}
              onCityChange={onCityChange}
              onSortChange={onSortChange}
              onReset={onReset}
            />
          </section>

          <section id="requests-list" className="requests-list">
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
            />
          </section>

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
        </div>

        <aside className="stack-md hide-mobile">
          {isProvidersLoading ? (
            <section className="panel hide-mobile top-providers-panel">
              <div className="panel-header">
                <div className="skeleton is-wide h-5 w-40" />
              </div>
              <div className="skeleton is-wide h-4 w-48" />
              <div className="provider-list">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={`provider-skeleton-${index}`} className="provider-card">
                    <div className="provider-info">
                      <div className="provider-avatar-wrap">
                        <div className="skeleton is-wide h-12 w-12 rounded-full" />
                      </div>
                      <div className="provider-main">
                        <div className="skeleton is-wide h-4 w-24" />
                        <div className="skeleton is-wide h-3 w-20" />
                        <div className="skeleton is-wide h-3 w-16" />
                      </div>
                    </div>
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
                    <div className="provider-info">
                      <div className="provider-avatar-wrap">
                        <div className="skeleton is-wide h-12 w-12 rounded-full" />
                      </div>
                      <div className="provider-main">
                        <div className="skeleton is-wide h-4 w-24" />
                        <div className="skeleton is-wide h-3 w-20" />
                        <div className="skeleton is-wide h-3 w-16" />
                      </div>
                    </div>
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
            />
          )}
        </aside>
      </div>
    </PageShell>
  );
}
