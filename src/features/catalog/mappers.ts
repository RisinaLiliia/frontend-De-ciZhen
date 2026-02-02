// src/features/catalog/mappers.ts
import type { CityResponseDto, ServiceCategoryDto, ServiceDto } from "@/lib/api/dto/catalog";
import type { City, Service, ServiceCategory } from "./model";

export const mapCity = (dto: CityResponseDto): City => ({
  id: dto.id,
  name: dto.name,
  countryCode: dto.countryCode,
});

export const mapCategory = (dto: ServiceCategoryDto): ServiceCategory => dto;

export const mapService = (dto: ServiceDto): Service => dto;
