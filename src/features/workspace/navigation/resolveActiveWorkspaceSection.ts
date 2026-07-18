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

const WORKSPACE_SECTION_ALIASES = {
  statistics: 'stats',
  orders: 'requests',
  actions: 'profile',
} as const satisfies Record<string, PublicWorkspaceSection>;

export function resolveCanonicalWorkspaceSection(value: string | null): PublicWorkspaceSection | null {
  if (!value) return null;

  if (value in WORKSPACE_SECTION_ALIASES) {
    return WORKSPACE_SECTION_ALIASES[value as keyof typeof WORKSPACE_SECTION_ALIASES];
  }

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

export function resolvePublicWorkspaceSection(value: string | null): PublicWorkspaceSection | null {
  return resolveCanonicalWorkspaceSection(value);
}
