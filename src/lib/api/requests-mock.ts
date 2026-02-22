import { listCities, listServiceCategories, listServices } from '@/lib/api/catalog';
import type { PublicRequestsFilter } from '@/lib/api/requests';
import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';

const DEFAULT_COUNT = 40;
const COUNTRY_CODE = 'DE';

let mockPoolPromise: Promise<RequestResponseDto[]> | null = null;

function getMockCount() {
  const raw = Number(process.env.NEXT_PUBLIC_REQUESTS_MOCK_COUNT ?? DEFAULT_COUNT);
  if (!Number.isFinite(raw) || raw < 1) return DEFAULT_COUNT;
  return Math.max(1, Math.floor(raw));
}

function pickI18nLabel(i18n: Record<string, string> | undefined, fallback: string) {
  if (!i18n) return fallback;
  return i18n.de || i18n['de-DE'] || i18n.en || i18n['en-US'] || fallback;
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

async function buildMockPool(): Promise<RequestResponseDto[]> {
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

    const categoryLabel = pickI18nLabel(category?.i18n, service.categoryKey);
    const serviceLabel = pickI18nLabel(service.i18n, service.key);
    const cityLabel = pickI18nLabel(city.i18n, city.name);
    const price = generatePrice(index);
    const area = 35 + (index % 8) * 12;

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
      preferredDate,
      isRecurring: index % 4 === 0,
      title: `${serviceLabel} in ${cityLabel}`,
      description: `Mock Auftrag (${index + 1}): ${serviceLabel} in ${cityLabel}.`,
      photos: [],
      imageUrl: null,
      tags: [],
      clientId: `mock-client-${(index % 18) + 1}`,
      clientName: `Kunde ${String((index % 18) + 1).padStart(2, '0')}`,
      clientAvatarUrl: null,
      clientCity: cityLabel,
      clientRatingAvg: 4.1 + ((index % 7) * 0.1),
      clientRatingCount: 8 + (index % 17) * 3,
      clientIsOnline: index % 2 === 0,
      clientLastSeenAt: createdAt,
      status: 'published',
      createdAt,
    });
  }

  return items;
}

async function getMockPool() {
  if (!mockPoolPromise) {
    mockPoolPromise = buildMockPool();
  }
  return mockPoolPromise;
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
  const pool = await getMockPool();
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

export async function getMockPublicRequestById(requestId: string): Promise<RequestResponseDto | null> {
  const pool = await getMockPool();
  return pool.find((item) => item.id === requestId) ?? null;
}

