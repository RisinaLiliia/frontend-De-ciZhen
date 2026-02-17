// src/lib/api/dto/requests.ts
export type RequestStatus = 'draft' | 'published' | 'paused' | 'closed' | 'cancelled' | 'matched';

export type CreateRequestDto = {
  title: string;
  serviceKey: string;
  cityId: string;
  propertyType: 'apartment' | 'house';
  area: number;
  price?: number;
  preferredDate: string;
  isRecurring: boolean;
  description?: string;
  photos?: string[];
  tags?: string[];
};

export type UpdateMyRequestDto = {
  title?: string;
  propertyType?: 'apartment' | 'house';
  area?: number;
  price?: number;
  preferredDate?: string;
  isRecurring?: boolean;
  comment?: string;
  description?: string;
  photos?: string[];
  tags?: string[];
};

export type DeleteMyRequestResponseDto = {
  ok: true;
  deletedRequestId: string;
};

export type RequestResponseDto = {
  id: string;
  serviceKey: string;
  cityId: string;
  cityName?: string | null;
  categoryKey?: string | null;
  categoryName?: string | null;
  subcategoryName?: string | null;
  propertyType: 'apartment' | 'house';
  area: number;
  price?: number | null;
  preferredDate: string;
  isRecurring: boolean;
  title?: string | null;
  description?: string | null;
  photos?: string[] | null;
  imageUrl?: string | null;
  tags?: string[] | null;
  clientId?: string | null;
  clientName?: string | null;
  clientAvatarUrl?: string | null;
  clientCity?: string | null;
  clientRatingAvg?: number | null;
  clientRatingCount?: number | null;
  clientIsOnline?: boolean | null;
  clientLastSeenAt?: string | null;
  status: RequestStatus;
  createdAt: string;
};

export type PublicRequestsResponseDto = {
  items: RequestResponseDto[];
  total: number;
  page: number;
  limit: number;
};
