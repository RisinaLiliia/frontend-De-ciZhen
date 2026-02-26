import { apiGet } from '@/lib/api/http';
import type { ProviderSlotDto } from '@/lib/api/dto/availability';

type ListProviderSlotsParams = {
  providerUserId: string;
  from: string;
  to: string;
  tz?: string;
};

export function listProviderSlots(params: ListProviderSlotsParams) {
  const qs = new URLSearchParams();
  qs.set('from', params.from);
  qs.set('to', params.to);
  if (params.tz?.trim()) qs.set('tz', params.tz.trim());
  return apiGet<ProviderSlotDto[]>(
    `/availability/providers/${encodeURIComponent(params.providerUserId)}/slots?${qs.toString()}`,
  );
}
