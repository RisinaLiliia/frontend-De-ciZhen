export function buildLastSixMonthSeries(
  monthFormatter: Intl.DateTimeFormat,
  map: (startTs: number, endTs: number) => { bars: number; line: number },
) {
  const out: Array<{ label: string; bars: number; line: number }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const point = map(start.getTime(), end.getTime());
    out.push({
      label: monthFormatter.format(start),
      bars: point.bars,
      line: point.line,
    });
  }
  return out;
}

export function computeProfileCompleteness(profile: {
  displayName?: string | null;
  bio?: string | null;
  cityId?: string | null;
  serviceKeys?: string[];
  basePrice?: number | null;
  companyName?: string | null;
  vatId?: string | null;
  status?: string;
  isBlocked?: boolean;
} | null | undefined) {
  if (!profile) return 0;
  let score = 0;
  if (profile.displayName?.trim()) score += 15;
  if (profile.bio?.trim()) score += 15;
  if (profile.cityId?.trim()) score += 15;
  if ((profile.serviceKeys?.length ?? 0) > 0) score += 25;
  if (typeof profile.basePrice === 'number' && profile.basePrice > 0) score += 10;
  if (profile.companyName?.trim() || profile.vatId?.trim()) score += 10;
  if (profile.status === 'active' && !profile.isBlocked) score += 10;
  return Math.max(0, Math.min(100, score));
}

export function computeClientCompleteness(me: {
  name?: string;
  email?: string;
  city?: string;
  phone?: string;
  avatar?: { url?: string };
  acceptedPrivacyPolicy?: boolean;
  clientProfile?: { id?: string; status?: string } | null;
} | null) {
  if (!me) return 0;
  let score = 0;
  if (me.name?.trim()) score += 20;
  if (me.email?.trim()) score += 20;
  if (me.city?.trim()) score += 20;
  if (me.phone?.trim()) score += 15;
  if (me.avatar?.url?.trim()) score += 15;
  if (me.acceptedPrivacyPolicy) score += 5;
  if (me.clientProfile?.id) score += 5;
  return Math.max(0, Math.min(100, score));
}

export type DeltaResult =
  | { kind: 'percent'; value: number }
  | { kind: 'new' }
  | { kind: 'none' };

export function calcMoMDeltaPercent(current: number, previous: number): DeltaResult {
  if (previous <= 0) {
    if (current <= 0) return { kind: 'none' };
    return { kind: 'new' };
  }
  const raw = ((current - previous) / previous) * 100;
  const rounded = Math.round(raw);
  if (Object.is(rounded, -0) || rounded === 0) return { kind: 'percent', value: 0 };
  return { kind: 'percent', value: rounded };
}

export function formatMoMDeltaLabel(delta: DeltaResult, locale: string): string {
  const isDe = locale.startsWith('de');
  if (delta.kind === 'new') {
    return isDe ? 'Neu zum letzten Monat.' : 'New vs last month.';
  }
  if (delta.kind === 'none') {
    return isDe ? '0% zum letzten Monat.' : '0% vs last month.';
  }
  const sign = delta.value > 0 ? '+' : '';
  return isDe ? `${sign}${delta.value}% zum letzten Monat.` : `${sign}${delta.value}% vs last month.`;
}

export function countCompletedInMonth(
  contracts: Array<{ completedAt: string | null }>,
  monthOffsetFromNow: number,
) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffsetFromNow, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffsetFromNow + 1, 1);
  const startTs = start.getTime();
  const endTs = end.getTime();
  return contracts.filter((item) => {
    if (!item.completedAt) return false;
    const ts = new Date(item.completedAt).getTime();
    return Number.isFinite(ts) && ts >= startTs && ts < endTs;
  }).length;
}

