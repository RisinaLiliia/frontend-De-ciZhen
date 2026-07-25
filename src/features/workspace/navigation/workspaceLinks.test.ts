import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceHref,
  buildWorkspaceSectionHref,
} from '@/features/workspace/navigation/workspaceLinks';

describe('workspaceLinks', () => {
  it('builds canonical section hrefs for overview and actions', () => {
    expect(buildWorkspaceSectionHref('overview')).toBe('/workspace?section=overview');
    expect(buildWorkspaceSectionHref('actions')).toBe('/workspace?section=actions');
  });

  it('writes canonical section urls and clears legacy tab state', () => {
    expect(
      buildWorkspaceHref({
        currentSearch: 'tab=reviews&status=all',
        section: 'stats',
      }),
    ).toBe('/workspace?status=all&section=stats');
  });

  it('keeps canonical query patches while removing explicit keys', () => {
    expect(
      buildWorkspaceHref({
        currentSearch: 'section=requests&page=3&legacy=yes',
        section: 'actions',
        patch: { viewerMode: 'provider' },
        removeKeys: ['legacy'],
      }),
    ).toBe('/workspace?section=actions&page=3&viewerMode=provider');
  });
});
