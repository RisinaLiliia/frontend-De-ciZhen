import type { RequestResponseDto } from '@/lib/api/dto/requests';

export type CustomerPublicProfileSnapshot = {
  userId: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  cityName: string | null;
  ratingAvg: number | null;
  ratingCount: number | null;
  isOnline: boolean | null;
};

export function buildCustomerPublicProfileSnapshotFromRequest(
  request: RequestResponseDto,
): CustomerPublicProfileSnapshot {
  return {
    userId: request.clientId?.trim() || null,
    displayName: request.clientName?.trim() || null,
    bio: null,
    avatarUrl: request.clientAvatarUrl?.trim() || null,
    cityName:
      request.clientCity?.trim() || request.cityName?.trim() || request.cityId?.trim() || null,
    ratingAvg: typeof request.clientRatingAvg === 'number' ? request.clientRatingAvg : null,
    ratingCount: typeof request.clientRatingCount === 'number' ? request.clientRatingCount : null,
    isOnline: typeof request.clientIsOnline === 'boolean' ? request.clientIsOnline : null,
  };
}
