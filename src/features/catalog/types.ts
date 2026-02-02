// src/features/catalog/types.ts
export type City = { id: string; name: string; country: string };
export type ServiceCategory = { key: string; name: string; isActive: boolean; sortOrder: number };
export type Service = { key: string; name: string; categoryKey: string; isActive: boolean; sortOrder: number };
