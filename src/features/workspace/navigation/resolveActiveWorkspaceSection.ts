export const CANONICAL_WORKSPACE_SECTIONS = [
  'overview',
  'requests',
  'providers',
  'reviews',
  'stats',
  'actions',
  'profile',
  'chat',
  'settings',
  'help',
  'privacy',
  'cookies',
] as const;

export type WorkspaceSection = (typeof CANONICAL_WORKSPACE_SECTIONS)[number];

// Compatibility alias kept for the current workspace surface until the broader type rename is worth the churn.
export type PublicWorkspaceSection = WorkspaceSection;

export const LEGACY_WORKSPACE_SECTION_ALIASES = {
  statistics: 'stats',
  orders: 'requests',
} as const satisfies Record<string, WorkspaceSection>;

const WORKSPACE_SECTION_SET = new Set<string>(CANONICAL_WORKSPACE_SECTIONS);

export function isWorkspaceSection(value: string | null | undefined): value is WorkspaceSection {
  return Boolean(value && WORKSPACE_SECTION_SET.has(value));
}

export function resolveCanonicalWorkspaceSection(value: string | null): WorkspaceSection | null {
  if (!value) return null;

  if (value in LEGACY_WORKSPACE_SECTION_ALIASES) {
    return LEGACY_WORKSPACE_SECTION_ALIASES[value as keyof typeof LEGACY_WORKSPACE_SECTION_ALIASES];
  }

  return isWorkspaceSection(value) ? value : null;
}

export function resolvePublicWorkspaceSection(value: string | null): PublicWorkspaceSection | null {
  return resolveCanonicalWorkspaceSection(value);
}
