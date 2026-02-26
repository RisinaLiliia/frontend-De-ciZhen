export function createLongDateFormatter(localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function toIsoDayLocal(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromIsoDay(iso: string) {
  const [year, month, day] = iso.split('-').map((value) => Number(value));
  return new Date(year, month - 1, day);
}

export function parseDateSafe(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}
