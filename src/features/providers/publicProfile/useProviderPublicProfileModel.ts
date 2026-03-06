'use client';

import * as React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import { listProviderSlots } from '@/lib/api/availability';
import { getPublicProviderById, listPublicProviders } from '@/lib/api/providers';
import {
  buildProviderFavoriteLookup,
  listFavorites,
} from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useProviderFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { createLongDateFormatter, toIsoDayLocal } from '@/lib/utils/date';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import {
  buildProviderAvailabilityModel,
  getAvailableIsoDays,
  getNextSlotStartAt,
  getProviderCityKey,
  getProviderServiceKeys,
} from '@/features/providers/publicProfile/providerPublicProfile.presentation';
import { useProviderReviewsModel } from '@/features/providers/publicProfile/useProviderReviewsModel';

const SIMILAR_LIMIT = 2;

export function useProviderPublicProfileModel() {
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

  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), [], [401, 403]),
  });
  const favoriteProviderLookup = React.useMemo(
    () => buildProviderFavoriteLookup(favoriteProviders),
    [favoriteProviders],
  );
  const providerById = React.useMemo(() => {
    const map = new Map<string, ProviderPublicDto>();
    if (provider) map.set(provider.id, provider);
    return map;
  }, [provider]);
  const nextPath = pathname || `/providers/${id}`;
  const {
    pendingFavoriteProviderIds,
    isProviderSaved,
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
  const isSaved = React.useMemo(() => {
    if (!provider) return false;
    return isProviderSaved(provider.id);
  }, [isProviderSaved, provider]);

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
    void toggleProviderFavorite(provider.id);
  }, [provider, toggleProviderFavorite]);

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
  const primaryServiceKey = providerServiceKeys[0];

  const { data: providers = [] } = useQuery({
    queryKey: ['provider-similar-candidates', provider?.id, provider?.cityId, provider?.cityName, primaryServiceKey],
    enabled: Boolean(provider?.id),
    queryFn: async () => {
      if (!provider) return [];

      const byCityAndService = await withStatusFallback(
        () =>
          listPublicProviders({
            cityId: provider.cityId || undefined,
            serviceKey: primaryServiceKey,
          }),
        [],
        [400, 404],
      );
      if (byCityAndService.length > 0) return byCityAndService;

      if (primaryServiceKey) {
        const byService = await withStatusFallback(
          () =>
            listPublicProviders({
              serviceKey: primaryServiceKey,
            }),
          [],
          [400, 404],
        );
        if (byService.length > 0) return byService;
      }

      return [];
    },
    staleTime: 120_000,
  });

  const rankByRating = React.useCallback((a: ProviderPublicDto, b: ProviderPublicDto) => {
    if (b.ratingAvg !== a.ratingAvg) return b.ratingAvg - a.ratingAvg;
    if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
    return (a.basePrice ?? Number.MAX_SAFE_INTEGER) - (b.basePrice ?? Number.MAX_SAFE_INTEGER);
  }, []);

  const sameCityProviders = React.useMemo(() => {
    if (!provider) return [] as ProviderPublicDto[];
    const providerCityKey = getProviderCityKey(provider);
    if (!providerCityKey) return [] as ProviderPublicDto[];
    return providers
      .filter((item) => item.id !== provider.id)
      .filter((item) => getProviderCityKey(item) === providerCityKey);
  }, [provider, providers]);

  const similarProviders = React.useMemo(() => {
    if (!provider) return [] as ProviderPublicDto[];
    const candidates = providers.filter((item) => item.id !== provider.id);
    if (sameCityProviders.length > 0) {
      return sameCityProviders.slice().sort(rankByRating).slice(0, SIMILAR_LIMIT);
    }
    return candidates.slice().sort(rankByRating).slice(0, SIMILAR_LIMIT);
  }, [provider, providers, rankByRating, sameCityProviders]);

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
        reviewPreview: t(I18N_KEYS.homePublic.providerReviewPreviewDefault),
      })),
    [similarProviders, t],
  );

  const {
    reviewSort,
    setReviewSort,
    reviewPage,
    setReviewPage,
    reviewsUi,
    reviewDateFormatter,
    displayRatingAvg,
    displayRatingCount,
    hasRecentReview,
    reviewsDistribution,
    visibleReviews,
    reviewsTotalForPagination,
    totalReviewPages,
    isReviewsLoading,
    hasReviewsPagination,
  } = useProviderReviewsModel({
    providerId: typeof id === 'string' ? id : null,
    providerTargetUserId,
    providerRatingAvg: provider?.ratingAvg,
    providerRatingCount: provider?.ratingCount,
    locale,
    t,
  });

  const nextSlotStartAt = React.useMemo(
    () => getNextSlotStartAt(providerSlots),
    [providerSlots],
  );
  const availableIsoDays = React.useMemo(
    () => getAvailableIsoDays(providerSlots),
    [providerSlots],
  );

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

  const statusLabel = hasRecentReview
    ? t(I18N_KEYS.requestDetails.clientOnline)
    : t(I18N_KEYS.requestDetails.clientActive);

  const headerTags = [
    ...(profileCard?.servicePreview ?? []),
    provider?.cityName?.trim() || profileCard?.cityLabel,
  ].filter((item): item is string => Boolean(item));

  const priceLabel =
    typeof provider?.basePrice === 'number'
      ? formatPrice.format(provider.basePrice)
      : t(I18N_KEYS.requestDetails.priceOnRequest);
  const pricePrefixLabel =
    typeof provider?.basePrice === 'number' ? `${t(I18N_KEYS.provider.basePrice)}:` : undefined;
  const priceSuffixLabel =
    typeof provider?.basePrice === 'number'
      ? locale === 'de'
        ? 'pro Stunde'
        : 'per hour'
      : undefined;

  const aboutText = profileCard?.aboutPreview?.trim() || t(I18N_KEYS.requestsPage.reviewsEmptyHint);

  const similarProvidersTitle = locale === 'de' ? 'Ähnliche Anbieter' : 'Similar providers';
  const similarProvidersHint =
    sameCityProviders.length === 0 && similarCards.length > 0
      ? locale === 'de'
        ? 'Aus derselben Leistungskategorie.'
        : 'From the same service category.'
      : undefined;

  return {
    t,
    locale,
    id,
    isLoading,
    isError,
    provider,
    profileCard,
    pendingFavoriteProviderIds,
    isSaved,
    handleApply,
    handleChat,
    handleFavorite,
    isReviewsLoading,
    displayRatingAvg,
    displayRatingCount,
    reviewsDistribution,
    reviewsUi,
    reviewSort,
    setReviewSort,
    visibleReviews,
    reviewsTotalForPagination,
    hasReviewsPagination,
    reviewPage,
    totalReviewPages,
    setReviewPage,
    reviewDateFormatter,
    availabilityModel,
    availabilityCalendarConfig,
    hasRecentReview,
    statusLabel,
    headerTags,
    priceLabel,
    pricePrefixLabel,
    priceSuffixLabel,
    aboutText,
    similarProvidersTitle,
    similarProvidersHint,
    similarCards,
  };
}
