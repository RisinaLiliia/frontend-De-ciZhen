import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { ProviderCardItem } from '@/components/providers/ProviderCard';
import { buildProviderAvailabilityModel } from '@/features/providers/publicProfile/providerPublicProfile.presentation';
import {
  buildProviderCardBadges,
  buildProviderServicePreview,
  computeProviderResponseRate,
  hashProviderCardSeed,
  resolveProviderBioPreview,
  resolveProviderCityLabel,
  resolveProviderIsVerified,
  resolveProviderResponseMinutes,
  resolveProviderReviewPreview,
} from '@/components/providers/providerCardMapper.model';
import type { Locale } from '@/lib/i18n/t';

type MapperDeps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  provider: ProviderPublicDto;
  roleLabel?: string;
  cityLabel?: string;
  profileHref: string;
  reviewsHref: string;
  ctaLabel: string;
  aboutPreview?: string;
  status?: 'online' | 'offline';
};

export function mapPublicProviderToCard({
  t,
  locale,
  provider,
  roleLabel,
  cityLabel,
  profileHref,
  reviewsHref,
  ctaLabel,
  aboutPreview,
  status = 'online',
}: MapperDeps): ProviderCardItem {
  const name = provider.displayName ?? t(I18N_KEYS.provider.unnamed);
  const seed = hashProviderCardSeed(provider.id);
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const shortDateFormatter = new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: 'short',
  });
  const formatPrice = new Intl.NumberFormat(localeTag, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
  const responseMinutes = resolveProviderResponseMinutes(seed);
  const responseRate = computeProviderResponseRate(provider);
  const availabilityModel = buildProviderAvailabilityModel({
    availabilityState: provider.availabilityState ?? undefined,
    nextAvailableAt: provider.nextAvailableAt ?? null,
    nextSlotStartAt: provider.nextAvailableAt ?? null,
    formatLongDate: (value) => shortDateFormatter.format(value),
    openLabel: t(I18N_KEYS.homePublic.providerAvailabilityStateOpen),
    busyLabel: t(I18N_KEYS.homePublic.providerAvailabilityStateBusy),
    nextSlotLabel: t(I18N_KEYS.homePublic.providerAvailabilityNextSlot),
  });
  const badges = buildProviderCardBadges({ t, provider, responseRate, responseMinutes });
  const servicePreview = buildProviderServicePreview({ t, seed });
  const reviewPreview = resolveProviderReviewPreview(seed);
  const bioPreview = resolveProviderBioPreview({ aboutPreview: aboutPreview ?? provider.bio ?? undefined, seed });
  const isVerified = resolveProviderIsVerified(provider);

  return {
    id: provider.id,
    badges,
    isVerified,
    status,
    statusLabel: status === 'online' ? t(I18N_KEYS.homePublic.topProviderStatus) : t(I18N_KEYS.homePublic.topProviderStatusOffline),
    avatarUrl: provider.avatarUrl,
    name,
    role: roleLabel?.trim() || servicePreview[0],
    cityLabel: resolveProviderCityLabel({ cityLabel, provider, seed }),
    rating: provider.ratingAvg.toFixed(1),
    responseTime: `~${responseMinutes} ${t(I18N_KEYS.homePublic.statMinutes)}`,
    responseTimeLabel: t(I18N_KEYS.homePublic.topProviderResponseTimeLabel),
    responseRate,
    responseRateLabel: t(I18N_KEYS.homePublic.providerResponseRateLabel),
    reviewsCount: provider.ratingCount,
    reviewsLabel: t(I18N_KEYS.homePublic.reviews),
    reviewPreview,
    aboutPreview: bioPreview,
    availabilityDatePrefix: availabilityModel.datePrefix,
    availabilityDateLabel: availabilityModel.dateLabel,
    availabilityDateIso: availabilityModel.dateIso,
    pricingPrefixLabel:
      typeof provider.basePrice === 'number' && Number.isFinite(provider.basePrice)
        ? t(I18N_KEYS.homePublic.providerPricingFrom)
        : undefined,
    pricingValueLabel:
      typeof provider.basePrice === 'number' && Number.isFinite(provider.basePrice)
        ? formatPrice.format(provider.basePrice)
        : t(I18N_KEYS.homePublic.providerPricingFixed),
    pricingSuffixLabel:
      typeof provider.basePrice === 'number' && Number.isFinite(provider.basePrice)
        ? t(I18N_KEYS.homePublic.providerPricingPerHour)
        : undefined,
    servicePreview,
    ctaLabel,
    profileHref,
    reviewsHref,
  };
}
