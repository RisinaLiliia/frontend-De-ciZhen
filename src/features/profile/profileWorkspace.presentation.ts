import type { ProviderProfileDto, ProviderPublicDto } from '@/lib/api/dto/providers';
import { buildApiUrl } from '@/lib/api/url';

export function findProviderPublicByUserId(
  list: ProviderPublicDto[],
  userId?: string | null,
): ProviderPublicDto | null {
  const currentUserId = String(userId ?? '').trim();
  if (!currentUserId) return null;
  return (
    list.find((item) => item.userId === currentUserId) ??
    list.find((item) => item.id === currentUserId) ??
    null
  );
}

export function computeManualProfileCompleteness({
  name,
  city,
  phone,
  bio,
  avatarUrl,
}: {
  name?: string | null;
  city?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}): number {
  const checks = [
    Boolean(name?.trim()),
    Boolean(city?.trim()),
    Boolean(phone?.trim()),
    Boolean(bio?.trim()),
    Boolean(avatarUrl),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function resolveProfileCompleteness({
  manualProfileCompleteness,
  hasProviderProfile,
  providerProfile,
}: {
  manualProfileCompleteness: number;
  hasProviderProfile: boolean;
  providerProfile: ProviderProfileDto | null | undefined;
}): number {
  if (!hasProviderProfile) return manualProfileCompleteness;
  if (providerProfile?.isProfileComplete === true) return 100;
  if (providerProfile?.isProfileComplete === false) return Math.min(manualProfileCompleteness, 99);
  return manualProfileCompleteness;
}

export function resolveAvatarPreviewUrl(avatarUrl?: string | null): string | null {
  const raw = avatarUrl?.trim();
  if (!raw) return null;
  if (raw === '/avatars/default.png' || raw.endsWith('/avatars/default.png')) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:image/')) return raw;
  if (raw.startsWith('/')) return raw.startsWith('/api/') ? raw : buildApiUrl(raw);
  return raw;
}
