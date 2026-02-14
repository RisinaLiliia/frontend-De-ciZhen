// src/lib/api/dto/offers.ts
export type OfferStatus = 'sent' | 'accepted' | 'declined' | 'withdrawn';

export type CreateOfferDto = {
  requestId: string;
  amount: number;
  message?: string;
  priceType?: 'fixed' | 'estimate' | 'hourly';
  availableAt?: string;
  availabilityNote?: string;
};

export type UpdateOfferDto = {
  amount: number;
  message?: string;
  priceType?: 'fixed' | 'estimate' | 'hourly';
  availableAt?: string;
  availabilityNote?: string;
};

export type CreateOfferResponseDto = {
  offer: OfferDto;
  providerProfile: {
    id: string;
    userId: string;
    displayName?: string | null;
    bio?: string | null;
    companyName?: string | null;
    vatId?: string | null;
    cityId?: string | null;
    serviceKeys: string[];
    basePrice?: number | null;
    status: 'draft' | 'active' | 'suspended';
    isBlocked: boolean;
    blockedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  };
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
  requestStatus?: 'draft' | 'published' | 'paused' | 'matched' | 'closed' | 'cancelled' | null;
};

export type AcceptOfferResultDto = {
  ok: boolean;
  acceptedOfferId: string;
};

export type DeclineOfferResultDto = {
  ok: boolean;
  rejectedOfferId: string;
};

export type DeleteOfferResultDto = {
  ok: boolean;
  deletedOfferId: string;
};
