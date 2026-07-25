import { describe, expect, it } from 'vitest';

import {
  CANONICAL_WORKSPACE_SECTIONS,
  isWorkspaceSection,
  resolveCanonicalWorkspaceSection,
  resolvePublicWorkspaceSection,
} from '@/features/workspace/navigation/resolveActiveWorkspaceSection';

describe('resolveActiveWorkspaceSection', () => {
  it('accepts every canonical workspace section', () => {
    expect(CANONICAL_WORKSPACE_SECTIONS).toEqual([
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
    ]);

    for (const section of CANONICAL_WORKSPACE_SECTIONS) {
      expect(isWorkspaceSection(section)).toBe(true);
      expect(resolveCanonicalWorkspaceSection(section)).toBe(section);
      expect(resolvePublicWorkspaceSection(section)).toBe(section);
    }
  });

  it('normalizes only the supported legacy aliases', () => {
    expect(resolveCanonicalWorkspaceSection('statistics')).toBe('stats');
    expect(resolveCanonicalWorkspaceSection('orders')).toBe('requests');
  });

  it('keeps actions and overview canonical instead of remapping them', () => {
    expect(resolveCanonicalWorkspaceSection('actions')).toBe('actions');
    expect(resolveCanonicalWorkspaceSection('overview')).toBe('overview');
  });

  it('rejects unknown section values', () => {
    expect(isWorkspaceSection('statistics')).toBe(false);
    expect(resolveCanonicalWorkspaceSection('unknown')).toBeNull();
    expect(resolveCanonicalWorkspaceSection('')).toBeNull();
    expect(resolveCanonicalWorkspaceSection(null)).toBeNull();
  });
});
