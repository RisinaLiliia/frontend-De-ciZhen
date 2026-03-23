'use client';

import * as React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
} from '@/features/providers/publicProfile/providerPublicProfile.presentation';
import { useProviderReviewsModel } from '@/features/providers/publicProfile/useProviderReviewsModel';
import {
  buildProviderPublicProfileAvailabilityCalendarConfig,
  buildProviderPublicProfileCard,
  buildProviderPublicProfileSimilarCards,
  buildProviderPublicProfileSimilarProviders,
  buildProviderPublicProfileViewModel,
  getPrimaryProviderServiceKey,
  resolveProviderTargetUserId,
} from '@/features/providers/publicProfile/providerPublicProfile.model';

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
    () => resolveProviderTargetUserId(provider),
    [provider],
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

  const profileCard = React.useMemo(
    () => (provider ? buildProviderPublicProfileCard({ provider, t }) : null),
    [provider, t],
  );
  const primaryServiceKey = React.useMemo(() => getPrimaryProviderServiceKey(provider), [provider]);

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

  const similarProviders = React.useMemo(() => {
    if (!provider) return [] as ProviderPublicDto[];
    return buildProviderPublicProfileSimilarProviders({
      provider,
      providers,
    });
  }, [provider, providers]);

  const similarCards = React.useMemo(
    () => buildProviderPublicProfileSimilarCards({ providers: similarProviders, t }),
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

  const availabilityCalendarConfig = React.useMemo(
    () =>
      buildProviderPublicProfileAvailabilityCalendarConfig({
        locale,
        availableIsoDays,
        rangeStartIso: providerSlotsRange.from,
        rangeEndIso: providerSlotsRange.to,
      }),
    [
      availableIsoDays,
      locale,
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

  const {
    statusLabel,
    headerTags,
    priceLabel,
    pricePrefixLabel,
    priceSuffixLabel,
    aboutText,
    similarProvidersTitle,
    similarProvidersHint,
  } = React.useMemo(
    () =>
      buildProviderPublicProfileViewModel({
        provider,
        profileCard,
        hasRecentReview,
        locale,
        formatPrice,
        t,
        similarCardsLength: similarCards.length,
        hasSameCityProviders: provider
          ? providers.some(
              (item) =>
                item.id !== provider.id &&
                getProviderCityKey(item) === getProviderCityKey(provider),
            )
          : false,
      }),
    [formatPrice, hasRecentReview, locale, profileCard, provider, providers, similarCards.length, t],
  );

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
