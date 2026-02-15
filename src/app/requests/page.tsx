'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { PersonalNavSection } from '@/components/layout/PersonalNavSection';
import { HeroSection } from '@/components/ui/HeroSection';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestsList } from '@/components/requests/RequestsList';
import {
  listPublicRequests,
  type PublicRequestsSort,
} from '@/lib/api/requests';
import { listPublicProviders } from '@/lib/api/providers';
import { deleteOffer, listMyProviderOffers } from '@/lib/api/offers';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { TopProvidersPanel } from '@/components/providers/TopProvidersPanel';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { IconBriefcase, IconSend, IconUser } from '@/components/ui/icons/icons';
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

function RequestsPageContent() {
  const router = useRouter();
  const qc = useQueryClient();
  const t = useT();
  const { locale } = useI18n();
  const auth = useAuthSnapshot();
  const authStatus = auth.status;
  const isAuthed = authStatus === 'authenticated';
  const isPersonalized = isAuthed;

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

  const { data: myOffers = [] } = useQuery({
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

  const { data: favoriteRequests = [] } = useQuery({
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

  const { data: favoriteProviders = [] } = useQuery({
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

  const sentCount = React.useMemo(
    () => myOffers.filter((offer) => offer.status === 'sent').length,
    [myOffers],
  );
  const acceptedCount = React.useMemo(
    () => myOffers.filter((offer) => offer.status === 'accepted').length,
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

  const newOrdersCount = Math.max(0, totalAllRequests - seenTotal);
  const resolvedName = auth.user?.name?.trim() || 'User';
  const navTitle = `${t(I18N_KEYS.requestsPage.navGreeting)}, ${resolvedName}!`;
  const completedMonthly = acceptedCount;
  const insightText = `${t(I18N_KEYS.requestsPage.navInsightClosedPrefix)} ${completedMonthly} ${t(
    I18N_KEYS.requestsPage.navInsightClosedSuffix,
  )} ${t(I18N_KEYS.requestsPage.navInsightDelta)}`;
  const activityBase = sentCount + acceptedCount;
  const activityProgress = activityBase > 0 ? Math.round((acceptedCount / activityBase) * 100) : 12;
  const navRatingValue = providers[0]?.ratingAvg?.toFixed(1) ?? '4.9';
  const navReviewsCount = providers[0]?.ratingCount ?? 0;
  const personalNavItems = React.useMemo(
    () =>
      isPersonalized
        ? [
            {
              key: 'new-orders',
              href: '/requests',
              label: t(I18N_KEYS.requestsPage.navNewOrders),
              icon: <IconBriefcase />,
              value: newOrdersCount,
              hint: t(I18N_KEYS.requestsPage.resultsLabel),
              onClick: markNewOrdersSeen,
              match: 'prefix' as const,
            },
            {
              key: 'my-orders',
              href: '/provider/contracts',
              label: t(I18N_KEYS.requestsPage.navMyOrders),
              icon: <IconBriefcase />,
              value: acceptedCount,
              hint: t(I18N_KEYS.requestsPage.summaryAccepted),
              match: 'prefix' as const,
            },
            {
              key: 'my-offers',
              href: '/provider',
              label: t(I18N_KEYS.requestsPage.navMyOffers),
              icon: <IconSend />,
              value: sentCount,
              hint: t(I18N_KEYS.requestsPage.summarySent),
              match: 'prefix' as const,
            },
            {
              key: 'reviews',
              href: '/provider/profile',
              label: t(I18N_KEYS.requestsPage.navReviews),
              icon: <IconUser />,
              rating: {
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              match: 'prefix' as const,
            },
          ]
        : [
            {
              key: 'new-orders',
              href: '/requests',
              label: t(I18N_KEYS.requestsPage.navNewOrders),
              icon: <IconBriefcase />,
              value: newOrdersCount,
              hint: t(I18N_KEYS.requestsPage.resultsLabel),
              onClick: markNewOrdersSeen,
              match: 'prefix' as const,
            },
            {
              key: 'my-orders',
              href: '/client/contracts',
              label: t(I18N_KEYS.requestsPage.navMyOrders),
              icon: <IconBriefcase />,
              hint: t(I18N_KEYS.requestsPage.summaryAccepted),
              match: 'prefix' as const,
            },
            {
              key: 'my-offers',
              href: '/client/requests',
              label: t(I18N_KEYS.requestsPage.navMyOffers),
              icon: <IconSend />,
              hint: t(I18N_KEYS.requestsPage.summarySent),
              match: 'prefix' as const,
            },
            {
              key: 'reviews',
              href: '/client/profile',
              label: t(I18N_KEYS.requestsPage.navReviews),
              icon: <IconUser />,
              rating: {
                value: navRatingValue,
                reviewsCount: navReviewsCount,
                reviewsLabel: t(I18N_KEYS.homePublic.reviews),
              },
              match: 'prefix' as const,
            },
          ],
    [
      acceptedCount,
      isPersonalized,
      markNewOrdersSeen,
      navRatingValue,
      navReviewsCount,
      newOrdersCount,
      sentCount,
      t,
    ],
  );

  return (
    <PageShell right={<AuthActions />} showBack={isAuthed} mainClassName="py-6 requests-screen">
      {isAuthed ? (
        <PersonalNavSection
          title={navTitle}
          items={personalNavItems}
          insightText={insightText}
          progressPercent={activityProgress}
        />
      ) : null}
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
          {isAuthed ? (
            <section className="panel requests-provider-summary requests-provider-summary--aside">
              <div className="requests-provider-summary__stats">
                <span>
                  <strong>{sentCount}</strong> {t(I18N_KEYS.requestsPage.summarySent)}
                </span>
                <span>
                  <strong>{acceptedCount}</strong> {t(I18N_KEYS.requestsPage.summaryAccepted)}
                </span>
              </div>
              <Link href="/requests#requests-list" className="btn-ghost is-primary">
                {t(I18N_KEYS.requestsPage.summaryCta)}
              </Link>
            </section>
          ) : null}
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
              favoriteProviderIds={favoriteProviderIds}
              onToggleFavorite={isAuthed ? onToggleProviderFavorite : undefined}
            />
          )}
        </aside>
      </div>
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
