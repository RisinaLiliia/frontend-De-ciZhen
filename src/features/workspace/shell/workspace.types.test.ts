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
    expect(resolvePublicWorkspaceSection('reviews')).toBe('reviews');
    expect(resolvePublicWorkspaceSection('profile')).toBe('profile');
  });

  it('returns null for unknown values', () => {
    expect(resolvePublicWorkspaceSection('unknown')).toBeNull();
    expect(resolvePublicWorkspaceSection(null)).toBeNull();
  });
});
