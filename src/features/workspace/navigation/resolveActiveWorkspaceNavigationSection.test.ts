import { describe, expect, it } from 'vitest';

import { resolveActiveWorkspaceNavigationSection } from '@/features/workspace/navigation/resolveActiveWorkspaceNavigationSection';

describe('resolveActiveWorkspaceNavigationSection', () => {
  it('maps private provider requests routes to the offers sidebar item', () => {
    expect(
      resolveActiveWorkspaceNavigationSection({
        sectionParam: 'requests',
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
        requestsScope: 'my',
        requestsRole: 'provider',
        requestsState: null,
      }),
    ).toBe('offers');
  });

  it('maps private execution routes to the contracts sidebar item', () => {
    expect(
      resolveActiveWorkspaceNavigationSection({
        sectionParam: 'requests',
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
        requestsScope: 'my',
        requestsRole: null,
        requestsState: 'execution',
      }),
    ).toBe('contracts');
  });

  it('keeps canonical profile/settings/help sections aligned with the sidebar', () => {
    expect(
      resolveActiveWorkspaceNavigationSection({
        sectionParam: 'profile',
        activePublicSection: 'profile',
        activeWorkspaceTab: 'my-requests',
        requestsScope: null,
        requestsRole: null,
        requestsState: null,
      }),
    ).toBe('profile');
    expect(
      resolveActiveWorkspaceNavigationSection({
        sectionParam: 'settings',
        activePublicSection: 'settings',
        activeWorkspaceTab: 'my-requests',
        requestsScope: null,
        requestsRole: null,
        requestsState: null,
      }),
    ).toBe('settings');
    expect(
      resolveActiveWorkspaceNavigationSection({
        sectionParam: 'help',
        activePublicSection: 'help',
        activeWorkspaceTab: 'my-requests',
        requestsScope: null,
        requestsRole: null,
        requestsState: null,
      }),
    ).toBe('help');
  });

  it('maps workspace legal sections onto the support lane', () => {
    expect(
      resolveActiveWorkspaceNavigationSection({
        sectionParam: 'privacy',
        activePublicSection: 'privacy',
        activeWorkspaceTab: 'my-requests',
        requestsScope: null,
        requestsRole: null,
        requestsState: null,
      }),
    ).toBe('help');
    expect(
      resolveActiveWorkspaceNavigationSection({
        sectionParam: 'cookies',
        activePublicSection: 'cookies',
        activeWorkspaceTab: 'my-requests',
        requestsScope: null,
        requestsRole: null,
        requestsState: null,
      }),
    ).toBe('help');
  });
});
