import { describe, expect, it } from 'vitest';

import {
  resolveWorkspaceViewerModeToggleItems,
  shouldShowWorkspaceProfileViewerModeControl,
} from './workspaceSharedContext.model';

describe('workspaceSharedContext.model', () => {
  it('keeps canonical viewer-mode mapping for the regular toggle', () => {
    expect(
      resolveWorkspaceViewerModeToggleItems({
        viewerMode: 'provider',
        providerLabel: 'Für Anbieter',
        customerLabel: 'Für Auftraggeber',
      }),
    ).toEqual([
      { value: 'provider', label: 'Für Anbieter', isActive: true },
      { value: 'customer', label: 'Für Auftraggeber', isActive: false },
    ]);
  });

  it('inverts labels for profile/actions without changing canonical mode values', () => {
    expect(
      resolveWorkspaceViewerModeToggleItems({
        viewerMode: 'provider',
        providerLabel: 'Für Anbieter',
        customerLabel: 'Für Auftraggeber',
        invertLabels: true,
      }),
    ).toEqual([
      { value: 'customer', label: 'Für Anbieter', isActive: false },
      { value: 'provider', label: 'Für Auftraggeber', isActive: true },
    ]);
  });

  it('shows the profile viewer mode control only for profile/actions surfaces', () => {
    expect(
      shouldShowWorkspaceProfileViewerModeControl({
        activeWorkspaceTab: 'profile',
        activePublicSection: null,
      }),
    ).toBe(true);

    expect(
      shouldShowWorkspaceProfileViewerModeControl({
        activeWorkspaceTab: 'my-requests',
        activePublicSection: 'profile',
      }),
    ).toBe(true);

    expect(
      shouldShowWorkspaceProfileViewerModeControl({
        activeWorkspaceTab: 'my-requests',
        activePublicSection: 'requests',
      }),
    ).toBe(false);
  });
});
