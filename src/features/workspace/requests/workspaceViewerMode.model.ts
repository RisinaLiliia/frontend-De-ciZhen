export type WorkspaceViewerMode = 'provider' | 'customer';

export function resolveWorkspaceViewerMode(value: string | null | undefined): WorkspaceViewerMode {
  return value === 'customer' ? 'customer' : 'provider';
}
