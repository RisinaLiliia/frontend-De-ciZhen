import { apiGet, apiPatchForm, apiPost, apiPostForm } from '@/lib/api/http';
import type {
  AuthResponseDto,
} from '@/lib/api/dto/auth';
import type {
  WorkspaceProfileDto,
  WorkspacePrivateOverviewDto,
  WorkspaceActionsResponseDto,
  WorkspaceChatResponseDto,
  WorkspaceProvidersResponseDto,
  WorkspaceProvidersViewerModeDto,
  WorkspacePublicOverviewDto,
  WorkspacePublicRequestsBatchResponseDto,
  WorkspaceReviewsResponseDto,
  WorkspaceRequestsPeriodDto,
  WorkspaceRequestsResponseDto,
  WorkspaceRequestsRoleDto,
  WorkspaceRequestsScopeDto,
  WorkspaceRequestsStateDto,
  WorkspaceStatisticsOverviewDto,
  WorkspaceStatisticsRange,
  StatisticsViewerMode,
} from '@/lib/api/dto/workspace';

export type WorkspacePublicOverviewQuery = {
  cityId?: string;
  categoryKey?: string;
  subcategoryKey?: string;
  sort?: 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc';
  state?: WorkspaceRequestsStateDto;
  period?: WorkspaceRequestsPeriodDto;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
  activityRange?: WorkspaceStatisticsRange;
  cityActivityLimit?: number;
};

function buildWorkspacePublicOverviewQuery(params: WorkspacePublicOverviewQuery = {}) {
  const qs = new URLSearchParams();
  if (params.cityId) qs.set('cityId', params.cityId);
  if (params.categoryKey) qs.set('categoryKey', params.categoryKey);
  if (params.subcategoryKey) qs.set('subcategoryKey', params.subcategoryKey);
  if (params.sort) qs.set('sort', params.sort);
  if (params.state) qs.set('state', params.state);
  if (params.period) qs.set('period', params.period);
  if (typeof params.priceMin === 'number') qs.set('priceMin', String(params.priceMin));
  if (typeof params.priceMax === 'number') qs.set('priceMax', String(params.priceMax));
  if (typeof params.page === 'number') qs.set('page', String(Math.max(1, Math.trunc(params.page))));
  if (typeof params.limit === 'number') {
    qs.set('limit', String(Math.min(100, Math.max(1, Math.trunc(params.limit)))));
  }
  if (params.activityRange) qs.set('activityRange', params.activityRange);
  if (typeof params.cityActivityLimit === 'number') {
    qs.set('cityActivityLimit', String(Math.min(5000, Math.max(1, Math.trunc(params.cityActivityLimit)))));
  }
  return qs.toString();
}

export function getWorkspacePublicOverview(params: WorkspacePublicOverviewQuery = {}) {
  const suffix = buildWorkspacePublicOverviewQuery(params);
  return apiGet<WorkspacePublicOverviewDto>(`/workspace/public${suffix ? `?${suffix}` : ''}`);
}

export type WorkspacePrivateOverviewQuery = {
  period?: WorkspaceRequestsPeriodDto | null;
};

export function getWorkspacePrivateOverview(query: WorkspacePrivateOverviewQuery = {}) {
  const qs = new URLSearchParams();
  if (query.period) qs.set('period', query.period);
  return apiGet<WorkspacePrivateOverviewDto>(`/workspace/private${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export type WorkspaceRequestsQuery = {
  scope?: WorkspaceRequestsScopeDto;
  role?: WorkspaceRequestsRoleDto;
  state?: WorkspaceRequestsStateDto;
  city?: string | null;
  category?: string | null;
  service?: string | null;
  period?: WorkspaceRequestsPeriodDto;
  sort?: string | null;
  page?: number;
  limit?: number;
};

export type WorkspaceProvidersQuery = {
  cityId?: string | null;
  categoryKey?: string | null;
  subcategoryKey?: string | null;
  period?: WorkspaceRequestsPeriodDto;
  viewerMode?: WorkspaceProvidersViewerModeDto | null;
  sort?: 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc' | null;
  page?: number;
  limit?: number;
};

export function getWorkspaceRequests(query: WorkspaceRequestsQuery = {}) {
  const qs = new URLSearchParams();
  if (query.scope) qs.set('scope', query.scope);
  if (query.role) qs.set('role', query.role);
  if (query.state) qs.set('state', query.state);
  if (query.city) qs.set('city', query.city);
  if (query.category) qs.set('category', query.category);
  if (query.service) qs.set('service', query.service);
  if (query.period) qs.set('period', query.period);
  if (query.sort) qs.set('sort', query.sort);
  if (typeof query.page === 'number') qs.set('page', String(Math.max(1, Math.trunc(query.page))));
  if (typeof query.limit === 'number') qs.set('limit', String(Math.min(100, Math.max(1, Math.trunc(query.limit)))));
  return apiGet<WorkspaceRequestsResponseDto>(`/workspace/requests${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export function getWorkspaceProviders(query: WorkspaceProvidersQuery = {}) {
  const qs = new URLSearchParams();
  if (query.cityId) qs.set('cityId', query.cityId);
  if (query.categoryKey) qs.set('categoryKey', query.categoryKey);
  if (query.subcategoryKey) qs.set('subcategoryKey', query.subcategoryKey);
  if (query.period) qs.set('period', query.period);
  if (query.viewerMode) qs.set('viewerMode', query.viewerMode);
  if (query.sort) qs.set('sort', query.sort);
  if (typeof query.page === 'number') qs.set('page', String(Math.max(1, Math.trunc(query.page))));
  if (typeof query.limit === 'number') qs.set('limit', String(Math.min(100, Math.max(1, Math.trunc(query.limit)))));
  return apiGet<WorkspaceProvidersResponseDto>(`/workspace/providers${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export type WorkspaceReviewsQuery = {
  range?: WorkspaceRequestsPeriodDto;
  sort?: 'created_desc' | 'rating_desc';
};

export function getWorkspaceReviews(query: WorkspaceReviewsQuery = {}) {
  const qs = new URLSearchParams();
  if (query.range) qs.set('range', query.range);
  if (query.sort) qs.set('sort', query.sort);
  return apiGet<WorkspaceReviewsResponseDto>(`/workspace/reviews${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export function getWorkspaceActions() {
  return apiGet<WorkspaceActionsResponseDto>('/workspace/actions');
}

export function getWorkspaceChat() {
  return apiGet<WorkspaceChatResponseDto>('/workspace/chat');
}

export type WorkspaceStatisticsQuery = {
  range?: WorkspaceStatisticsRange;
  cityId?: string | null;
  regionId?: string | null;
  categoryKey?: string | null;
  subcategoryKey?: string | null;
  viewerMode?: StatisticsViewerMode | null;
  citiesPage?: number;
  citiesLimit?: number;
};

export function getWorkspaceStatistics(query: WorkspaceStatisticsRange | WorkspaceStatisticsQuery = '30d') {
  const params: WorkspaceStatisticsQuery = typeof query === 'string'
    ? { range: query }
    : query;
  const qs = new URLSearchParams();
  qs.set('range', params.range ?? '30d');
  if (params.cityId) qs.set('cityId', params.cityId);
  if (params.regionId) qs.set('regionId', params.regionId);
  if (params.categoryKey) qs.set('categoryKey', params.categoryKey);
  if (params.subcategoryKey) qs.set('subcategoryKey', params.subcategoryKey);
  if (params.viewerMode) qs.set('viewerMode', params.viewerMode);
  if (typeof params.citiesPage === 'number') {
    qs.set('citiesPage', String(Math.max(1, Math.trunc(params.citiesPage))));
  }
  if (typeof params.citiesLimit === 'number') {
    qs.set('citiesLimit', String(Math.min(50, Math.max(1, Math.trunc(params.citiesLimit)))));
  }
  return apiGet<WorkspaceStatisticsOverviewDto>(`/workspace/statistics?${qs.toString()}`);
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

export function getWorkspaceProfile() {
  return apiGet<WorkspaceProfileDto>('/workspace/profile');
}

export function saveWorkspaceProfile(payload: FormData) {
  return apiPatchForm<WorkspaceProfileDto>('/workspace/profile', payload);
}

export function registerWorkspaceProfile(payload: FormData) {
  return apiPostForm<AuthResponseDto>('/workspace/profile/register', payload);
}
