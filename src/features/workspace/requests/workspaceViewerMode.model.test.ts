import { describe, expect, it } from 'vitest';

import { resolveWorkspaceViewerMode } from '@/features/workspace/requests/workspaceViewerMode.model';

describe('resolveWorkspaceViewerMode', () => {
  it('defaults to provider', () => {
    expect(resolveWorkspaceViewerMode(null)).toBe('provider');
    expect(resolveWorkspaceViewerMode(undefined)).toBe('provider');
    expect(resolveWorkspaceViewerMode('provider')).toBe('provider');
    expect(resolveWorkspaceViewerMode('unknown')).toBe('provider');
  });

  it('resolves customer explicitly', () => {
    expect(resolveWorkspaceViewerMode('customer')).toBe('customer');
  });
});
