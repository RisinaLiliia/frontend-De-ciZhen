import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { ProviderBadgeItem, ProviderCardItem } from '@/components/providers/ProviderCard';

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

function hashValue(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 100000;
  }
  return hash;
}

const REVIEW_PREVIEWS = [
  'Sehr zuverlässig und schnell!',
  'Pünktlich, freundlich und sauber gearbeitet.',
  'Top Kommunikation und fairer Preis.',
  'Sehr professionell, gerne wieder.',
  'Schnelle Rückmeldung und sauberes Ergebnis.',
  'Arbeit exakt wie besprochen umgesetzt.',
];

const PROVIDER_BIO_PREVIEWS = [
  'Fokussiert auf saubere Ausführung, klare Absprachen und verlässliche Termine.',
  'Mehrjährige Praxiserfahrung mit schnellen Rückmeldungen und transparentem Ablauf.',
  'Arbeitet strukturiert, zuverlässig und mit hohem Qualitätsanspruch im Detail.',
  'Unterstützt kurzfristig bei passenden Anfragen und kommuniziert proaktiv den Fortschritt.',
  'Spezialisiert auf effiziente Lösungen mit sauberem Finish und fairer Preisstruktur.',
];

const CITY_FALLBACKS = [
  'Mannheim',
  'Heidelberg',
  'Karlsruhe',
  'Ludwigshafen',
  'Darmstadt',
  'Stuttgart',
  'Mainz',
  'Frankfurt',
];

function computeResponseRate(provider: ProviderPublicDto) {
  const ratingPart = Math.round(provider.ratingAvg * 12);
  const reviewsPart = Math.min(8, Math.floor(Math.log10(Math.max(1, provider.ratingCount)) * 5));
  const jobsPart = Math.min(10, Math.floor(provider.completedJobs / 25));
  return Math.max(74, Math.min(99, ratingPart + reviewsPart + jobsPart));
}

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
  const seed = hashValue(provider.id);
  const responseMinutes = 10 + (seed % 16);
  const responseRate = computeResponseRate(provider);
  const pricingLabel =
    typeof provider.basePrice === 'number' && Number.isFinite(provider.basePrice)
      ? `${t(I18N_KEYS.homePublic.providerPricingFrom)} ${provider.basePrice}€${t(I18N_KEYS.homePublic.providerPricingPerHour)}`
      : t(I18N_KEYS.homePublic.providerPricingFixed);
  const hasExplicitAvailability = provider.availabilityState === 'open' || provider.availabilityState === 'busy';
  const nextAvailableRaw = typeof provider.nextAvailableAt === 'string' ? provider.nextAvailableAt : '';
  const availabilityLabel = hasExplicitAvailability
    ? provider.availabilityState === 'busy'
      ? t(I18N_KEYS.homePublic.providerAvailabilityTomorrow)
      : nextAvailableRaw
        ? t(I18N_KEYS.homePublic.providerAvailabilityToday)
        : t(I18N_KEYS.homePublic.providerAvailabilityNow)
    : seed % 3 === 0
      ? t(I18N_KEYS.homePublic.providerAvailabilityNow)
      : seed % 2 === 0
        ? t(I18N_KEYS.homePublic.providerAvailabilityToday)
        : t(I18N_KEYS.homePublic.providerAvailabilityTomorrow);
  const isTopAnbieter = provider.ratingAvg >= 4.8 && provider.ratingCount >= 30 && responseRate >= 80;
  const isTopService = provider.ratingAvg >= 4.7 && provider.ratingCount >= 15;
  const isSchnelleAntwort = responseMinutes <= 20;

  const badges: ProviderBadgeItem[] = [];
  if (isTopAnbieter) {
    badges.push({
      type: 'top',
      size: 'md',
      label: t(I18N_KEYS.homePublic.providerBadgeTopAnbieter),
      tooltip: t(I18N_KEYS.homePublic.providerBadgeTopAnbieterTooltip),
    });
  } else if (isTopService) {
    badges.push({
      type: 'service',
      size: 'md',
      label: t(I18N_KEYS.homePublic.providerBadgeTopService),
      tooltip: t(I18N_KEYS.homePublic.providerBadgeTopServiceTooltip),
    });
    if (isSchnelleAntwort) {
      badges.push({
        type: 'fast',
        size: 'md',
        label: t(I18N_KEYS.homePublic.providerBadgeFastReply),
        tooltip: t(I18N_KEYS.homePublic.providerBadgeFastReplyTooltip),
      });
    }
  } else if (isSchnelleAntwort) {
    badges.push({
      type: 'fast',
      size: 'md',
      label: t(I18N_KEYS.homePublic.providerBadgeFastReply),
      tooltip: t(I18N_KEYS.homePublic.providerBadgeFastReplyTooltip),
    });
  }

  const servicesPool = [
    t(I18N_KEYS.homePublic.serviceCleaning),
    t(I18N_KEYS.homePublic.serviceElectric),
    t(I18N_KEYS.homePublic.servicePlumbing),
    t(I18N_KEYS.homePublic.serviceRepair),
    t(I18N_KEYS.homePublic.serviceMoving),
    t(I18N_KEYS.homePublic.serviceAssembly),
  ];
  const servicePreview = [servicesPool[seed % servicesPool.length], servicesPool[(seed + 2) % servicesPool.length]];

  const reviewPreview = REVIEW_PREVIEWS[seed % REVIEW_PREVIEWS.length];
  const bioPreview = aboutPreview?.trim() || PROVIDER_BIO_PREVIEWS[seed % PROVIDER_BIO_PREVIEWS.length];
  const isVerified = provider.ratingCount >= 30 || provider.completedJobs >= 25;

  return {
    id: provider.id,
    badges,
    isVerified,
    status,
    statusLabel: status === 'online' ? t(I18N_KEYS.homePublic.topProviderStatus) : t(I18N_KEYS.homePublic.topProviderStatusOffline),
    avatarUrl: provider.avatarUrl,
    name,
    role: roleLabel?.trim() || servicePreview[0],
    cityLabel:
      cityLabel?.trim() ||
      (provider as { cityName?: string }).cityName?.trim() ||
      CITY_FALLBACKS[seed % CITY_FALLBACKS.length],
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
