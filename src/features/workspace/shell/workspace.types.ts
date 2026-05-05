export type PublicWorkspaceSection = 'requests' | 'providers' | 'stats' | 'reviews' | 'actions';
export type PublicWorkspaceSectionParam = PublicWorkspaceSection | 'orders' | 'profile';

export function resolvePublicWorkspaceSection(value: string | null): PublicWorkspaceSection | null {
  if (value === 'orders' || value === 'requests') return 'requests';
  if (value === 'providers' || value === 'stats' || value === 'reviews' || value === 'actions') return value;
  if (value === 'profile') return 'actions';
  return null;
}
