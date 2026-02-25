import { listCities, listServices } from '@/lib/api/catalog';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';

const DEFAULT_COUNT = 40;
const COUNTRY_CODE = 'DE';

type MockProvider = ProviderPublicDto & {
  cityId?: string;
  cityName?: string;
  serviceKey?: string;
};

let mockPoolPromise: Promise<MockProvider[]> | null = null;

const MOCK_PROVIDER_FIRST_NAMES = [
  'Anna',
  'Markus',
  'Sofia',
  'Lukas',
  'Nina',
  'Mila',
  'Jonas',
  'Laura',
  'David',
  'Elena',
  'Tobias',
  'Mara',
  'Felix',
  'Leonie',
  'Paul',
  'Amira',
];

const MOCK_PROVIDER_LAST_INITIALS = ['K.', 'S.', 'M.', 'B.', 'T.', 'R.', 'W.', 'L.', 'F.', 'H.'];

function buildMockDisplayName(index: number) {
  const first = MOCK_PROVIDER_FIRST_NAMES[index % MOCK_PROVIDER_FIRST_NAMES.length];
  const last = MOCK_PROVIDER_LAST_INITIALS[Math.floor(index / MOCK_PROVIDER_FIRST_NAMES.length) % MOCK_PROVIDER_LAST_INITIALS.length];
  return `${first} ${last}`;
}

function pickCityName(i18n: Record<string, string>) {
  return i18n.de?.trim() || i18n.en?.trim() || Object.values(i18n).find((value) => value?.trim()) || '';
}

function getMockCount() {
  const raw = Number(process.env.NEXT_PUBLIC_PROVIDERS_MOCK_COUNT ?? process.env.NEXT_PUBLIC_REQUESTS_MOCK_COUNT ?? DEFAULT_COUNT);
  if (!Number.isFinite(raw) || raw < 1) return DEFAULT_COUNT;
  return Math.max(1, Math.floor(raw));
}

async function buildMockPool(): Promise<MockProvider[]> {
  const [cities, services] = await Promise.all([
    listCities(COUNTRY_CODE),
    listServices(),
  ]);

  const activeCities = cities.filter((city) => city.isActive);
  const activeServices = services.filter((service) => service.isActive);
  if (activeCities.length === 0) return [];

  const total = getMockCount();
  const items: MockProvider[] = [];

  for (let index = 0; index < total; index += 1) {
    const city = activeCities[index % activeCities.length];
    const service = activeServices.length ? activeServices[index % activeServices.length] : null;
    const ratingAvg = Number((4.2 + ((index * 7) % 9) * 0.08).toFixed(1));
    const ratingCount = 18 + ((index * 13) % 190);
    const completedJobs = 12 + ((index * 11) % 260);

    items.push({
      id: `mock-provider-${index + 1}`,
      displayName: buildMockDisplayName(index),
      avatarUrl: null,
      ratingAvg,
      ratingCount,
      completedJobs,
      basePrice: 35 + ((index * 9) % 120),
      cityId: city._id,
      cityName: pickCityName(city.i18n),
      serviceKey: service?.key,
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

export async function listMockPublicProviders(params?: {
  cityId?: string;
  serviceKey?: string;
}) {
  const pool = await getMockPool();
  return pool.filter((item) => {
    if (params?.cityId && item.cityId !== params.cityId) return false;
    if (params?.serviceKey && item.serviceKey !== params.serviceKey) return false;
    return true;
  });
}
