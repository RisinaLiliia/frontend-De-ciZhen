import { apiGet } from '@/lib/api/http';
import type { BookingDto } from '@/lib/api/dto/bookings';

export type ListMyBookingsQuery = {
  status?: 'confirmed' | 'cancelled' | 'completed';
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

type ListAllMyBookingsQuery = Omit<ListMyBookingsQuery, 'limit' | 'offset'> & {
  pageLimit?: number;
  maxPages?: number;
};

function normalizeLimit(value: number | undefined) {
  if (value == null) return undefined;
  const int = Math.trunc(value);
  return Math.min(Math.max(int, 1), 100);
}

function normalizeOffset(value: number | undefined) {
  if (value == null) return undefined;
  const int = Math.trunc(value);
  return Math.max(int, 0);
}

export function listMyBookings(params: ListMyBookingsQuery = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  const limit = normalizeLimit(params.limit);
  const offset = normalizeOffset(params.offset);
  if (limit != null) qs.set('limit', String(limit));
  if (offset != null) qs.set('offset', String(offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<BookingDto[]>(`/bookings/my${suffix}`);
}

export async function listAllMyBookings(params: ListAllMyBookingsQuery = {}): Promise<BookingDto[]> {
  const pageLimit = normalizeLimit(params.pageLimit ?? 100) ?? 100;
  const maxPagesRaw = Number.isFinite(params.maxPages) ? Number(params.maxPages) : 25;
  const maxPages = Math.min(Math.max(Math.trunc(maxPagesRaw), 1), 50);

  const uniqueById = new Map<string, BookingDto>();

  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * pageLimit;
    const pageItems = await listMyBookings({
      status: params.status,
      from: params.from,
      to: params.to,
      limit: pageLimit,
      offset,
    });

    if (pageItems.length === 0) break;
    pageItems.forEach((item) => {
      if (item?.id) uniqueById.set(item.id, item);
    });
    if (pageItems.length < pageLimit) break;
  }

  return Array.from(uniqueById.values());
}
