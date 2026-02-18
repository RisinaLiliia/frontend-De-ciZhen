export type WorkspaceTab =
  | 'new-orders'
  | 'my-requests'
  | 'my-offers'
  | 'completed-jobs'
  | 'favorites'
  | 'reviews';

export type WorkspaceStatusFilter = 'all' | 'open' | 'in_progress' | 'completed';

export type FavoritesView = 'requests' | 'providers';
export type ReviewsView = 'provider' | 'client';

const WORKSPACE_TABS: WorkspaceTab[] = [
  'new-orders',
  'my-requests',
  'my-offers',
  'completed-jobs',
  'favorites',
  'reviews',
];

export const ORDERS_TAB_STORAGE_KEY = 'dc_orders_tab';

export function resolveWorkspaceTab(value: string | null): WorkspaceTab {
  return value && WORKSPACE_TABS.includes(value as WorkspaceTab) ? (value as WorkspaceTab) : 'new-orders';
}

export function resolveStatusFilter(value: string | null): WorkspaceStatusFilter {
  return value === 'open' || value === 'in_progress' || value === 'completed' ? value : 'all';
}

export function resolveFavoritesView(value: string | null): FavoritesView {
  return value === 'providers' ? 'providers' : 'requests';
}

export function resolveReviewsView(value: string | null): ReviewsView {
  return value === 'client' ? 'client' : 'provider';
}

export function mapRequestStatusToFilter(status?: string): WorkspaceStatusFilter {
  if (!status) return 'all';
  if (status === 'completed') return 'completed';
  if (status === 'in_progress' || status === 'assigned' || status === 'matched') return 'in_progress';
  return 'open';
}

export function mapOfferStatusToFilter(status?: string): WorkspaceStatusFilter {
  if (!status) return 'all';
  if (status === 'accepted') return 'in_progress';
  if (status === 'declined') return 'completed';
  return 'open';
}

export function mapContractStatusToFilter(status?: string): WorkspaceStatusFilter {
  if (!status) return 'all';
  if (status === 'completed') return 'completed';
  return 'in_progress';
}

