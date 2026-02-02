// src/features/catalog/model.ts
export type City = {
  id: string;
  name: string;
  countryCode: string;
};

export type ServiceCategory = {
  key: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type Service = {
  key: string;
  name: string;
  categoryKey: string;
  sortOrder: number;
  isActive: boolean;
};
