export type WorkspaceTab =
  | 'my-requests'
  | 'my-offers'
  | 'completed-jobs'
  | 'favorites'
  | 'reviews'
  | 'profile';

export type WorkspaceStatusFilter = 'all' | 'open' | 'in_progress' | 'completed';

export type FavoritesView = 'requests' | 'providers';

const WORKSPACE_TABS: WorkspaceTab[] = [
  'my-requests',
  'my-offers',
  'completed-jobs',
  'favorites',
  'reviews',
  'profile',
];

export const REQUESTS_TAB_STORAGE_KEY = 'dc_orders_tab';
export const ORDERS_TAB_STORAGE_KEY = REQUESTS_TAB_STORAGE_KEY;

export function isWorkspaceTab(value: string | null | undefined): value is WorkspaceTab {
  return typeof value === 'string' && WORKSPACE_TABS.includes(value as WorkspaceTab);
}

export function resolveWorkspaceTab(value: string | null): WorkspaceTab {
  return isWorkspaceTab(value) ? value : 'my-requests';
}

export function resolveStatusFilter(value: string | null): WorkspaceStatusFilter {
  return value === 'open' || value === 'in_progress' || value === 'completed' ? value : 'all';
}

export function resolveFavoritesView(value: string | null): FavoritesView {
  return value === 'providers' ? 'providers' : 'requests';
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
