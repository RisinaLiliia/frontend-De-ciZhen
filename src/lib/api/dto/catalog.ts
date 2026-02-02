// src/lib/api/dto/catalog.ts
export type CityResponseDto = {
  id: string;
  name: string;
  countryCode: string;
  isActive: boolean;
};

export type ServiceCategoryDto = {
  key: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type ServiceDto = {
  key: string;
  name: string;
  categoryKey: string;
  sortOrder: number;
  isActive: boolean;
};
