// src/lib/api/dto/requests.ts
export type RequestStatus = 'draft' | 'published' | 'closed' | 'cancelled' | 'matched';

export type CreateRequestDto = {
  serviceKey: string;
  cityId: string;
  propertyType: 'apartment' | 'house';
  area: number;
  preferredDate: string;
  isRecurring: boolean;
  comment?: string;
};

export type RequestResponseDto = {
  id: string;
  serviceKey: string;
  cityId: string;
  propertyType: 'apartment' | 'house';
  area: number;
  preferredDate: string;
  isRecurring: boolean;
  comment?: string | null;
  status: RequestStatus;
  createdAt: string;
};
