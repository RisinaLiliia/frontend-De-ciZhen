export type PublicWorkspaceSection =
  | 'requests'
  | 'providers'
  | 'reviews'
  | 'stats'
  | 'profile'
  | 'chat'
  | 'settings'
  | 'help'
  | 'privacy'
  | 'cookies';
export type PublicWorkspaceSectionParam = PublicWorkspaceSection | 'orders' | 'actions';

export function resolvePublicWorkspaceSection(value: string | null): PublicWorkspaceSection | null {
  if (value === 'orders' || value === 'requests') return 'requests';
  if (
    value === 'providers'
    || value === 'reviews'
    || value === 'stats'
    || value === 'profile'
    || value === 'chat'
    || value === 'settings'
    || value === 'help'
    || value === 'privacy'
    || value === 'cookies'
  ) {
    return value;
  }
  if (value === 'actions') return 'profile';
  return null;
}
