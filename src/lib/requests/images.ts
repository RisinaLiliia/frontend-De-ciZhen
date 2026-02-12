// src/lib/requests/images.ts
import type { RequestResponseDto } from '@/lib/api/dto/requests';

export function buildRequestImageList(request: RequestResponseDto) {
  const photos = request.photos ?? [];
  const image = request.imageUrl ? [request.imageUrl] : [];
  const list = [...photos, ...image].filter(Boolean);
  const unique = Array.from(new Set(list));
  if (unique.length) return unique.slice(0, 4);
  return [pickRequestImage(request.categoryKey ?? '')];
}

export function pickRequestImage(categoryKey: string) {
  const map: Record<string, string> = {
    cleaning: '/Reinigung im modernen Wohnzimmer.jpg',
    electric: '/Elektriker bei der Arbeit an Schaltschrank.jpg',
    plumbing: '/Freundlicher Klempner bei der Arbeit.jpg',
    repair: '/Techniker repariert Smartphone in Werkstatt.jpg',
    moving: '/Lädt Kisten aus einem Transporter.jpg',
  };
  return map[categoryKey] ?? '/Handwerker%20in%20einem%20modernen%20Wohnzimmer.jpg';
}
