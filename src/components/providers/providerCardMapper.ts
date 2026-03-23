import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { ProviderCardItem } from '@/components/providers/ProviderCard';
import {
  buildProviderCardBadges,
  buildProviderServicePreview,
  computeProviderResponseRate,
  hashProviderCardSeed,
  resolveProviderAvailabilityLabel,
  resolveProviderBioPreview,
  resolveProviderCityLabel,
  resolveProviderIsVerified,
  resolveProviderPricingLabel,
  resolveProviderResponseMinutes,
  resolveProviderReviewPreview,
} from '@/components/providers/providerCardMapper.model';

type MapperDeps = {
  t: (key: I18nKey) => string;
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
  const responseMinutes = resolveProviderResponseMinutes(seed);
  const responseRate = computeProviderResponseRate(provider);
  const pricingLabel = resolveProviderPricingLabel({ t, provider });
  const availabilityLabel = resolveProviderAvailabilityLabel({ t, provider, seed });
  const badges = buildProviderCardBadges({ t, provider, responseRate, responseMinutes });
  const servicePreview = buildProviderServicePreview({ t, seed });
  const reviewPreview = resolveProviderReviewPreview(seed);
  const bioPreview = resolveProviderBioPreview({ aboutPreview, seed });
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
    pricingLabel,
    availabilityLabel,
    servicePreview,
    ctaLabel,
    profileHref,
    reviewsHref,
  };
}
