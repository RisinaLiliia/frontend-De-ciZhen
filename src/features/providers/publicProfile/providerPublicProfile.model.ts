'use client';

import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { getProviderCityKey, getProviderServiceKeys } from '@/features/providers/publicProfile/providerPublicProfile.presentation';

type Translate = (key: I18nKey) => string;

const SIMILAR_LIMIT = 2;

export function resolveProviderTargetUserId(provider: ProviderPublicDto | undefined) {
  return provider?.userId && provider.userId.trim().length > 0
    ? provider.userId
    : provider?.id ?? null;
}

export function buildProviderPublicProfileCard(params: {
  provider: ProviderPublicDto;
  t: Translate;
  locale: Locale;
}) {
  const { provider, t, locale } = params;
  return mapPublicProviderToCard({
    t,
    locale,
    provider,
    profileHref: `/providers/${provider.id}`,
    reviewsHref: `/providers/${provider.id}#reviews`,
    ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
    status: 'online',
  });
}

export function rankProviderPublicProfileCandidates(a: ProviderPublicDto, b: ProviderPublicDto) {
  if (b.ratingAvg !== a.ratingAvg) return b.ratingAvg - a.ratingAvg;
  if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
  return (a.basePrice ?? Number.MAX_SAFE_INTEGER) - (b.basePrice ?? Number.MAX_SAFE_INTEGER);
}

export function buildProviderPublicProfileSimilarProviders(params: {
  provider: ProviderPublicDto;
  providers: ProviderPublicDto[];
  limit?: number;
}) {
  const { provider, providers, limit = SIMILAR_LIMIT } = params;
  const providerCityKey = getProviderCityKey(provider);
  const candidates = providers.filter((item) => item.id !== provider.id);
  const sameCityProviders = providerCityKey
    ? candidates.filter((item) => getProviderCityKey(item) === providerCityKey)
    : [];
  const source = sameCityProviders.length > 0 ? sameCityProviders : candidates;

  return source
    .slice()
    .sort(rankProviderPublicProfileCandidates)
    .slice(0, limit);
}

export function buildProviderPublicProfileSimilarCards(params: {
  providers: ProviderPublicDto[];
  t: Translate;
  locale: Locale;
}) {
  return params.providers.map((item) => ({
    ...buildProviderPublicProfileCard({
      provider: item,
      t: params.t,
      locale: params.locale,
    }),
    reviewPreview: params.t(I18N_KEYS.homePublic.providerReviewPreviewDefault),
  }));
}

export function buildProviderPublicProfileAvailabilityCalendarCopy(locale: Locale) {
  return locale === 'de'
    ? {
        title: 'Verfugbarkeit (14 Tage)',
        free: 'Frei',
        busy: 'Belegt',
        out: 'Ausserhalb Zeitraum',
      }
    : {
        title: 'Availability (14 days)',
        free: 'Free',
        busy: 'Busy',
        out: 'Outside range',
      };
}

export function buildProviderPublicProfileAvailabilityCalendarConfig(params: {
  locale: Locale;
  availableIsoDays: string[];
  rangeStartIso: string;
  rangeEndIso: string;
}) {
  const copy = buildProviderPublicProfileAvailabilityCalendarCopy(params.locale);
  return {
    availableIsoDays: params.availableIsoDays,
    rangeStartIso: params.rangeStartIso,
    rangeEndIso: params.rangeEndIso,
    title: copy.title,
    legendFree: copy.free,
    legendBusy: copy.busy,
    legendOut: copy.out,
  };
}

export function buildProviderPublicProfileViewModel(params: {
  provider: ProviderPublicDto | undefined;
  profileCard: ReturnType<typeof mapPublicProviderToCard> | null;
  hasRecentReview: boolean;
  locale: Locale;
  formatPrice: Intl.NumberFormat;
  t: Translate;
  similarCardsLength: number;
  hasSameCityProviders: boolean;
}) {
  const { provider, profileCard, hasRecentReview, locale, formatPrice, t, similarCardsLength, hasSameCityProviders } = params;

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
  const similarProvidersTitle = locale === 'de' ? 'Ahnliche Anbieter' : 'Similar providers';
  const similarProvidersHint =
    !hasSameCityProviders && similarCardsLength > 0
      ? locale === 'de'
        ? 'Aus derselben Leistungskategorie.'
        : 'From the same service category.'
      : undefined;

  return {
    statusLabel,
    headerTags,
    priceLabel,
    pricePrefixLabel,
    priceSuffixLabel,
    aboutText,
    similarProvidersTitle,
    similarProvidersHint,
  };
}

export function getPrimaryProviderServiceKey(provider: ProviderPublicDto | undefined) {
  return provider ? getProviderServiceKeys(provider)[0] : undefined;
}
