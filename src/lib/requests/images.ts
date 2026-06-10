// src/lib/requests/images.ts
import type { RequestResponseDto } from '@/lib/api/dto/requests';

const REQUEST_FALLBACK_IMAGE_MAP: Record<string, string> = {
  cleaning: '/request-fallbacks/cleaning.jpg',
  electric: '/request-fallbacks/electric.jpg',
  plumbing: '/request-fallbacks/plumbing.jpg',
  repair: '/request-fallbacks/repair.jpg',
  moving: '/request-fallbacks/moving.jpg',
};

const LEGACY_STATIC_IMAGE_ALIASES: Record<string, string> = {
  '/Reinigung im modernen Wohnzimmer.jpg': '/request-fallbacks/cleaning.jpg',
  '/Elektriker bei der Arbeit an Schaltschrank.jpg': '/request-fallbacks/electric.jpg',
  '/Freundlicher Klempner bei der Arbeit.jpg': '/request-fallbacks/plumbing.jpg',
  '/Techniker repariert Smartphone in Werkstatt.jpg': '/request-fallbacks/repair.jpg',
  '/Lädt Kisten aus einem Transporter.jpg': '/request-fallbacks/moving.jpg',
  '/Handwerker in einem modernen Wohnzimmer.jpg': '/request-fallbacks/default.jpg',
};

type AppImageVariant = 'card' | 'detail' | 'thumb';

const CLOUDINARY_TRANSFORMS: Record<AppImageVariant, string> = {
  card: 'c_fill,g_auto,w_480,h_320,f_auto,q_auto:good',
  detail: 'c_limit,w_1280,h_960,f_auto,q_auto:good',
  thumb: 'c_fill,g_auto,w_320,h_240,f_auto,q_auto:good',
};

export function buildRequestImageList(request: RequestResponseDto) {
  const photos = request.photos ?? [];
  const image = request.imageUrl ? [request.imageUrl] : [];
  const list = [...photos, ...image].filter(Boolean);
  const unique = Array.from(new Set(list));
  if (unique.length) return unique.slice(0, 4);
  return [pickRequestImage(request.categoryKey ?? '')];
}

export function pickRequestImage(categoryKey: string) {
  return REQUEST_FALLBACK_IMAGE_MAP[categoryKey] ?? '/request-fallbacks/default.jpg';
}

export function normalizeAppImageSrc(src: string | null | undefined) {
  if (!src) return '';
  const trimmed = src.trim();
  return LEGACY_STATIC_IMAGE_ALIASES[trimmed] ?? trimmed;
}

function isCloudinaryUrl(url: URL) {
  return url.hostname === 'res.cloudinary.com' && url.pathname.includes('/upload/');
}

function hasCloudinaryTransformSegment(pathname: string) {
  const marker = '/upload/';
  const uploadIndex = pathname.indexOf(marker);
  if (uploadIndex < 0) return false;
  const afterUpload = pathname.slice(uploadIndex + marker.length);
  const firstSegment = afterUpload.split('/')[0] ?? '';
  return (
    firstSegment.includes('w_') ||
    firstSegment.includes('h_') ||
    firstSegment.includes('q_') ||
    firstSegment.includes('f_') ||
    firstSegment.includes('c_') ||
    firstSegment.includes('g_')
  );
}

export function optimizeAppImageSrc(
  src: string | null | undefined,
  variant: AppImageVariant = 'detail',
) {
  const normalized = normalizeAppImageSrc(src);
  if (!normalized) return '';

  try {
    const url = new URL(normalized);
    if (!isCloudinaryUrl(url)) return normalized;
    if (hasCloudinaryTransformSegment(url.pathname)) return normalized;

    url.pathname = url.pathname.replace('/upload/', `/upload/${CLOUDINARY_TRANSFORMS[variant]}/`);
    return url.toString();
  } catch {
    return normalized;
  }
}

export function shouldBypassNextImageOptimization(src: string | null | undefined) {
  if (!src) return false;
  const normalized = normalizeAppImageSrc(src).toLowerCase();
  return (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('blob:') ||
    normalized.startsWith('data:')
  );
}
