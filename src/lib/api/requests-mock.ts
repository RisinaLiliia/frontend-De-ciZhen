import { listCities, listServiceCategories, listServices } from '@/lib/api/catalog';
import type { PublicRequestsFilter } from '@/lib/api/requests';
import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';

const DEFAULT_COUNT = 40;
const COUNTRY_CODE = 'DE';
const DEFAULT_LOCALE = 'de';
const SUPPORTED_LOCALES = ['de', 'en'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const mockPoolByLocale = new Map<SupportedLocale, Promise<RequestResponseDto[]>>();

const MOCK_TOP_PROVIDER_PROFILES = [
  {
    id: 'provider-1',
    name: 'Anna K.',
    ratingAvg: 4.9,
    ratingCount: 128,
    isOnline: true,
  },
  {
    id: 'provider-2',
    name: 'Markus S.',
    ratingAvg: 4.8,
    ratingCount: 96,
    isOnline: false,
  },
  {
    id: 'provider-3',
    name: 'Sofia M.',
    ratingAvg: 4.9,
    ratingCount: 142,
    isOnline: true,
  },
  {
    id: 'provider-4',
    name: 'Lukas B.',
    ratingAvg: 4.7,
    ratingCount: 87,
    isOnline: false,
  },
  {
    id: 'provider-5',
    name: 'Nina T.',
    ratingAvg: 4.8,
    ratingCount: 104,
    isOnline: true,
  },
] as const;

function getMockCount() {
  const raw = Number(process.env.NEXT_PUBLIC_REQUESTS_MOCK_COUNT ?? DEFAULT_COUNT);
  if (!Number.isFinite(raw) || raw < 1) return DEFAULT_COUNT;
  return Math.max(1, Math.floor(raw));
}

function normalizeLocale(locale: string | undefined | null): SupportedLocale | null {
  const normalized = locale?.trim().toLowerCase();
  if (!normalized) return null;
  const base = normalized.split('-')[0];
  if (SUPPORTED_LOCALES.includes(base as SupportedLocale)) {
    return base as SupportedLocale;
  }
  return null;
}

function resolveMockLocale(preferred?: string): SupportedLocale {
  const direct = normalizeLocale(preferred);
  if (direct) return direct;
  if (typeof document !== 'undefined') {
    const fromDocument = normalizeLocale(document.documentElement?.lang);
    if (fromDocument) return fromDocument;
  }
  if (typeof navigator !== 'undefined') {
    const fromNavigator = normalizeLocale(navigator.language);
    if (fromNavigator) return fromNavigator;
  }
  return DEFAULT_LOCALE;
}

function pickByBaseLocale(i18n: Record<string, string>, baseLocale: SupportedLocale) {
  const entries = Object.entries(i18n);
  const exact = entries.find(([key]) => key.trim().toLowerCase() === baseLocale)?.[1];
  if (exact) return exact;
  const regional = entries.find(([key]) => key.trim().toLowerCase().startsWith(`${baseLocale}-`))?.[1];
  if (regional) return regional;
  return null;
}

function pickI18nLabel(
  i18n: Record<string, string> | undefined,
  fallback: string,
  locale: SupportedLocale,
) {
  if (!i18n) return fallback;
  const preferred = pickByBaseLocale(i18n, locale);
  if (preferred) return preferred;
  const secondary = pickByBaseLocale(i18n, locale === 'de' ? 'en' : 'de');
  if (secondary) return secondary;
  return Object.values(i18n).find((value) => value.trim().length > 0) ?? fallback;
}

function normalizeDateByIndex(index: number) {
  const now = Date.now();
  const stepMs = 1000 * 60 * 60 * 9;
  return new Date(now - index * stepMs).toISOString();
}

function generatePrice(index: number) {
  const base = 45 + (index % 9) * 18;
  const seasonal = ((index * 7) % 13) * 5;
  return base + seasonal;
}

function buildMockDescription(
  serviceLabel: string,
  cityLabel: string,
  index: number,
  locale: SupportedLocale,
) {
  const urgency =
    locale === 'de'
      ? index % 4 === 0
        ? 'Zeitnaher Start bevorzugt.'
        : 'Start flexibel in den nächsten Tagen.'
      : index % 4 === 0
        ? 'Preferably starting soon.'
        : 'Flexible start within the next few days.';
  const quality =
    locale === 'de'
      ? index % 3 === 0
        ? 'Bitte mit Erfahrung und eigenem Werkzeug.'
        : 'Saubere und zuverlässige Ausführung gewünscht.'
      : index % 3 === 0
        ? 'Experience and own tools preferred.'
        : 'Looking for clean and reliable execution.';
  return `${serviceLabel} in ${cityLabel}. ${urgency} ${quality}`;
}

async function buildMockPool(locale: SupportedLocale): Promise<RequestResponseDto[]> {
  const [cities, categories, services] = await Promise.all([
    listCities(COUNTRY_CODE),
    listServiceCategories(),
    listServices(),
  ]);

  const activeCities = cities.filter((city) => city.isActive);
  const activeServices = services.filter((service) => service.isActive);
  const categoriesByKey = new Map(
    categories.filter((category) => category.isActive).map((category) => [category.key, category]),
  );

  if (activeCities.length === 0 || activeServices.length === 0) return [];

  const total = getMockCount();
  const items: RequestResponseDto[] = [];

  for (let index = 0; index < total; index += 1) {
    const service = activeServices[index % activeServices.length];
    const city = activeCities[(index + Math.floor(index / 3)) % activeCities.length];
    const category = categoriesByKey.get(service.categoryKey);
    const createdAt = normalizeDateByIndex(index);
    const preferredDate = normalizeDateByIndex(index - 2);

    const categoryLabel = pickI18nLabel(category?.i18n, service.categoryKey, locale);
    const serviceLabel = pickI18nLabel(service.i18n, service.key, locale);
    const cityLabel = pickI18nLabel(city.i18n, city.name, locale);
    const price = generatePrice(index);
    const area = 35 + (index % 8) * 12;
    const providerProfile = MOCK_TOP_PROVIDER_PROFILES[index % MOCK_TOP_PROVIDER_PROFILES.length];
    const trendSeed = index % 6;
    const priceTrend: 'up' | 'down' | null =
      trendSeed === 0 ? 'up' : trendSeed === 1 ? 'down' : null;
    const previousPrice =
      priceTrend === 'up' ? Math.max(1, price - (10 + (index % 3) * 5))
      : priceTrend === 'down' ? price + (10 + (index % 3) * 5)
      : null;

    items.push({
      id: `mock-request-${index + 1}`,
      serviceKey: service.key,
      cityId: city._id,
      cityName: cityLabel,
      categoryKey: service.categoryKey,
      categoryName: categoryLabel,
      subcategoryName: serviceLabel,
      propertyType: index % 3 === 0 ? 'house' : 'apartment',
      area,
      price,
      previousPrice,
      priceTrend,
      preferredDate,
      isRecurring: index % 4 === 0,
      title: `${serviceLabel} in ${cityLabel}`,
      description: buildMockDescription(serviceLabel, cityLabel, index, locale),
      photos: [],
      imageUrl: null,
      tags: [],
      clientId: providerProfile.id,
      clientName: providerProfile.name,
      clientAvatarUrl: null,
      clientCity: cityLabel,
      clientRatingAvg: providerProfile.ratingAvg,
      clientRatingCount: providerProfile.ratingCount,
      clientIsOnline: providerProfile.isOnline,
      clientLastSeenAt: createdAt,
      status: 'published',
      createdAt,
    });
  }

  return items;
}

async function getMockPool(locale?: string) {
  const resolvedLocale = resolveMockLocale(locale);
  const existing = mockPoolByLocale.get(resolvedLocale);
  if (existing) return existing;

  const created = buildMockPool(resolvedLocale);
  mockPoolByLocale.set(resolvedLocale, created);
  void created.catch(() => {
    mockPoolByLocale.delete(resolvedLocale);
  });
  return created;
}

function applyFilter(items: RequestResponseDto[], filter: PublicRequestsFilter) {
  return items.filter((item) => {
    if (filter.cityId && item.cityId !== filter.cityId) return false;
    if (filter.categoryKey && item.categoryKey !== filter.categoryKey) return false;
    const targetService = filter.subcategoryKey || filter.serviceKey;
    if (targetService && item.serviceKey !== targetService) return false;
    if (filter.priceMin != null && (item.price ?? 0) < filter.priceMin) return false;
    if (filter.priceMax != null && (item.price ?? 0) > filter.priceMax) return false;
    return true;
  });
}

function applySort(items: RequestResponseDto[], sort: PublicRequestsFilter['sort']) {
  const mode = sort ?? 'date_desc';
  const copy = [...items];
  copy.sort((a, b) => {
    if (mode === 'date_desc') return a.createdAt < b.createdAt ? 1 : -1;
    if (mode === 'date_asc') return a.createdAt > b.createdAt ? 1 : -1;
    if (mode === 'price_asc') return (a.price ?? 0) - (b.price ?? 0);
    return (b.price ?? 0) - (a.price ?? 0);
  });
  return copy;
}

function applyPagination(items: RequestResponseDto[], filter: PublicRequestsFilter) {
  const limit = Math.max(1, Math.floor(filter.limit ?? 20));
  if (filter.offset != null) {
    const offset = Math.max(0, Math.floor(filter.offset));
    return {
      pageItems: items.slice(offset, offset + limit),
      page: Math.floor(offset / limit) + 1,
      limit,
    };
  }
  const page = Math.max(1, Math.floor(filter.page ?? 1));
  const start = (page - 1) * limit;
  return {
    pageItems: items.slice(start, start + limit),
    page,
    limit,
  };
}

export async function listMockPublicRequests(filter: PublicRequestsFilter = {}): Promise<PublicRequestsResponseDto> {
  const pool = await getMockPool(filter.locale);
  const filtered = applyFilter(pool, filter);
  const sorted = applySort(filtered, filter.sort);
  const { pageItems, page, limit } = applyPagination(sorted, filter);

  return {
    items: pageItems,
    total: sorted.length,
    page,
    limit,
  };
}

export async function getMockPublicRequestById(
  requestId: string,
  locale?: string,
): Promise<RequestResponseDto | null> {
  const pool = await getMockPool(locale);
  return pool.find((item) => item.id === requestId) ?? null;
}
