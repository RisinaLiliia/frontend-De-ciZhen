import { buildWorkspaceHref } from '@/features/workspace/shell/workspaceLinks';

export type WorkspaceRequestsScope = 'market' | 'my';
export type WorkspaceRequestsRole = 'all' | 'customer' | 'provider';
export type WorkspaceRequestsState = 'all' | 'attention' | 'execution' | 'completed';
export type WorkspaceRequestsPeriod = '24h' | '7d' | '30d' | '90d';

export const DEFAULT_PRIVATE_WORKSPACE_REQUESTS_PERIOD: WorkspaceRequestsPeriod = '90d';
export const DEFAULT_PRIVATE_WORKSPACE_REQUESTS_HREF =
  '/workspace?section=requests&scope=my&period=90d&range=90d';

export function resolveWorkspaceRequestsScope(
  value: string | null,
  isAuthed: boolean,
): WorkspaceRequestsScope {
  if (value === 'my') return isAuthed ? 'my' : 'market';
  if (value === 'market') return 'market';
  return 'market';
}

export function resolveWorkspaceRequestsRole(value: string | null): WorkspaceRequestsRole {
  if (value === 'customer' || value === 'provider') return value;
  return 'all';
}

export function resolveWorkspaceRequestsState(value: string | null): WorkspaceRequestsState {
  if (value === 'attention' || value === 'open' || value === 'clarifying') return 'attention';
  if (value === 'execution' || value === 'active') return 'execution';
  if (value === 'completed') return 'completed';
  return 'all';
}

export function resolveWorkspaceRequestsPeriod(value: string | null): WorkspaceRequestsPeriod {
  if (value === '24h' || value === '7d' || value === '30d' || value === '90d') return value;
  return '30d';
}

export function buildWorkspaceRequestsScopeHref(params: {
  currentSearch: string | URLSearchParams;
  scope: WorkspaceRequestsScope;
}) {
  return buildWorkspaceHref({
    currentSearch: params.currentSearch,
    section: 'requests',
    patch: {
      scope: params.scope,
    },
    removeKeys: params.scope === 'market' ? ['role', 'state', 'tab'] : ['tab'],
  });
}

function resolveLegacyWorkspaceRole(tab: string | null): WorkspaceRequestsRole | undefined {
  if (tab === 'my-requests') return 'customer';
  if (tab === 'my-offers') return 'provider';
  return undefined;
}

function resolveLegacyWorkspaceState(
  tab: string | null,
  status: string | null,
): WorkspaceRequestsState | undefined {
  if (status === 'open') return 'attention';
  if (status === 'in_progress') return 'execution';
  if (status === 'completed') return 'completed';
  if (tab === 'completed-jobs') return 'execution';
  return undefined;
}

export function buildWorkspacePrivateRequestsHref(params: {
  currentSearch: string | URLSearchParams;
  role?: WorkspaceRequestsRole | null;
  state?: WorkspaceRequestsState | null;
}) {
  const searchParams =
    typeof params.currentSearch === 'string'
      ? new URLSearchParams(params.currentSearch)
      : new URLSearchParams(params.currentSearch.toString());
  const period = resolveWorkspaceRequestsPeriod(
    searchParams.get('period') ?? searchParams.get('range'),
  );

  return buildWorkspaceHref({
    currentSearch: searchParams,
    section: 'requests',
    patch: {
      scope: 'my',
      period,
      range: period,
      role: params.role ?? undefined,
      state: params.state ?? undefined,
    },
    removeKeys: ['tab', 'status', 'fav', 'reviewRole'],
  });
}

export function buildLegacyWorkspaceTabRedirectHref(params: {
  currentSearch: string | URLSearchParams;
}) {
  const searchParams =
    typeof params.currentSearch === 'string'
      ? new URLSearchParams(params.currentSearch)
      : new URLSearchParams(params.currentSearch.toString());
  const legacyTab = searchParams.get('tab');
  const legacyStatus = searchParams.get('status');

  return buildWorkspacePrivateRequestsHref({
    currentSearch: searchParams,
    role: resolveLegacyWorkspaceRole(legacyTab),
    state: resolveLegacyWorkspaceState(legacyTab, legacyStatus),
  });
}
