export type PublicWorkspaceSection =
  | 'requests'
  | 'providers'
  | 'stats'
  | 'profile'
  | 'chat'
  | 'settings'
  | 'help';
export type PublicWorkspaceSectionParam = PublicWorkspaceSection | 'orders' | 'actions';

export function resolvePublicWorkspaceSection(value: string | null): PublicWorkspaceSection | null {
  if (value === 'orders' || value === 'requests') return 'requests';
  if (
    value === 'providers'
    || value === 'stats'
    || value === 'profile'
    || value === 'chat'
    || value === 'settings'
    || value === 'help'
  ) {
    return value;
  }
  if (value === 'reviews') return 'stats';
  if (value === 'actions') return 'profile';
  return null;
}
