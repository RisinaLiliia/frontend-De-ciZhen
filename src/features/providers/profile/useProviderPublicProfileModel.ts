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
import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';
import { buildWorkspaceCreateRequestHref } from '@/features/workspace/requests/workspaceRequestRoute.model';
import { buildWorkspaceProviderDetailHref } from '@/features/workspace/providers/workspaceProviderRoute.model';
import { createLongDateFormatter, toIsoDayLocal } from '@/lib/utils/date';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import { providerQK } from '@/features/providers/queries';
import {
  backfillOwnProviderAvatar,
  backfillProviderAvatarFromCandidates,
} from '@/lib/providers/publicProvider';
import {
  buildProviderAvailabilityModel,
  getAvailableIsoDays,
  getNextSlotStartAt,
  getProviderCityKey,
} from '@/features/providers/profile/providerProfile.presentation';
import { usePublicProfileReviewsModel } from '@/features/reviews/usePublicProfileReviewsModel';
import {
  buildProviderPublicProfileAvailabilityCalendarConfig,
  buildProviderPublicProfileCard,
  buildProviderPublicProfileSimilarCards,
  buildProviderPublicProfileSimilarProviders,
  buildProviderPublicProfileViewModel,
  getPrimaryProviderServiceKey,
  resolveProviderTargetUserId,
} from '@/features/providers/profile/providerProfile.model';

export type UseProviderPublicProfileModelArgs = {
  providerId?: string | null;
  nextPath?: string | null;
  profileHrefBuilder?: (providerId: string) => string;
  reviewsHrefBuilder?: (providerId: string) => string;
};

export function useProviderPublicProfileModel({
  providerId: providerIdOverride = null,
  nextPath: nextPathOverride = null,
  profileHrefBuilder,
  reviewsHrefBuilder,
}: UseProviderPublicProfileModelArgs = {}) {
  const t = useT();
  const { locale } = useI18n();
  const authStatus = useAuthStatus();
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const routeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = providerIdOverride ?? routeId;
  const isAuthed = authStatus === 'authenticated';

  const {
    data: providerData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: providerQK.publicById(typeof id === 'string' ? id : null),
    enabled: Boolean(id),
    queryFn: () => getPublicProviderById(String(id)),
  });
  const baseProvider = React.useMemo(
    () => backfillOwnProviderAvatar(providerData),
    [providerData],
  );

  const providerTargetUserId = React.useMemo(
    () => resolveProviderTargetUserId(baseProvider),
    [baseProvider],
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
    if (baseProvider) map.set(baseProvider.id, baseProvider);
    return map;
  }, [baseProvider]);
  const nextPath = nextPathOverride
    || pathname
    || (id
      ? buildWorkspaceProviderDetailHref({
          currentSearch: '',
          providerId: String(id),
        })
      : '/workspace?section=providers');
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
    if (!baseProvider) return false;
    return isProviderSaved(baseProvider.id);
  }, [baseProvider, isProviderSaved]);

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
    router.push(
      buildWorkspaceCreateRequestHref({
        currentSearch: new URLSearchParams([
          ['providerId', id],
        ]),
      }),
    );
  }, [id, isAuthed, requireAuth, router]);

  const handleChat = React.useCallback(() => {
    if (!id) return;
    if (!isAuthed) {
      requireAuth();
      return;
    }
    router.push(
      buildWorkspaceHref({
        currentSearch: new URLSearchParams([
          ['provider', id],
        ]),
        section: 'chat',
      }),
    );
  }, [id, isAuthed, requireAuth, router]);

  const handleFavorite = React.useCallback(() => {
    if (!baseProvider) return;
    void toggleProviderFavorite(baseProvider.id);
  }, [baseProvider, toggleProviderFavorite]);

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

  const primaryServiceKey = React.useMemo(() => getPrimaryProviderServiceKey(baseProvider), [baseProvider]);

  const { data: providers = [] } = useQuery({
    queryKey: ['provider-similar-candidates', baseProvider?.id, baseProvider?.cityId, baseProvider?.cityName, primaryServiceKey],
    enabled: Boolean(baseProvider?.id),
    queryFn: async () => {
      if (!baseProvider) return [];

      const byCityAndService = await withStatusFallback(
        () =>
          listPublicProviders({
            cityId: baseProvider.cityId || undefined,
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
  const provider = React.useMemo(
    () => backfillProviderAvatarFromCandidates(baseProvider, providers),
    [baseProvider, providers],
  );
  const profileCard = React.useMemo(
    () =>
      (provider
        ? buildProviderPublicProfileCard({
          provider,
          t,
          locale,
          profileHrefBuilder,
          reviewsHrefBuilder,
        })
        : null),
    [locale, profileHrefBuilder, provider, reviewsHrefBuilder, t],
  );

  const similarProviders = React.useMemo(() => {
    if (!provider) return [] as ProviderPublicDto[];
    return buildProviderPublicProfileSimilarProviders({
      provider,
      providers,
    });
  }, [provider, providers]);

  const similarCards = React.useMemo(
    () =>
      buildProviderPublicProfileSimilarCards({
        providers: similarProviders,
        t,
        locale,
        profileHrefBuilder,
        reviewsHrefBuilder,
      }),
    [locale, profileHrefBuilder, reviewsHrefBuilder, similarProviders, t],
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
  } = usePublicProfileReviewsModel({
    profileId: typeof id === 'string' ? id : null,
    targetUserId: providerTargetUserId,
    ratingAvg: provider?.ratingAvg,
    ratingCount: provider?.ratingCount,
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
    priceLabel,
    pricePrefixLabel,
    priceSuffixLabel,
    aboutText,
    similarProvidersTitle,
    similarProvidersHint,
    similarCards,
    reviewsHref:
      reviewsHrefBuilder?.(String(id))
      ?? `${buildWorkspaceProviderDetailHref({
        currentSearch: '',
        providerId: String(id),
      })}#reviews`,
  };
}
