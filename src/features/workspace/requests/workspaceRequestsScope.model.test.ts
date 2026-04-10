import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceRequestsScopeHref,
  resolveWorkspaceRequestsScope,
} from '@/features/workspace/requests/workspaceRequestsScope.model';

describe('workspaceRequestsScope.model', () => {
  it('defaults to market when no scope is provided', () => {
    expect(resolveWorkspaceRequestsScope(null, false)).toBe('market');
    expect(resolveWorkspaceRequestsScope(null, true)).toBe('market');
  });

  it('downgrades explicit my scope to market for guests', () => {
    expect(resolveWorkspaceRequestsScope('my', false)).toBe('market');
  });

  it('preserves explicit my scope for authenticated users', () => {
    expect(resolveWorkspaceRequestsScope('my', true)).toBe('my');
  });

  it('builds market href and clears my-only params', () => {
    expect(
      buildWorkspaceRequestsScopeHref({
        currentSearch: 'section=requests&scope=my&role=provider&state=active&city=berlin',
        scope: 'market',
      }),
    ).toBe('/workspace?section=requests&scope=market&city=berlin');
  });
});
