import { buildWorkspaceHref } from '@/features/workspace/shell/workspaceLinks';

export type WorkspaceRequestsScope = 'market' | 'my';
export type WorkspaceRequestsRole = 'all' | 'customer' | 'provider';
export type WorkspaceRequestsState = 'all' | 'attention' | 'execution' | 'completed';
export type WorkspaceRequestsPeriod = '24h' | '7d' | '30d' | '90d';

export function resolveWorkspaceRequestsScope(
  value: string | null,
  isAuthed: boolean,
): WorkspaceRequestsScope {
  if (value === 'my') return 'my';
  if (value === 'market') return 'market';
  void isAuthed;
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
