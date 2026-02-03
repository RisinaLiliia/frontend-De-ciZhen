// src/lib/api/dto/catalog.ts
export type CityResponseDto = {
  _id: string;
  key: string;
  name: string;
  i18n: Record<string, string>;
  countryCode: string;
  isActive: boolean;
  sortOrder: number;
};

export type ServiceCategoryDto = {
  key: string;
  i18n: Record<string, string>;
  sortOrder: number;
  isActive: boolean;
};

export type ServiceDto = {
  key: string;
  i18n: Record<string, string>;
  categoryKey: string;
  sortOrder: number;
  isActive: boolean;
};
