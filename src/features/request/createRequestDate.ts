import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { ProviderSlotDto } from '@/lib/api/dto/availability';
import { parseDateSafe, toIsoDayLocal } from '@/lib/utils/date';

export function toPreferredDateValue(dayIso: string) {
  return `${dayIso}T09:00`;
}

export function createIsoRangeFromToday(daysAhead: number) {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + Math.max(0, daysAhead));
  return { from: toIsoDayLocal(from), to: toIsoDayLocal(to) };
}

export function resolveProviderTargetUserId(provider: ProviderPublicDto | null | undefined) {
  if (!provider) return null;
  if (provider.userId?.trim()) return provider.userId.trim();
  return provider.id;
}

export function resolveProviderSlotsTimezone() {
  if (typeof Intl === 'undefined') return 'Europe/Berlin';
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
}

export function collectAvailableIsoDays(providerSlots: ProviderSlotDto[]): string[] {
  const set = new Set<string>();
  for (const slot of providerSlots) {
    if (!slot?.startAt) continue;
    const parsed = new Date(slot.startAt);
    if (!Number.isFinite(parsed.getTime())) continue;
    set.add(toIsoDayLocal(parsed));
  }
  return Array.from(set.values()).sort();
}

export function createInclusiveIsoDayRange(fromIso: string, toIso: string): string[] {
  const days: string[] = [];
  const cursor = parseDateSafe(toPreferredDateValue(fromIso)) ?? new Date(fromIso);
  const end = parseDateSafe(toPreferredDateValue(toIso)) ?? new Date(toIso);
  cursor.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    days.push(toIsoDayLocal(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
