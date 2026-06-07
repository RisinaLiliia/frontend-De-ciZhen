import { describe, expect, it } from 'vitest';

import { resolvePublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';

describe('resolvePublicWorkspaceSection', () => {
  it('maps legacy orders alias to requests', () => {
    expect(resolvePublicWorkspaceSection('orders')).toBe('requests');
  });

  it('resolves canonical values', () => {
    expect(resolvePublicWorkspaceSection('requests')).toBe('requests');
    expect(resolvePublicWorkspaceSection('providers')).toBe('providers');
    expect(resolvePublicWorkspaceSection('stats')).toBe('stats');
    expect(resolvePublicWorkspaceSection('actions')).toBe('actions');
  });

  it('maps legacy reviews alias to stats', () => {
    expect(resolvePublicWorkspaceSection('reviews')).toBe('stats');
  });

  it('maps legacy profile alias to actions', () => {
    expect(resolvePublicWorkspaceSection('profile')).toBe('actions');
  });

  it('returns null for unknown values', () => {
    expect(resolvePublicWorkspaceSection('unknown')).toBeNull();
    expect(resolvePublicWorkspaceSection(null)).toBeNull();
  });
});
