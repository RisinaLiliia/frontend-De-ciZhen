export type PublicWorkspaceSection = 'requests' | 'providers' | 'stats' | 'reviews';
export type PublicWorkspaceSectionParam = PublicWorkspaceSection | 'orders';

export function resolvePublicWorkspaceSection(value: string | null): PublicWorkspaceSection | null {
  if (value === 'orders' || value === 'requests') return 'requests';
  if (value === 'providers' || value === 'stats' || value === 'reviews') return value;
  return null;
}
