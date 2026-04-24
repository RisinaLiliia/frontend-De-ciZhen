// src/lib/api/dto/contracts.ts
export type ContractStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type ContractBookingSummaryDto = {
  bookingId: string;
  startAt: string;
  durationMin: number;
  endAt: string;
  status: 'confirmed' | 'cancelled' | 'completed';
};

export type ContractReviewStatusDto = {
  canClientReviewProvider: boolean;
  clientReviewId: string | null;
  clientReviewedProviderAt: string | null;
  clientReviewRating: number | null;
  clientReviewText: string | null;
  canProviderReviewClient: boolean;
  providerReviewId: string | null;
  providerReviewedClientAt: string | null;
  providerReviewRating: number | null;
  providerReviewText: string | null;
};

export type ContractDto = {
  id: string;
  requestId: string;
  offerId: string;
  clientId: string;
  providerUserId: string;
  status: ContractStatus;
  priceAmount: number | null;
  priceType: 'fixed' | 'estimate' | 'hourly' | null;
  priceDetails: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  booking: ContractBookingSummaryDto | null;
  reviewStatus: ContractReviewStatusDto | null;
  createdAt: string;
  updatedAt: string;
};

export type ConfirmContractDto = {
  startAt: string;
  durationMin?: number;
  note?: string;
};

export type CancelContractDto = {
  reason?: string;
};
