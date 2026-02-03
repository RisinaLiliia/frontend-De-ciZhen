// src/features/catalog/mappers.ts
import type { CityResponseDto, ServiceCategoryDto, ServiceDto } from '@/lib/api/dto/catalog';
import type { City, Service, ServiceCategory } from './model';

export const mapCity = (dto: CityResponseDto): City => ({
  id: dto._id,
  key: dto.key,
  i18n: dto.i18n,
  countryCode: dto.countryCode,
  isActive: dto.isActive,
  sortOrder: dto.sortOrder,
});

export const mapCategory = (dto: ServiceCategoryDto): ServiceCategory => ({
  key: dto.key,
  i18n: dto.i18n,
  sortOrder: dto.sortOrder,
  isActive: dto.isActive,
});

export const mapService = (dto: ServiceDto): Service => ({
  key: dto.key,
  i18n: dto.i18n,
  categoryKey: dto.categoryKey,
  sortOrder: dto.sortOrder,
  isActive: dto.isActive,
});
