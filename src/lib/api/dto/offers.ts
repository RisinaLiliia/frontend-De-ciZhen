// src/lib/api/dto/offers.ts
export type OfferStatus = 'sent' | 'accepted' | 'declined' | 'withdrawn';

export type CreateOfferDto = {
  requestId: string;
  message?: string;
  amount?: number;
  priceType?: 'fixed' | 'estimate' | 'hourly';
  availableAt?: string;
  availabilityNote?: string;
};

export type OfferDto = {
  id: string;
  requestId: string;
  providerUserId: string;
  clientUserId: string;
  status: OfferStatus;
  message?: string | null;
  amount?: number | null;
  priceType?: 'fixed' | 'estimate' | 'hourly' | null;
  availableAt?: string | null;
  availabilityNote?: string | null;
  createdAt: string;
  updatedAt: string;
  providerDisplayName?: string | null;
  providerAvatarUrl?: string | null;
  providerRatingAvg?: number;
  providerRatingCount?: number;
  providerCompletedJobs?: number;
  providerBasePrice?: number | null;
  requestServiceKey?: string | null;
  requestCityId?: string | null;
  requestPreferredDate?: string | null;
  requestStatus?: 'draft' | 'published' | 'matched' | 'closed' | 'cancelled' | null;
};

export type AcceptOfferResultDto = {
  ok: boolean;
  acceptedOfferId: string;
};

export type DeclineOfferResultDto = {
  ok: boolean;
  rejectedOfferId: string;
};
