// src/lib/api/dto/providers.ts
export type ProviderStatus = 'draft' | 'active' | 'suspended';

export type ProviderPublicDto = {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
  basePrice?: number | null;
  cityId?: string | null;
  cityName?: string | null;
  serviceKey?: string | null;
  serviceKeys?: string[];
};

export type ProviderProfileDto = {
  id: string;
  userId: string;
  displayName?: string | null;
  bio?: string | null;
  companyName?: string | null;
  vatId?: string | null;
  cityId?: string | null;
  serviceKeys: string[];
  basePrice?: number | null;
  status: ProviderStatus;
  isBlocked: boolean;
  blockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateMyProviderProfileDto = {
  displayName?: string;
  bio?: string;
  companyName?: string;
  vatId?: string;
  cityId?: string;
  serviceKeys?: string[];
  basePrice?: number;
};
