import { buildApiUrl } from './url';

export type PlatformActivityRange = '24h' | '7d' | '30d';
export type PlatformActivityInterval = 'hour' | 'day';
export type PlatformActivitySource = 'real';

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

function toInterval(range: PlatformActivityRange): PlatformActivityInterval {
  return range === '24h' ? 'hour' : 'day';
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
  const data = raw.data
    .map(normalizePoint)
    .filter((item): item is PlatformActivityPoint => item !== null);
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
  return fetchPlatformActivityReal(range);
}

function formatMinutesAgo(minutesAgo: number): number {
  return Math.max(1, Math.round(minutesAgo));
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
  return fetchPlatformLiveFeedReal(limit);
}
