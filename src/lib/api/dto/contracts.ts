// src/lib/api/dto/contracts.ts
export type ContractStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

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
