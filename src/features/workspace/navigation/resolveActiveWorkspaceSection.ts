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

export function resolvePublicWorkspaceSection(value: string | null): PublicWorkspaceSection | null {
  if (value === 'requests') return 'requests';
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
  return null;
}
