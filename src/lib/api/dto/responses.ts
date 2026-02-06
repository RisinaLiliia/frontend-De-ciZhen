// src/lib/api/dto/responses.ts
export type ResponseStatus = 'pending' | 'accepted' | 'rejected';

export type CreateResponseDto = {
  requestId: string;
};

export type ResponseDto = {
  id: string;
  requestId: string;
  providerUserId: string;
  clientUserId: string;
  status: ResponseStatus;
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

export type AcceptResponseResultDto = {
  ok: boolean;
  acceptedResponseId: string;
};
