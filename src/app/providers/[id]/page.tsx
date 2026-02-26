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
import { ProviderAvailabilityMeta } from '@/components/providers/ProviderAvailabilityMeta';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { listProviderSlots } from '@/lib/api/availability';
import { getPublicProviderById, listPublicProviders } from '@/lib/api/providers';
import { listReviews, listReviewsPage } from '@/lib/api/reviews';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { apiGet } from '@/lib/api/http';
import { listServices } from '@/lib/api/catalog';
import { createLongDateFormatter, parseDateSafe, toIsoDayLocal } from '@/lib/utils/date';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { ReviewDto } from '@/lib/api/dto/reviews';

const SIMILAR_LIMIT = 2;
const PROVIDER_REVIEWS_PAGE_SIZE = 4;
const PROVIDER_REVIEWS_STATS_BATCH_LIMIT = 100;
const PROVIDER_REVIEWS_STATS_MAX_ITEMS = 1000;

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

type ProviderAvailabilityModel = {
  isBusy: boolean;
  stateLabel: string;
  datePrefix: string;
  dateLabel: string;
  dateIso: string;
};

function buildProviderAvailabilityModel({
  availabilityState,
  nextAvailableAt,
  nextSlotStartAt,
  formatLongDate,
  openLabel,
  busyLabel,
  nextSlotLabel,
}: {
  availabilityState?: ProviderPublicDto['availabilityState'];
  nextAvailableAt?: string | null;
  nextSlotStartAt?: string | null;
  formatLongDate: (value: Date) => string;
  openLabel: string;
  busyLabel: string;
  nextSlotLabel: string;
}): ProviderAvailabilityModel {
  const firstSlotDate = parseDateSafe(nextSlotStartAt);
  const nextAvailableDate = parseDateSafe(nextAvailableAt);
  const resolvedDate = firstSlotDate ?? nextAvailableDate ?? new Date();
  const resolvedState = availabilityState
    ? availabilityState
    : firstSlotDate
      ? 'open'
      : 'busy';
  const isBusy = resolvedState === 'busy';

  return {
    isBusy,
    stateLabel: isBusy ? busyLabel : openLabel,
    datePrefix: nextSlotLabel,
    dateLabel: formatLongDate(resolvedDate),
    dateIso: toIsoDayLocal(resolvedDate),
  };
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
  const providerSlotsRange = React.useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 14);
    return { from: toIsoDayLocal(from), to: toIsoDayLocal(to) };
  }, []);
  const providerSlotsTimezone = React.useMemo(() => {
    if (typeof Intl === 'undefined') return 'Europe/Berlin';
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
  }, []);
  const { data: providerSlots = [] } = useQuery({
    queryKey: ['provider-availability-slots', providerTargetUserId, providerSlotsRange.from, providerSlotsRange.to, providerSlotsTimezone],
    enabled: Boolean(providerTargetUserId),
    queryFn: () =>
      withStatusFallback(
        () =>
          listProviderSlots({
            providerUserId: String(providerTargetUserId),
            from: providerSlotsRange.from,
            to: providerSlotsRange.to,
            tz: providerSlotsTimezone,
          }),
        [],
        [400, 404],
      ),
    staleTime: 60_000,
  });
  const [reviewSort, setReviewSort] = React.useState<'latest' | 'top'>('latest');
  const [reviewPage, setReviewPage] = React.useState(1);
  React.useEffect(() => {
    setReviewPage(1);
  }, [id, reviewSort]);

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

  const reviewsOffset = (reviewPage - 1) * PROVIDER_REVIEWS_PAGE_SIZE;
  const reviewsSortValue = reviewSort === 'top' ? 'rating_desc' : 'created_desc';

  const reviewsPageQuery = useQuery({
    queryKey: ['provider-reviews-page', providerTargetUserId, reviewsSortValue, reviewPage],
    enabled: Boolean(providerTargetUserId),
    queryFn: () =>
      listReviewsPage({
        targetUserId: String(providerTargetUserId),
        targetRole: 'provider',
        limit: PROVIDER_REVIEWS_PAGE_SIZE,
        offset: reviewsOffset,
        sort: reviewsSortValue,
      }),
    placeholderData: (previousData) => previousData,
  });

  const { data: reviewsStatsRows = [] } = useQuery({
    queryKey: ['provider-reviews-stats', providerTargetUserId],
    enabled: Boolean(providerTargetUserId),
    queryFn: async () => {
      const allRows: ReviewDto[] = [];
      let offset = 0;

      while (allRows.length < PROVIDER_REVIEWS_STATS_MAX_ITEMS) {
        const page = await listReviewsPage({
          targetUserId: String(providerTargetUserId),
          targetRole: 'provider',
          limit: PROVIDER_REVIEWS_STATS_BATCH_LIMIT,
          offset,
          sort: 'created_desc',
        });

        if (page.items.length === 0) break;
        allRows.push(...page.items);
        offset += page.items.length;

        if (page.total != null && offset >= page.total) break;
        if (page.items.length < PROVIDER_REVIEWS_STATS_BATCH_LIMIT) break;
      }

      return allRows;
    },
    staleTime: 60_000,
  });

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
    router.push(`/request/create?providerId=${id}`);
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
  const longDateFormatter = React.useMemo(
    () => createLongDateFormatter(localeTag),
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
    // Avoid burst requests when geocoder is temporarily unavailable.
    return Array.from(names).slice(0, 12);
  }, [categoryOnlyProviders, provider, shouldUseLocationFallback]);

  const { data: cityCoords = new Map<string, { lat: number; lng: number }>() } = useQuery({
    queryKey: ['provider-city-coords', ...geocodeCityNames],
    enabled: shouldUseLocationFallback && geocodeCityNames.length > 0,
    queryFn: async () => {
      const map = new Map<string, { lat: number; lng: number }>();
      for (const cityName of geocodeCityNames) {
        try {
          const res = await apiGet<GeoAutocompleteResponse>(
            `/geo/autocomplete?query=${encodeURIComponent(cityName)}&countryCode=de&limit=1`,
          );
          const first = res.items?.[0];
          if (typeof first?.lat === 'number' && typeof first?.lng === 'number') {
            map.set(cityName.trim().toLowerCase(), { lat: first.lat, lng: first.lng });
          }
        } catch {
          // Stop geocode fallback on first upstream error to prevent console spam.
          break;
        }
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
      const providerUserIdById = new Map(
        similarProviders.map((item) => [item.id, item.userId?.trim() || item.id] as const),
      );
      const pairs = await Promise.all(
        similarProviderIds.map(async (providerId) => {
          try {
            const targetUserId = providerUserIdById.get(providerId) || providerId;
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

  const reviewsUi = locale === 'de'
    ? {
        sortLatest: 'Neueste',
        sortTop: 'Top bewertet',
        noText: 'Kein Kommentar hinterlassen.',
        basedOn: 'aus',
        ratingsLabel: 'Bewertungen',
        expandAbout: 'Mehr lesen',
        collapseAbout: 'Weniger anzeigen',
      }
    : {
        sortLatest: 'Latest',
        sortTop: 'Top rated',
        noText: 'No text provided.',
        basedOn: 'from',
        ratingsLabel: 'ratings',
        expandAbout: 'Read more',
        collapseAbout: 'Show less',
      };

  const reviewDateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [localeTag],
  );
  const normalizeReviews = React.useCallback(
    (rows: ReviewDto[]) =>
      rows.map((item) => {
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
    [t],
  );

  const pageReviews = React.useMemo(
    () => normalizeReviews(reviewsPageQuery.data?.items ?? []),
    [normalizeReviews, reviewsPageQuery.data?.items],
  );
  const statsReviews = React.useMemo(
    () => normalizeReviews(reviewsStatsRows),
    [normalizeReviews, reviewsStatsRows],
  );
  const metricsReviews = statsReviews.length > 0 ? statsReviews : pageReviews;
  const hasRecentReview = metricsReviews.length > 0;
  const reviewsAverage = React.useMemo(() => {
    if (metricsReviews.length === 0) return 0;
    const sum = metricsReviews.reduce((acc, item) => acc + item.rating, 0);
    return Math.round((sum / metricsReviews.length) * 10) / 10;
  }, [metricsReviews]);
  const displayRatingAvg = React.useMemo(() => {
    const raw = Number(provider?.ratingAvg);
    if (Number.isFinite(raw) && raw >= 0) return raw;
    return reviewsAverage;
  }, [provider?.ratingAvg, reviewsAverage]);
  const displayRatingCount = React.useMemo(() => {
    const raw = Number(provider?.ratingCount);
    if (Number.isFinite(raw) && raw >= 0) return Math.round(raw);
    if (typeof reviewsPageQuery.data?.total === 'number') return Math.round(reviewsPageQuery.data.total);
    return metricsReviews.length;
  }, [metricsReviews.length, provider?.ratingCount, reviewsPageQuery.data?.total]);
  const reviewsDistribution = React.useMemo(() => {
    const stats = new Map<number, number>();
    for (let score = 1; score <= 5; score += 1) stats.set(score, 0);
    for (const item of metricsReviews) {
      stats.set(item.rating, (stats.get(item.rating) ?? 0) + 1);
    }
    const max = Math.max(1, ...Array.from(stats.values()));
    return { stats, max };
  }, [metricsReviews]);
  const visibleReviews = React.useMemo(() => {
    const list = [...pageReviews];
    if (reviewSort === 'top') {
      list.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        const aTs = a.createdAtTs ?? 0;
        const bTs = b.createdAtTs ?? 0;
        return bTs - aTs;
      });
    }
    return list;
  }, [pageReviews, reviewSort]);
  const reviewsTotalForPagination = React.useMemo(() => {
    if (typeof reviewsPageQuery.data?.total === 'number') return Math.max(0, Math.floor(reviewsPageQuery.data.total));
    const raw = Number(provider?.ratingCount);
    if (Number.isFinite(raw) && raw >= 0) return Math.max(0, Math.floor(raw));
    return Math.max(pageReviews.length, metricsReviews.length);
  }, [metricsReviews.length, pageReviews.length, provider?.ratingCount, reviewsPageQuery.data?.total]);
  const totalReviewPages = React.useMemo(
    () => Math.max(1, Math.ceil(reviewsTotalForPagination / PROVIDER_REVIEWS_PAGE_SIZE)),
    [reviewsTotalForPagination],
  );
  React.useEffect(() => {
    setReviewPage((prev) => Math.min(prev, totalReviewPages));
  }, [totalReviewPages]);
  const isReviewsLoading = reviewsPageQuery.isLoading && visibleReviews.length === 0;
  const hasReviewsPagination = reviewsTotalForPagination > PROVIDER_REVIEWS_PAGE_SIZE;
  const nextSlotStartAt = React.useMemo(() => {
    const startCandidates = providerSlots
      .map((slot) => slot?.startAt)
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .filter((value) => Number.isFinite(new Date(value).getTime()))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return startCandidates[0] ?? null;
  }, [providerSlots]);
  const availableIsoDays = React.useMemo(() => {
    const days = providerSlots
      .map((slot) => slot?.startAt)
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => {
        const parsed = new Date(value);
        if (!Number.isFinite(parsed.getTime())) return '';
        return toIsoDayLocal(parsed);
      })
      .filter((value): value is string => value.length > 0);
    return Array.from(new Set(days)).sort();
  }, [providerSlots]);
  const availabilityCalendarCopy = locale === 'de'
    ? {
        title: 'Verfügbarkeit (14 Tage)',
        free: 'Frei',
        busy: 'Belegt',
        out: 'Außerhalb Zeitraum',
      }
    : {
        title: 'Availability (14 days)',
        free: 'Free',
        busy: 'Busy',
        out: 'Outside range',
      };
  const availabilityCalendarConfig = React.useMemo(
    () => ({
      availableIsoDays,
      rangeStartIso: providerSlotsRange.from,
      rangeEndIso: providerSlotsRange.to,
      title: availabilityCalendarCopy.title,
      legendFree: availabilityCalendarCopy.free,
      legendBusy: availabilityCalendarCopy.busy,
      legendOut: availabilityCalendarCopy.out,
    }),
    [
      availabilityCalendarCopy.busy,
      availabilityCalendarCopy.free,
      availabilityCalendarCopy.out,
      availabilityCalendarCopy.title,
      availableIsoDays,
      providerSlotsRange.from,
      providerSlotsRange.to,
    ],
  );
  const availabilityModel = React.useMemo(() => {
    return buildProviderAvailabilityModel({
      availabilityState: provider?.availabilityState ?? undefined,
      nextAvailableAt: provider?.nextAvailableAt ?? null,
      nextSlotStartAt,
      formatLongDate: (value) => longDateFormatter.format(value),
      openLabel: t(I18N_KEYS.homePublic.providerAvailabilityStateOpen),
      busyLabel: t(I18N_KEYS.homePublic.providerAvailabilityStateBusy),
      nextSlotLabel: t(I18N_KEYS.homePublic.providerAvailabilityNextSlot),
    });
  }, [longDateFormatter, nextSlotStartAt, provider?.availabilityState, provider?.nextAvailableAt, t]);

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
      hideBackOnMobile
      backHref="/?view=orders&section=providers"
      forceBackHref
      mainClassName="provider-public-main pt-2 pb-6 md:py-6"
    >
      <div className="request-detail request-detail--provider">
        <section className="panel request-detail__panel">
          <RequestDetailHeader
            title=""
            priceLabel={priceLabel}
            pricePrefixLabel={pricePrefixLabel}
            priceSuffixLabel={priceSuffixLabel}
            tags={[]}
            badgeLabel={t(I18N_KEYS.requestsPage.favoritesTabProviders)}
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
            <div className="request-detail__provider-mobile-availability request-detail__availability-actions">
              <ProviderAvailabilityMeta
                stateLabel={availabilityModel.stateLabel}
                datePrefix={availabilityModel.datePrefix}
                dateLabel={availabilityModel.dateLabel}
                dateIso={availabilityModel.dateIso}
                tone={availabilityModel.isBusy ? 'warning' : 'success'}
                calendarLocale={locale}
                calendar={availabilityCalendarConfig}
              />
            </div>
            <RequestDetailMobileCta
              className="request-detail__mobile-cta--inline request-detail__mobile-cta--provider-inline"
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
              compactIcons
            />
          </div>

          <RequestDetailAbout
            title={t(I18N_KEYS.requestDetails.about)}
            description={aboutText}
            className="request-detail__section--about"
            clampLines={7}
            expandLabel={reviewsUi.expandAbout}
            collapseLabel={reviewsUi.collapseAbout}
          />

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
                        aria-pressed={reviewSort === 'latest'}
                        onClick={() => setReviewSort('latest')}
                      >
                        {reviewsUi.sortLatest}
                      </button>
                      <button
                        type="button"
                        className={`provider-reviews-hub__sort-btn ${reviewSort === 'top' ? 'is-active' : ''}`.trim()}
                        aria-pressed={reviewSort === 'top'}
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
                    {reviewsTotalForPagination === 0 ? (
                      <article className="provider-reviews-hub__item card">
                        <p className="provider-reviews-hub__item-text">{t(I18N_KEYS.requestsPage.reviewsEmptyHint)}</p>
                      </article>
                    ) : null}
                  </div>

                  {hasReviewsPagination ? (
                    <RequestsPageNav
                      className="provider-reviews-hub__page-nav"
                      page={reviewPage}
                      totalPages={totalReviewPages}
                      disabled={isReviewsLoading}
                      onPrevPage={() => setReviewPage((prev) => Math.max(1, prev - 1))}
                      onNextPage={() => setReviewPage((prev) => Math.min(totalReviewPages, prev + 1))}
                      ariaLabel={t(I18N_KEYS.requestsPage.paginationLabel)}
                      prevAriaLabel={t(I18N_KEYS.requestsPage.paginationPrev)}
                      nextAriaLabel={t(I18N_KEYS.requestsPage.paginationNext)}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <RequestDetailAside
          cityLabel={profileCard.cityLabel || provider.cityName || '—'}
          dateLabel={profileCard.responseTime || t(I18N_KEYS.requestDetails.clientActive)}
          metaClassName="request-detail__meta--provider-availability"
          metaContent={
            <div className="request-detail__availability-actions">
              <ProviderAvailabilityMeta
                stateLabel={availabilityModel.stateLabel}
                datePrefix={availabilityModel.datePrefix}
                dateLabel={availabilityModel.dateLabel}
                dateIso={availabilityModel.dateIso}
                tone={availabilityModel.isBusy ? 'warning' : 'success'}
                calendarLocale={locale}
                calendar={availabilityCalendarConfig}
              />
            </div>
          }
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
                    <ProviderCard key={item.id} provider={item} className="provider-card--similar-mobile-minimal" />
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

    </PageShell>
  );
}
