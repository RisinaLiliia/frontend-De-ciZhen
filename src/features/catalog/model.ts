// src/features/catalog/model.ts
export type City = {
  id: string;
  key: string;
  i18n: Record<string, string>;
  countryCode: string;
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
