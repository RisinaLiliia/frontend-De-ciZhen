// src/lib/api/offers.ts
import { apiGet, apiPatch, apiPost } from '@/lib/api/http';
import type {
  AcceptOfferResultDto,
  CreateOfferDto,
  CreateOfferResponseDto,
  DeclineOfferResultDto,
  OfferDto,
} from '@/lib/api/dto/offers';

export function listOffersByRequest(requestId: string, params?: { status?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<OfferDto[]>(`/offers/by-request/${requestId}${suffix}`);
}

export function listMyClientOffers(params?: { status?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<OfferDto[]>(`/offers/my-client${suffix}`);
}

export function listMyProviderOffers(params?: { status?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<OfferDto[]>(`/offers/my${suffix}`);
}

export function createOffer(payload: CreateOfferDto) {
  return apiPost<CreateOfferDto, CreateOfferResponseDto>('/offers', payload);
}

export function acceptOffer(id: string) {
  return apiPatch<void, AcceptOfferResultDto>(`/offers/actions/${id}/accept`, undefined);
}

export function declineOffer(id: string) {
  return apiPatch<void, DeclineOfferResultDto>(`/offers/actions/${id}/decline`, undefined);
}
