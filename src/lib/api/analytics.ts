import { buildApiUrl } from './url';

export type PlatformActivityRange = '24h' | '7d' | '30d';
export type PlatformActivityInterval = 'hour' | 'day';
export type PlatformActivitySource = 'mock' | 'real';

export type PlatformActivityPoint = {
  timestamp: string;
  requests: number;
  offers: number;
};

export type PlatformActivityResponse = {
  range: PlatformActivityRange;
  interval: PlatformActivityInterval;
  source: PlatformActivitySource;
  data: PlatformActivityPoint[];
  updatedAt: string;
};

export type PlatformLiveFeedItem = {
  id: string;
  text: string;
  minutesAgo: number;
};

export type PlatformLiveFeedResponse = {
  source: PlatformActivitySource;
  updatedAt: string;
  data: PlatformLiveFeedItem[];
};

const SOURCE = (process.env.NEXT_PUBLIC_ANALYTICS_SOURCE ?? 'mock').toLowerCase();
const SEED = process.env.NEXT_PUBLIC_ANALYTICS_SEED ?? 'decizhen-demo-v1';
const FALLBACK_TO_MOCK = (process.env.NEXT_PUBLIC_ANALYTICS_FALLBACK_TO_MOCK ?? 'true') !== 'false';

const RANGE_CONFIG: Record<
  PlatformActivityRange,
  {
    points: number;
    interval: PlatformActivityInterval;
    stepMs: number;
    base: number;
    trend: number;
    amplitude: number;
  }
> = {
  '24h': { points: 24, interval: 'hour', stepMs: 60 * 60 * 1000, base: 14, trend: 0.2, amplitude: 4 },
  '7d': { points: 7, interval: 'day', stepMs: 24 * 60 * 60 * 1000, base: 96, trend: 1.3, amplitude: 22 },
  '30d': { points: 30, interval: 'day', stepMs: 24 * 60 * 60 * 1000, base: 82, trend: 0.8, amplitude: 18 },
};

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toInterval(range: PlatformActivityRange): PlatformActivityInterval {
  return range === '24h' ? 'hour' : 'day';
}

export function buildMockPlatformActivity(range: PlatformActivityRange): PlatformActivityResponse {
  const config = RANGE_CONFIG[range];
  const now = Date.now();
  const start = now - (config.points - 1) * config.stepMs;

  const data: PlatformActivityPoint[] = Array.from({ length: config.points }, (_, index) => {
    const random = mulberry32(hashString(`${SEED}:${range}:${index}`));
    const phase = random() * Math.PI * 2;
    const seasonal = Math.sin((index / Math.max(config.points - 1, 1)) * Math.PI * 2 + phase) * config.amplitude;
    const noise = (random() - 0.5) * config.amplitude * 0.7;
    const requestsRaw = config.base + config.trend * index + seasonal + noise;
    const requests = Math.max(0, Math.round(requestsRaw));
    const offersFactor = 0.62 + random() * 0.24;
    const offersNoise = (random() - 0.5) * (range === '24h' ? 2 : 6);
    const offers = Math.max(0, Math.round(requests * offersFactor + offersNoise));

    return {
      timestamp: new Date(start + index * config.stepMs).toISOString(),
      requests,
      offers,
    };
  });

  return {
    range,
    interval: config.interval,
    source: 'mock',
    updatedAt: new Date().toISOString(),
    data,
  };
}

function normalizePoint(raw: unknown): PlatformActivityPoint | null {
  if (!raw || typeof raw !== 'object') return null;
  const point = raw as Record<string, unknown>;
  if (typeof point.timestamp !== 'string') return null;
  const requests = Number(point.requests);
  const offers = Number(point.offers);
  if (!Number.isFinite(requests) || !Number.isFinite(offers)) return null;
  return {
    timestamp: point.timestamp,
    requests: Math.max(0, Math.round(requests)),
    offers: Math.max(0, Math.round(offers)),
  };
}

function normalizeResponse(
  range: PlatformActivityRange,
  payload: unknown,
): PlatformActivityResponse | null {
  if (!payload || typeof payload !== 'object') return null;
  const raw = payload as Record<string, unknown>;
  if (!Array.isArray(raw.data)) return null;
  const data = raw.data.map(normalizePoint).filter((item): item is PlatformActivityPoint => item !== null);
  return {
    range,
    interval: raw.interval === 'hour' || raw.interval === 'day' ? raw.interval : toInterval(range),
    source: 'real',
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    data,
  };
}

async function fetchPlatformActivityReal(range: PlatformActivityRange): Promise<PlatformActivityResponse> {
  const url = buildApiUrl(`/analytics/platform-activity?range=${range}&interval=${toInterval(range)}`);
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`platform activity ${res.status}`);
  }
  const json = (await res.json()) as unknown;
  const normalized = normalizeResponse(range, json);
  if (!normalized) {
    throw new Error('platform activity invalid payload');
  }
  return normalized;
}

export async function getPlatformActivity(range: PlatformActivityRange): Promise<PlatformActivityResponse> {
  if (SOURCE === 'real') {
    try {
      return await fetchPlatformActivityReal(range);
    } catch {
      if (!FALLBACK_TO_MOCK) throw new Error('platform activity unavailable');
      return buildMockPlatformActivity(range);
    }
  }
  return buildMockPlatformActivity(range);
}

function formatMinutesAgo(minutesAgo: number): number {
  return Math.max(1, Math.round(minutesAgo));
}

export function buildMockPlatformLiveFeed(limit = 4): PlatformLiveFeedResponse {
  const baseEvents = [
    'Anna hat Auftrag angenommen',
    'Neuer Auftrag in Karlsruhe',
    'Elektrik-Service wurde bestätigt',
    'Kunde hat Vertrag bestätigt',
    'Neue Anfrage in München veröffentlicht',
    'Sanitär-Auftrag wurde terminiert',
  ];

  const data: PlatformLiveFeedItem[] = Array.from({ length: Math.max(1, limit) }, (_, index) => {
    const random = mulberry32(hashString(`${SEED}:live:${index}`));
    const minutesAgo = formatMinutesAgo(1 + random() * (index < 2 ? 9 : 35));
    return {
      id: `mock-live-${index + 1}`,
      text: baseEvents[index % baseEvents.length],
      minutesAgo,
    };
  }).sort((a, b) => a.minutesAgo - b.minutesAgo);

  return {
    source: 'mock',
    updatedAt: new Date().toISOString(),
    data,
  };
}

function normalizeLiveFeedItem(raw: unknown, index: number): PlatformLiveFeedItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.text !== 'string') return null;
  const minutesAgo = Number(item.minutesAgo ?? item.minutes ?? item.agoMinutes);
  return {
    id: typeof item.id === 'string' ? item.id : `real-live-${index + 1}`,
    text: item.text,
    minutesAgo: Number.isFinite(minutesAgo) ? formatMinutesAgo(minutesAgo) : index + 2,
  };
}

function normalizeLiveFeedResponse(payload: unknown): PlatformLiveFeedResponse | null {
  if (!payload || typeof payload !== 'object') return null;
  const raw = payload as Record<string, unknown>;
  if (!Array.isArray(raw.data)) return null;
  const data = raw.data
    .map((item, index) => normalizeLiveFeedItem(item, index))
    .filter((item): item is PlatformLiveFeedItem => item !== null);
  return {
    source: 'real',
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    data,
  };
}

async function fetchPlatformLiveFeedReal(limit = 4): Promise<PlatformLiveFeedResponse> {
  const url = buildApiUrl(`/analytics/platform-live-feed?limit=${Math.max(1, limit)}`);
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`platform live feed ${res.status}`);
  }
  const json = (await res.json()) as unknown;
  const normalized = normalizeLiveFeedResponse(json);
  if (!normalized) {
    throw new Error('platform live feed invalid payload');
  }
  return normalized;
}

export async function getPlatformLiveFeed(limit = 4): Promise<PlatformLiveFeedResponse> {
  if (SOURCE === 'real') {
    try {
      return await fetchPlatformLiveFeedReal(limit);
    } catch {
      if (!FALLBACK_TO_MOCK) throw new Error('platform live feed unavailable');
      return buildMockPlatformLiveFeed(limit);
    }
  }
  return buildMockPlatformLiveFeed(limit);
}
