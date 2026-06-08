export type PublicWorkspaceSection = 'requests' | 'providers' | 'stats' | 'actions';
export type PublicWorkspaceSectionParam = PublicWorkspaceSection | 'orders' | 'profile';

export function resolvePublicWorkspaceSection(value: string | null): PublicWorkspaceSection | null {
  if (value === 'orders' || value === 'requests') return 'requests';
  if (value === 'providers' || value === 'stats' || value === 'actions') return value;
  if (value === 'reviews') return 'stats';
  if (value === 'profile') return 'actions';
  return null;
}
