import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { ProviderBadgeItem } from '@/components/providers/ProviderCard';

type Translator = (key: I18nKey) => string;

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

export function hashProviderCardSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 100000;
  }
  return hash;
}

export function computeProviderResponseRate(provider: ProviderPublicDto) {
  const ratingPart = Math.round(provider.ratingAvg * 12);
  const reviewsPart = Math.min(8, Math.floor(Math.log10(Math.max(1, provider.ratingCount)) * 5));
  const jobsPart = Math.min(10, Math.floor(provider.completedJobs / 25));
  return Math.max(74, Math.min(99, ratingPart + reviewsPart + jobsPart));
}

export function resolveProviderResponseMinutes(seed: number) {
  return 10 + (seed % 16);
}

export function resolveProviderPricingLabel(params: {
  t: Translator;
  provider: ProviderPublicDto;
}) {
  const { t, provider } = params;
  return typeof provider.basePrice === 'number' && Number.isFinite(provider.basePrice)
    ? `${t(I18N_KEYS.homePublic.providerPricingFrom)} ${provider.basePrice}€${t(I18N_KEYS.homePublic.providerPricingPerHour)}`
    : t(I18N_KEYS.homePublic.providerPricingFixed);
}

export function resolveProviderAvailabilityLabel(params: {
  t: Translator;
  provider: ProviderPublicDto;
  seed: number;
}) {
  const { t, provider, seed } = params;
  const hasExplicitAvailability = provider.availabilityState === 'open' || provider.availabilityState === 'busy';
  const nextAvailableRaw = typeof provider.nextAvailableAt === 'string' ? provider.nextAvailableAt : '';

  if (hasExplicitAvailability) {
    if (provider.availabilityState === 'busy') {
      return t(I18N_KEYS.homePublic.providerAvailabilityTomorrow);
    }
    return nextAvailableRaw
      ? t(I18N_KEYS.homePublic.providerAvailabilityToday)
      : t(I18N_KEYS.homePublic.providerAvailabilityNow);
  }

  if (seed % 3 === 0) return t(I18N_KEYS.homePublic.providerAvailabilityNow);
  if (seed % 2 === 0) return t(I18N_KEYS.homePublic.providerAvailabilityToday);
  return t(I18N_KEYS.homePublic.providerAvailabilityTomorrow);
}

export function buildProviderCardBadges(params: {
  t: Translator;
  provider: ProviderPublicDto;
  responseRate: number;
  responseMinutes: number;
}): ProviderBadgeItem[] {
  const { t, provider, responseRate, responseMinutes } = params;
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

  return badges;
}

export function buildProviderServicePreview(params: {
  t: Translator;
  seed: number;
}) {
  const servicesPool = [
    params.t(I18N_KEYS.homePublic.serviceCleaning),
    params.t(I18N_KEYS.homePublic.serviceElectric),
    params.t(I18N_KEYS.homePublic.servicePlumbing),
    params.t(I18N_KEYS.homePublic.serviceRepair),
    params.t(I18N_KEYS.homePublic.serviceMoving),
    params.t(I18N_KEYS.homePublic.serviceAssembly),
  ];

  return [
    servicesPool[params.seed % servicesPool.length]!,
    servicesPool[(params.seed + 2) % servicesPool.length]!,
  ];
}

export function resolveProviderReviewPreview(seed: number) {
  return REVIEW_PREVIEWS[seed % REVIEW_PREVIEWS.length]!;
}

export function resolveProviderBioPreview(params: {
  aboutPreview?: string;
  seed: number;
}) {
  return params.aboutPreview?.trim() || PROVIDER_BIO_PREVIEWS[params.seed % PROVIDER_BIO_PREVIEWS.length]!;
}

export function resolveProviderCityLabel(params: {
  cityLabel?: string;
  provider: ProviderPublicDto;
  seed: number;
}) {
  return (
    params.cityLabel?.trim() ||
    (params.provider as { cityName?: string }).cityName?.trim() ||
    CITY_FALLBACKS[params.seed % CITY_FALLBACKS.length]!
  );
}

export function resolveProviderIsVerified(provider: ProviderPublicDto) {
  return provider.ratingCount >= 30 || provider.completedJobs >= 25;
}
