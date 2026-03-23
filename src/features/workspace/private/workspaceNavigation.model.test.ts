import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceCurrentHref,
  buildWorkspaceFavoritesViewHref,
  buildWorkspaceStatusFilterHref,
  buildWorkspaceTabHref,
} from './workspaceNavigation.model';

describe('workspaceNavigation.model', () => {
  it('builds current href from workspace path and search string', () => {
    expect(buildWorkspaceCurrentHref({ search: '', workspacePath: '/workspace' })).toBe('/workspace');
    expect(buildWorkspaceCurrentHref({ search: 'tab=my-offers&status=all', workspacePath: '/workspace' }))
      .toBe('/workspace?tab=my-offers&status=all');
  });

  it('builds workspace tab href and clears section/reviewRole with favorites-specific policy', () => {
    expect(
      buildWorkspaceTabHref({
        search: 'section=requests&tab=my-offers&status=accepted&fav=providers&reviewRole=client',
        workspacePath: '/workspace',
        tab: 'my-requests',
      }),
    ).toBe('/workspace?tab=my-requests&status=all');

    expect(
      buildWorkspaceTabHref({
        search: 'section=requests&tab=my-offers&status=accepted',
        workspacePath: '/workspace',
        tab: 'favorites',
      }),
    ).toBe('/workspace?tab=favorites&status=all');
  });

  it('builds status and favorites hrefs with correct workspace query policy', () => {
    expect(
      buildWorkspaceStatusFilterHref({
        search: 'section=requests&tab=my-offers&reviewRole=provider',
        workspacePath: '/workspace',
        activeWorkspaceTab: 'my-offers',
        status: 'in_progress',
      }),
    ).toBe('/workspace?tab=my-offers&status=in_progress');

    expect(
      buildWorkspaceFavoritesViewHref({
        search: 'section=providers&tab=favorites&status=all&reviewRole=client',
        workspacePath: '/workspace',
        view: 'providers',
      }),
    ).toBe('/workspace?tab=favorites&status=all&fav=providers');
  });
});
