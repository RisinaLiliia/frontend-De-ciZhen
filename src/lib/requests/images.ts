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

export function shouldBypassNextImageOptimization(src: string | null | undefined) {
  if (!src) return false;
  const normalized = normalizeAppImageSrc(src).toLowerCase();
  return (
    normalized.startsWith('http://')
    || normalized.startsWith('https://')
    || normalized.startsWith('blob:')
    || normalized.startsWith('data:')
  );
}
