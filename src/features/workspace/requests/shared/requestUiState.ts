import type { OfferDto, OfferStatus } from '@/lib/api/dto/offers';

export type OfferCardState = 'none' | 'sent' | 'accepted' | 'declined';

export function resolveOfferCardState(
  offer?: Pick<OfferDto, 'status'> | null,
): OfferCardState {
  const status = offer?.status as OfferStatus | undefined;
  if (!status || status === 'withdrawn') return 'none';
  if (status === 'accepted') return 'accepted';
  if (status === 'declined') return 'declined';
  return 'sent';
}

