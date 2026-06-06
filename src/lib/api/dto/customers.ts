export type CustomerPublicDto = {
  id: string;
  userId: string;
  displayName: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  cityId?: string | null;
  cityName?: string | null;
  ratingAvg: number;
  ratingCount: number;
  isOnline: boolean;
  lastSeenAt?: string | null;
};
