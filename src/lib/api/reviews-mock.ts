import type { ReviewDto } from '@/lib/api/dto/reviews';

type ReviewsQuery = {
  targetUserId: string;
  targetRole: 'client' | 'provider';
  limit?: number;
  offset?: number;
  sort?: 'created_desc' | 'rating_desc';
};

type MockReviewsPage = {
  items: ReviewDto[];
  total: number;
  limit: number;
  offset: number;
};

const AUTHOR_NAMES = [
  'Leonie M.',
  'David K.',
  'Sofia B.',
  'Markus T.',
  'Anna R.',
  'Paul S.',
  'Mara W.',
  'Nina H.',
];

const REVIEW_TEXT_POOL = [
  'Puenktlich, freundlich und sauber gearbeitet. Kommunikation war schnell und klar.',
  'Sehr professionell und transparent. Termin wurde exakt eingehalten.',
  'Top Qualitaet, faire Preise und saubere Ausfuehrung. Gern wieder.',
  'Schnelle Rueckmeldung, gute Abstimmung und ordentliche Arbeit.',
  'Kompetent, zuverlaessig und freundlich. Ergebnis wie abgesprochen.',
  'Sehr gute Erreichbarkeit und verstaendliche Updates waehrend der Arbeit.',
  'Preis-Leistung passt, sauber hinterlassen und auf Details geachtet.',
  'Rueckfragen wurden schnell beantwortet, Umsetzung war effizient.',
];

function parseProviderIndex(providerId: string): number | null {
  const m = /^mock-provider-(\d+)$/i.exec(providerId.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getProviderStats(index: number) {
  const topTier = index <= 8;
  const ratingAvg = topTier
    ? Number((4.9 - ((index - 1) % 3) * 0.05).toFixed(1))
    : Number((4.2 + ((index * 7) % 9) * 0.08).toFixed(1));
  const ratingCount = topTier
    ? 110 + ((index * 17) % 90)
    : 18 + ((index * 13) % 190);
  return { ratingAvg, ratingCount };
}

function makeRating(avg: number, position: number) {
  if (avg >= 4.8) {
    const p = position % 10;
    if (p < 8) return 5;
    if (p < 9) return 4;
    return 3;
  }
  if (avg >= 4.5) {
    const p = position % 8;
    if (p < 5) return 5;
    if (p < 7) return 4;
    return 3;
  }
  const p = position % 7;
  if (p < 3) return 5;
  if (p < 5) return 4;
  if (p < 6) return 3;
  return 2;
}

function buildMockProviderReviews(providerId: string): ReviewDto[] {
  const index = parseProviderIndex(providerId);
  if (!index) return [];

  const stats = getProviderStats(index);
  const total = Math.min(60, Math.max(12, stats.ratingCount));
  const now = Date.now();

  return Array.from({ length: total }, (_, i) => {
    const rating = makeRating(stats.ratingAvg, i + index);
    const text = REVIEW_TEXT_POOL[(i + index) % REVIEW_TEXT_POOL.length];
    const authorName = AUTHOR_NAMES[(i * 3 + index) % AUTHOR_NAMES.length];
    const createdAt = new Date(now - (i + 2) * 86_400_000).toISOString();
    return {
      id: `mock-review-${providerId}-${i + 1}`,
      targetRole: 'provider',
      rating,
      text,
      comment: text,
      authorName,
      createdAt,
    } satisfies ReviewDto;
  });
}

export function listMockReviews(params: ReviewsQuery): ReviewDto[] {
  return listMockReviewsPage(params).items;
}

function sortMockReviews(rows: ReviewDto[], sort: ReviewsQuery['sort']) {
  const copy = [...rows];
  copy.sort((a, b) => {
    if (sort === 'rating_desc') {
      const byRating = (Number(b.rating ?? 0) - Number(a.rating ?? 0));
      if (byRating !== 0) return byRating;
    }
    const aTs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTs = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTs - aTs;
  });
  return copy;
}

export function listMockReviewsPage(params: ReviewsQuery): MockReviewsPage {
  if (params.targetRole !== 'provider') {
    return {
      items: [],
      total: 0,
      limit: Math.max(1, params.limit ?? 20),
      offset: Math.max(0, params.offset ?? 0),
    };
  }
  const rows = sortMockReviews(buildMockProviderReviews(params.targetUserId), params.sort);
  const offset = Math.max(0, params.offset ?? 0);
  const limit = Math.max(1, params.limit ?? rows.length);
  return {
    items: rows.slice(offset, offset + limit),
    total: rows.length,
    limit,
    offset,
  };
}

export function isMockProviderId(targetUserId: string) {
  return /^mock-provider-\d+$/i.test((targetUserId ?? '').trim());
}
