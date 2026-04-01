// src/features/catalog/model.ts
export type City = {
  id: string;
  key: string;
  name: string;
  i18n: Record<string, string>;
  countryCode: string;
  stateName: string | null;
  districtName: string | null;
  postalCodes: string[];
  isActive: boolean;
  sortOrder: number;
};

export type ServiceCategory = {
  key: string;
  i18n: Record<string, string>;
  sortOrder: number;
  isActive: boolean;
};

export type Service = {
  key: string;
  i18n: Record<string, string>;
  categoryKey: string;
  sortOrder: number;
  isActive: boolean;
};
