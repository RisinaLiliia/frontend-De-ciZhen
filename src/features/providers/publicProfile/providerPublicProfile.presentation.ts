import { parseDateSafe, toIsoDayLocal } from '@/lib/utils/date';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';

export type ProviderAvailabilityModel = {
  isBusy: boolean;
  stateLabel: string;
  datePrefix: string;
  dateLabel: string;
  dateIso: string;
};

type ProviderSlotLike = {
  startAt?: string | null;
};

export function getProviderServiceKeys(provider: ProviderPublicDto): string[] {
  const direct = provider.serviceKey;
  const list = provider.serviceKeys;
  return Array.from(
    new Set(
      [
        ...(Array.isArray(list) ? list : []),
        ...(typeof direct === 'string' && direct.trim().length > 0 ? [direct] : []),
      ]
        .map((value) => value?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

export function getProviderCityKey(provider: ProviderPublicDto): string {
  const byId = (provider.cityId ?? '').trim().toLowerCase();
  if (byId) return `id:${byId}`;
  const byName = (provider.cityName ?? '').trim().toLowerCase();
  if (byName) return `name:${byName}`;
  return '';
}

export function getNextSlotStartAt(providerSlots: ProviderSlotLike[]): string | null {
  const startCandidates = providerSlots
    .map((slot) => slot?.startAt)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .filter((value) => Number.isFinite(new Date(value).getTime()))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return startCandidates[0] ?? null;
}

export function getAvailableIsoDays(providerSlots: ProviderSlotLike[]): string[] {
  const days = providerSlots
    .map((slot) => slot?.startAt)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => {
      const parsed = new Date(value);
      if (!Number.isFinite(parsed.getTime())) return '';
      return toIsoDayLocal(parsed);
    })
    .filter((value): value is string => value.length > 0);
  return Array.from(new Set(days)).sort();
}

export function buildProviderAvailabilityModel({
  availabilityState,
  nextAvailableAt,
  nextSlotStartAt,
  formatLongDate,
  openLabel,
  busyLabel,
  nextSlotLabel,
}: {
  availabilityState?: ProviderPublicDto['availabilityState'];
  nextAvailableAt?: string | null;
  nextSlotStartAt?: string | null;
  formatLongDate: (value: Date) => string;
  openLabel: string;
  busyLabel: string;
  nextSlotLabel: string;
}): ProviderAvailabilityModel {
  const firstSlotDate = parseDateSafe(nextSlotStartAt);
  const nextAvailableDate = parseDateSafe(nextAvailableAt);
  const resolvedDate = firstSlotDate ?? nextAvailableDate ?? new Date();
  const resolvedState = availabilityState
    ? availabilityState
    : firstSlotDate
      ? 'open'
      : 'busy';
  const isBusy = resolvedState === 'busy';

  return {
    isBusy,
    stateLabel: isBusy ? busyLabel : openLabel,
    datePrefix: nextSlotLabel,
    dateLabel: formatLongDate(resolvedDate),
    dateIso: toIsoDayLocal(resolvedDate),
  };
}
