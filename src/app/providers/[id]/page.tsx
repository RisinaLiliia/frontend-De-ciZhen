'use client';

import * as React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import {
  RequestDetailAbout,
  RequestDetailAside,
  RequestDetailError,
  RequestDetailHeader,
  RequestDetailLoading,
  RequestDetailMobileCta,
} from '@/components/requests/details';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { getStatusBadgeClass } from '@/lib/statusBadge';
import { getPublicProviderById, listPublicProviders } from '@/lib/api/providers';
import { listReviews } from '@/lib/api/reviews';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { apiGet } from '@/lib/api/http';
import { listServices } from '@/lib/api/catalog';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';

const SIMILAR_LIMIT = 2;

type GeoAutocompleteItem = {
  lat?: number;
  lng?: number;
};

type GeoAutocompleteResponse = {
  items: GeoAutocompleteItem[];
};

function getProviderServiceKeys(provider: ProviderPublicDto) {
  const direct = provider.serviceKey;
  const list = provider.serviceKeys;
  return Array.from(
    new Set(
      [
        ...(Array.isArray(list) ? list : []),
        ...(typeof direct === 'string' && direct.trim().length > 0 ? [direct] : []),
      ]
        .map((value) => value?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function getProviderCityKey(provider: ProviderPublicDto): string {
  const byId = (provider.cityId ?? '').trim().toLowerCase();
  if (byId) return `id:${byId}`;
  const byName = (provider.cityName ?? '').trim().toLowerCase();
  if (byName) return `name:${byName}`;
  return '';
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return r * c;
}

export default function ProviderPublicProfilePage() {
  const t = useT();
  const { locale } = useI18n();
  const authStatus = useAuthStatus();
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const isAuthed = authStatus === 'authenticated';

  const {
    data: providers = [],
  } = useQuery({
    queryKey: ['provider-public-list'],
    queryFn: () => listPublicProviders(),
  });

  const {
    data: provider,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['provider-detail', id],
    enabled: Boolean(id),
    queryFn: () => getPublicProviderById(String(id)),
  });

  const providerTargetUserId = React.useMemo(
    () => (provider?.userId && provider.userId.trim().length > 0 ? provider.userId : provider?.id ?? null),
    [provider?.id, provider?.userId],
  );

  const { data: services = [] } = useQuery({
    queryKey: ['catalog-services-all'],
    queryFn: () => listServices(),
  });

  const serviceCategoryByKey = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const service of services) {
      const key = service?.key?.trim().toLowerCase();
      const categoryKey = service?.categoryKey?.trim().toLowerCase();
      if (key && categoryKey) map.set(key, categoryKey);
    }
    return map;
  }, [services]);

  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: ['provider-reviews', providerTargetUserId],
    enabled: Boolean(providerTargetUserId),
    queryFn: () =>
      listReviews({
        targetUserId: String(providerTargetUserId),
        targetRole: 'provider',
        limit: 250,
        offset: 0,
      }),
  });
  const reviewsForUi = reviews;

  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), [], [401, 403]),
  });

  const isSaved = React.useMemo(() => {
    if (!provider) return false;
    return favoriteProviders.some((item) => item.id === provider.id);
  }, [favoriteProviders, provider]);

  const setProviderFavorite = React.useCallback(
    async (nextSaved: boolean) => {
      if (!provider) return;

      qc.setQueryData<ProviderPublicDto[]>(['favorite-providers'], (prev) => {
        const list = prev ? [...prev] : [];
        const exists = list.some((item) => item.id === provider.id);
        if (nextSaved && !exists) return [provider, ...list];
        if (!nextSaved && exists) return list.filter((item) => item.id !== provider.id);
        return list;
      });

      try {
        if (nextSaved) {
          await addFavorite('provider', provider.id);
          toast.success(t(I18N_KEYS.requestDetails.saved));
        } else {
          await removeFavorite('provider', provider.id);
          toast.message(t(I18N_KEYS.requestDetails.favoritesRemoved));
        }
      } catch {
        qc.setQueryData<ProviderPublicDto[]>(['favorite-providers'], (prev) => {
          const list = prev ? [...prev] : [];
          const exists = list.some((item) => item.id === provider.id);
          if (!nextSaved && !exists) return [provider, ...list];
          if (nextSaved && exists) return list.filter((item) => item.id !== provider.id);
          return list;
        });
        toast.error(t(I18N_KEYS.requestDetails.favoritesFailed));
      }
    },
    [provider, qc, t],
  );

  const nextPath = pathname || `/providers/${id}`;

  const requireAuth = React.useCallback(() => {
    router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
    toast.message(t(I18N_KEYS.requestDetails.loginRequired));
  }, [nextPath, router, t]);

  const handleApply = React.useCallback(() => {
    if (!id) return;
    if (!isAuthed) {
      requireAuth();
      return;
    }
    router.push(`/requests/create?providerId=${id}`);
  }, [id, isAuthed, requireAuth, router]);

  const handleChat = React.useCallback(() => {
    if (!id) return;
    if (!isAuthed) {
      requireAuth();
      return;
    }
    router.push(`/chat?provider=${id}`);
  }, [id, isAuthed, requireAuth, router]);

  const handleFavorite = React.useCallback(() => {
    if (!provider) return;
    if (!isAuthed) {
      requireAuth();
      return;
    }
    void setProviderFavorite(!isSaved);
  }, [isAuthed, isSaved, provider, requireAuth, setProviderFavorite]);

  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(localeTag, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [localeTag],
  );

  const profileCard = React.useMemo(() => {
    if (!provider) return null;
    return mapPublicProviderToCard({
      t,
      provider,
      profileHref: `/providers/${provider.id}`,
      reviewsHref: `/providers/${provider.id}#reviews`,
      ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
      status: 'online',
    });
  }, [provider, t]);

  const providerServiceKeys = React.useMemo(() => (provider ? getProviderServiceKeys(provider) : []), [provider]);

  const providerCategoryKeys = React.useMemo(() => {
    const keys = new Set<string>();
    for (const serviceKey of providerServiceKeys) {
      const categoryKey = serviceCategoryByKey.get(serviceKey);
      if (categoryKey) keys.add(categoryKey);
    }
    return keys;
  }, [providerServiceKeys, serviceCategoryByKey]);

  const sameCityCategoryProviders = React.useMemo(() => {
    if (!provider) return [] as ProviderPublicDto[];

    const providerCityKey = getProviderCityKey(provider);
    return providers
      .filter((item) => item.id !== provider.id)
      .filter((item) => {
        if (providerCategoryKeys.size === 0) return true;
        const candidateServiceKeys = getProviderServiceKeys(item);
        return candidateServiceKeys.some((serviceKey) => {
          const categoryKey = serviceCategoryByKey.get(serviceKey);
          return categoryKey ? providerCategoryKeys.has(categoryKey) : false;
        });
      })
      .filter((item) => {
        if (!providerCityKey) return false;
        return getProviderCityKey(item) === providerCityKey;
      });
  }, [provider, providerCategoryKeys, providers, serviceCategoryByKey]);

  const categoryOnlyProviders = React.useMemo(() => {
    if (!provider) return [] as ProviderPublicDto[];

    return providers
      .filter((item) => item.id !== provider.id)
      .filter((item) => {
        if (providerCategoryKeys.size === 0) return true;
        const candidateServiceKeys = getProviderServiceKeys(item);
        return candidateServiceKeys.some((serviceKey) => {
          const categoryKey = serviceCategoryByKey.get(serviceKey);
          return categoryKey ? providerCategoryKeys.has(categoryKey) : false;
        });
      });
  }, [provider, providerCategoryKeys, providers, serviceCategoryByKey]);

  const shouldUseLocationFallback = sameCityCategoryProviders.length === 0 && categoryOnlyProviders.length > 0;

  const geocodeCityNames = React.useMemo(() => {
    if (!provider || !shouldUseLocationFallback) return [] as string[];
    const names = new Set<string>();
    const own = (provider.cityName ?? '').trim();
    if (own) names.add(own);
    for (const item of categoryOnlyProviders) {
      const cityName = (item.cityName ?? '').trim();
      if (cityName) names.add(cityName);
    }
    return Array.from(names);
  }, [categoryOnlyProviders, provider, shouldUseLocationFallback]);

  const { data: cityCoords = new Map<string, { lat: number; lng: number }>() } = useQuery({
    queryKey: ['provider-city-coords', ...geocodeCityNames],
    enabled: shouldUseLocationFallback && geocodeCityNames.length > 0,
    queryFn: async () => {
      const map = new Map<string, { lat: number; lng: number }>();
      const pairs = await Promise.all(
        geocodeCityNames.map(async (cityName) => {
          try {
            const res = await apiGet<GeoAutocompleteResponse>(
              `/geo/autocomplete?query=${encodeURIComponent(cityName)}&countryCode=de&limit=1`,
            );
            const first = res.items?.[0];
            if (typeof first?.lat === 'number' && typeof first?.lng === 'number') {
              return [cityName.trim().toLowerCase(), { lat: first.lat, lng: first.lng }] as const;
            }
          } catch {
            return null;
          }
          return null;
        }),
      );

      for (const pair of pairs) {
        if (!pair) continue;
        map.set(pair[0], pair[1]);
      }
      return map;
    },
  });

  const similarProviders = React.useMemo(() => {
    const rankByRating = (a: ProviderPublicDto, b: ProviderPublicDto) => {
      if (b.ratingAvg !== a.ratingAvg) return b.ratingAvg - a.ratingAvg;
      if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
      return (a.basePrice ?? Number.MAX_SAFE_INTEGER) - (b.basePrice ?? Number.MAX_SAFE_INTEGER);
    };

    if (sameCityCategoryProviders.length > 0) {
      return sameCityCategoryProviders.slice().sort(rankByRating).slice(0, SIMILAR_LIMIT);
    }

    const ownCityName = (provider?.cityName ?? '').trim().toLowerCase();
    const ownCoords = ownCityName ? cityCoords.get(ownCityName) : undefined;

    return categoryOnlyProviders
      .slice()
      .sort((a, b) => {
        const aCity = (a.cityName ?? '').trim().toLowerCase();
        const bCity = (b.cityName ?? '').trim().toLowerCase();
        const aCoords = aCity ? cityCoords.get(aCity) : undefined;
        const bCoords = bCity ? cityCoords.get(bCity) : undefined;

        const aDistance = ownCoords && aCoords ? haversineKm(ownCoords, aCoords) : Number.MAX_SAFE_INTEGER;
        const bDistance = ownCoords && bCoords ? haversineKm(ownCoords, bCoords) : Number.MAX_SAFE_INTEGER;

        if (aDistance !== bDistance) return aDistance - bDistance;
        return rankByRating(a, b);
      })
      .slice(0, SIMILAR_LIMIT);
  }, [categoryOnlyProviders, cityCoords, provider?.cityName, sameCityCategoryProviders]);

  const similarProviderIds = React.useMemo(() => similarProviders.map((item) => item.id), [similarProviders]);
  const { data: similarProviderReviewPreviewById = new Map<string, string>() } = useQuery({
    queryKey: ['provider-similar-review-preview', ...similarProviderIds],
    enabled: similarProviderIds.length > 0,
    queryFn: async () => {
      const pairs = await Promise.all(
        similarProviderIds.map(async (providerId) => {
          try {
            const providerItem = similarProviders.find((item) => item.id === providerId);
            const targetUserId = providerItem?.userId?.trim() || providerId;
            const list = await listReviews({ targetUserId, targetRole: 'provider', limit: 1, offset: 0 });
            const first = list[0];
            const text = first?.text?.trim() || first?.comment?.trim() || '';
            return [providerId, text] as const;
          } catch {
            return [providerId, ''] as const;
          }
        }),
      );
      const map = new Map<string, string>();
      for (const [providerId, text] of pairs) {
        if (text) map.set(providerId, text);
      }
      return map;
    },
  });

  const similarCards = React.useMemo(
    () =>
      similarProviders.map((item) => ({
        ...mapPublicProviderToCard({
          t,
          provider: item,
          profileHref: `/providers/${item.id}`,
          reviewsHref: `/providers/${item.id}#reviews`,
          ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
          status: 'online',
        }),
        reviewPreview:
          similarProviderReviewPreviewById.get(item.id) ?? t(I18N_KEYS.homePublic.providerReviewPreviewDefault),
      })),
    [similarProviderReviewPreviewById, similarProviders, t],
  );

  const hasRecentReview = reviewsForUi.length > 0;
  const reviewsUi = locale === 'de'
    ? {
        sortLatest: 'Neueste',
        sortTop: 'Top bewertet',
        showMore: 'Mehr anzeigen',
        noText: 'Kein Kommentar hinterlassen.',
        basedOn: 'aus',
        ratingsLabel: 'Bewertungen',
      }
    : {
        sortLatest: 'Latest',
        sortTop: 'Top rated',
        showMore: 'Show more',
        noText: 'No text provided.',
        basedOn: 'from',
        ratingsLabel: 'ratings',
      };
  const [reviewSort, setReviewSort] = React.useState<'latest' | 'top'>('latest');
  const [visibleReviewCount, setVisibleReviewCount] = React.useState(4);
  React.useEffect(() => {
    setVisibleReviewCount(4);
  }, [id, reviewSort]);

  const reviewDateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [localeTag],
  );
  const normalizedReviews = React.useMemo(
    () =>
      reviewsForUi.map((item) => {
        const rawRating = Number(item.rating ?? 0);
        const rating = Number.isFinite(rawRating) ? Math.max(1, Math.min(5, Math.round(rawRating))) : 0;
        const text = item.text?.trim() || item.comment?.trim() || '';
        const createdAtRaw = item.createdAt ? new Date(item.createdAt) : null;
        const createdAtTs =
          createdAtRaw && Number.isFinite(createdAtRaw.getTime()) ? createdAtRaw.getTime() : null;
        return {
          id: item.id,
          rating,
          text,
          authorName: item.authorName?.trim() || t(I18N_KEYS.provider.unnamed),
          createdAtTs,
        };
      }),
    [reviewsForUi, t],
  );
  const reviewsAverage = React.useMemo(() => {
    if (normalizedReviews.length === 0) return 0;
    const sum = normalizedReviews.reduce((acc, item) => acc + item.rating, 0);
    return Math.round((sum / normalizedReviews.length) * 10) / 10;
  }, [normalizedReviews]);
  const displayRatingAvg = React.useMemo(() => {
    const raw = Number(provider?.ratingAvg);
    if (Number.isFinite(raw) && raw >= 0) return raw;
    return reviewsAverage;
  }, [provider?.ratingAvg, reviewsAverage]);
  const displayRatingCount = React.useMemo(() => {
    const raw = Number(provider?.ratingCount);
    if (Number.isFinite(raw) && raw >= 0) return Math.round(raw);
    return normalizedReviews.length;
  }, [normalizedReviews.length, provider?.ratingCount]);
  const reviewsDistribution = React.useMemo(() => {
    const stats = new Map<number, number>();
    for (let score = 1; score <= 5; score += 1) stats.set(score, 0);
    for (const item of normalizedReviews) {
      stats.set(item.rating, (stats.get(item.rating) ?? 0) + 1);
    }
    const max = Math.max(1, ...Array.from(stats.values()));
    return { stats, max };
  }, [normalizedReviews]);
  const sortedReviews = React.useMemo(() => {
    const list = [...normalizedReviews];
    list.sort((a, b) => {
      if (reviewSort === 'top') {
        if (b.rating !== a.rating) return b.rating - a.rating;
      }
      const aTs = a.createdAtTs ?? 0;
      const bTs = b.createdAtTs ?? 0;
      return bTs - aTs;
    });
    return list;
  }, [normalizedReviews, reviewSort]);
  const visibleReviews = React.useMemo(
    () => sortedReviews.slice(0, visibleReviewCount),
    [sortedReviews, visibleReviewCount],
  );
  const canLoadMoreReviews = visibleReviewCount < sortedReviews.length;

  if (isLoading) {
    return <RequestDetailLoading />;
  }

  if (isError || !provider || !profileCard) {
    return <RequestDetailError message={t(I18N_KEYS.provider.notFound)} />;
  }

  const statusLabel = hasRecentReview
    ? t(I18N_KEYS.requestDetails.clientOnline)
    : t(I18N_KEYS.requestDetails.clientActive);

  const headerTags = [
    ...(profileCard.servicePreview ?? []),
    provider.cityName?.trim() || profileCard.cityLabel,
  ].filter((item): item is string => Boolean(item));

  const priceLabel =
    typeof provider.basePrice === 'number'
      ? formatPrice.format(provider.basePrice)
      : t(I18N_KEYS.requestDetails.priceOnRequest);
  const pricePrefixLabel = typeof provider.basePrice === 'number' ? `${t(I18N_KEYS.provider.basePrice)}:` : undefined;
  const priceSuffixLabel =
    typeof provider.basePrice === 'number'
      ? locale === 'de'
        ? 'pro Stunde'
        : 'per hour'
      : undefined;

  const aboutText = profileCard.aboutPreview?.trim() || t(I18N_KEYS.requestsPage.reviewsEmptyHint);

  const similarProvidersTitle = locale === 'de' ? 'Ähnliche Anbieter' : 'Similar providers';
  const similarProvidersHint =
    sameCityCategoryProviders.length === 0 && similarCards.length > 0
      ? locale === 'de'
        ? 'Aus derselben Kategorie, nach Nähe sortiert.'
        : 'Same category, sorted by nearest location.'
      : undefined;

  return (
    <PageShell
      right={<AuthActions />}
      showBack
      backHref="/?view=orders&section=providers"
      forceBackHref
      mainClassName="py-6"
    >
      <div className="request-detail">
        <section className="panel request-detail__panel">
          <RequestDetailHeader
            title=""
            priceLabel={priceLabel}
            pricePrefixLabel={pricePrefixLabel}
            priceSuffixLabel={priceSuffixLabel}
            tags={[]}
            badgeLabel={t(I18N_KEYS.requestsPage.favoritesTabProviders)}
            statusBadge={
              <span className={getStatusBadgeClass(hasRecentReview ? 'in_progress' : 'sent')}>{statusLabel}</span>
            }
          />

          <div className="request-detail__section request-detail__client">
            <div className="request-detail__client-card request-detail__client-card--provider-hero">
              <UserHeaderCard
                adaptiveDesktop
                name={provider.displayName || t(I18N_KEYS.provider.unnamed)}
                avatarUrl={provider.avatarUrl ?? undefined}
                avatarRole="provider"
                subtitle={profileCard.role}
                cityLabel={profileCard.cityLabel}
                status={hasRecentReview ? 'online' : 'offline'}
                statusLabel={statusLabel}
                responseTime={profileCard.responseTime}
                responseTimeLabel={profileCard.responseTimeLabel}
                responseRate={profileCard.responseRate}
                responseRateLabel={profileCard.responseRateLabel}
                rating={displayRatingAvg.toFixed(1)}
                reviewsCount={displayRatingCount}
                reviewsLabel={t(I18N_KEYS.homePublic.reviews)}
                reviewsHref={
                  '/providers/' + provider.id + '#reviews'
                }
                isVerified={profileCard.isVerified}
                showRating={false}
              />
            </div>
          </div>

          <RequestDetailAbout title={t(I18N_KEYS.requestDetails.about)} description={aboutText} />

          <div className="request-detail__tags">
            {headerTags.map((tag) => (
              <span key={tag} className="request-tag">
                {tag}
              </span>
            ))}
          </div>

          <div id="reviews" className="request-detail__section request-detail__similar">
            <h3 className="request-detail__section-title">{t(I18N_KEYS.requestsPage.reviewsViewLabel)}</h3>
            {isReviewsLoading ? <p className="request-detail__similar-note">...</p> : null}
            {!isReviewsLoading ? (
              <div className="provider-reviews-hub">
                <div className="provider-reviews-hub__summary card">
                  <div className="provider-reviews-hub__rating-main">
                    <p className="provider-reviews-hub__rating-value">{displayRatingAvg.toFixed(1)}</p>
                    <p className="provider-reviews-hub__rating-stars" aria-hidden="true">
                      {'★'.repeat(Math.max(1, Math.min(5, Math.round(displayRatingAvg))))}
                      {'☆'.repeat(5 - Math.max(1, Math.min(5, Math.round(displayRatingAvg))))}
                    </p>
                    <p className="provider-reviews-hub__rating-meta">
                      {displayRatingCount} {t(I18N_KEYS.homePublic.reviews)}
                    </p>
                  </div>
                  <div className="provider-reviews-hub__distribution">
                    {[5, 4, 3, 2, 1].map((score) => {
                      const count = reviewsDistribution.stats.get(score) ?? 0;
                      const width = `${(count / reviewsDistribution.max) * 100}%`;
                      return (
                        <div key={score} className="provider-reviews-hub__distribution-row">
                          <span className="provider-reviews-hub__distribution-score">{score}★</span>
                          <span className="provider-reviews-hub__distribution-track">
                            <span className="provider-reviews-hub__distribution-fill" style={{ width }} />
                          </span>
                          <span className="provider-reviews-hub__distribution-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="provider-reviews-hub__feed">
                  <div className="provider-reviews-hub__toolbar">
                    <span className="provider-reviews-hub__toolbar-label">
                      {reviewsUi.basedOn} {displayRatingCount} {reviewsUi.ratingsLabel}
                    </span>
                    <div className="provider-reviews-hub__sort">
                      <button
                        type="button"
                        className={`provider-reviews-hub__sort-btn ${reviewSort === 'latest' ? 'is-active' : ''}`.trim()}
                        onClick={() => setReviewSort('latest')}
                      >
                        {reviewsUi.sortLatest}
                      </button>
                      <button
                        type="button"
                        className={`provider-reviews-hub__sort-btn ${reviewSort === 'top' ? 'is-active' : ''}`.trim()}
                        onClick={() => setReviewSort('top')}
                      >
                        {reviewsUi.sortTop}
                      </button>
                    </div>
                  </div>

                  <div className="provider-reviews-hub__list">
                    {visibleReviews.map((review) => (
                      <article key={review.id} className="provider-reviews-hub__item card">
                        <div className="provider-reviews-hub__item-head">
                          <p className="provider-reviews-hub__item-author">{review.authorName}</p>
                          <p className="provider-reviews-hub__item-date">
                            {review.createdAtTs ? reviewDateFormatter.format(new Date(review.createdAtTs)) : ''}
                          </p>
                        </div>
                        <p className="provider-reviews-hub__item-stars" aria-label={`${review.rating} of 5`}>
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(Math.max(0, 5 - review.rating))}
                        </p>
                        <p className="provider-reviews-hub__item-text">{review.text || reviewsUi.noText}</p>
                      </article>
                    ))}
                    {normalizedReviews.length === 0 ? (
                      <article className="provider-reviews-hub__item card">
                        <p className="provider-reviews-hub__item-text">{t(I18N_KEYS.requestsPage.reviewsEmptyHint)}</p>
                      </article>
                    ) : null}
                  </div>

                  {canLoadMoreReviews ? (
                    <button
                      type="button"
                      className="btn-ghost provider-reviews-hub__more"
                      onClick={() => setVisibleReviewCount((prev) => prev + 4)}
                    >
                      {reviewsUi.showMore}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <RequestDetailAside
          cityLabel={profileCard.cityLabel || provider.cityName || '—'}
          dateLabel={profileCard.responseTime || t(I18N_KEYS.requestDetails.clientActive)}
          ctaApplyLabel={t(I18N_KEYS.requestDetails.ctaApply)}
          ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
          ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
          isSaved={isSaved}
          onApply={handleApply}
          onChat={handleChat}
          onToggleSave={handleFavorite}
          showApply
          showChat
          showSave
        >
          <div className="request-detail__section request-detail__similar">
            <h3 className="request-detail__section-title">{similarProvidersTitle}</h3>
            {similarProvidersHint ? <p className="request-detail__similar-note">{similarProvidersHint}</p> : null}
            {similarCards.length === 0 ? (
              <p className="request-detail__similar-note">{t(I18N_KEYS.requestsPage.emptyProvidersFilteredHint)}</p>
            ) : (
              <>
                <div className="provider-list">
                  {similarCards.map((item) => (
                    <ProviderCard key={item.id} provider={item} />
                  ))}
                </div>
                <div className="request-detail__similar-footer">
                  <MoreDotsLink href="/?view=orders&section=providers" label={t(I18N_KEYS.requestDetails.showAll)} />
                </div>
              </>
            )}
          </div>
        </RequestDetailAside>
      </div>

      <RequestDetailMobileCta
        ctaApplyLabel={t(I18N_KEYS.requestDetails.ctaApply)}
        ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
        ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
        isSaved={isSaved}
        onApply={handleApply}
        onChat={handleChat}
        onToggleSave={handleFavorite}
        showApply
        showChat
        showSave
      />
    </PageShell>
  );
}
