import { apiGet, apiPost } from '@/lib/api/http';
import type {
  WorkspacePrivateOverviewDto,
  WorkspacePublicOverviewDto,
  WorkspacePublicRequestsBatchResponseDto,
} from '@/lib/api/dto/workspace';

export type WorkspacePublicOverviewQuery = {
  cityId?: string;
  categoryKey?: string;
  subcategoryKey?: string;
  sort?: 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc';
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
  activityRange?: '24h' | '7d' | '30d';
  cityActivityLimit?: number;
};

function buildWorkspacePublicOverviewQuery(params: WorkspacePublicOverviewQuery = {}) {
  const qs = new URLSearchParams();
  if (params.cityId) qs.set('cityId', params.cityId);
  if (params.categoryKey) qs.set('categoryKey', params.categoryKey);
  if (params.subcategoryKey) qs.set('subcategoryKey', params.subcategoryKey);
  if (params.sort) qs.set('sort', params.sort);
  if (typeof params.priceMin === 'number') qs.set('priceMin', String(params.priceMin));
  if (typeof params.priceMax === 'number') qs.set('priceMax', String(params.priceMax));
  if (typeof params.page === 'number') qs.set('page', String(Math.max(1, Math.trunc(params.page))));
  if (typeof params.limit === 'number') {
    qs.set('limit', String(Math.min(100, Math.max(1, Math.trunc(params.limit)))));
  }
  if (params.activityRange) qs.set('activityRange', params.activityRange);
  if (typeof params.cityActivityLimit === 'number') {
    qs.set('cityActivityLimit', String(Math.min(100, Math.max(1, Math.trunc(params.cityActivityLimit)))));
  }
  return qs.toString();
}

export function getWorkspacePublicOverview(params: WorkspacePublicOverviewQuery = {}) {
  const suffix = buildWorkspacePublicOverviewQuery(params);
  return apiGet<WorkspacePublicOverviewDto>(`/workspace/public${suffix ? `?${suffix}` : ''}`);
}

export function getWorkspacePrivateOverview() {
  return apiGet<WorkspacePrivateOverviewDto>('/workspace/private');
}

export function getWorkspacePublicRequestsBatch(ids: string[]) {
  const normalizedIds = Array.from(
    new Set(
      ids
        .map((id) => String(id ?? '').trim())
        .filter((id) => id.length > 0),
    ),
  ).slice(0, 100);

  if (normalizedIds.length === 0) {
    return Promise.resolve<WorkspacePublicRequestsBatchResponseDto>({
      items: [],
      missingIds: [],
    });
  }

  return apiPost<{ ids: string[] }, WorkspacePublicRequestsBatchResponseDto>(
    '/workspace/public/requests-batch',
    { ids: normalizedIds },
  );
}
