import { describe, expect, it } from 'vitest';

import { buildWorkspaceModeItems } from '@/features/workspace/navigation/workspaceSection.model';
import { getWorkspaceModeCopy } from '@/features/workspace/navigation/workspaceMode.copy';

describe('buildWorkspaceModeItems', () => {
  it('builds all workspace sections from a single shared model', () => {
    const items = buildWorkspaceModeItems({
      activeMode: 'providers',
      copy: getWorkspaceModeCopy('de'),
      currentSearch: 'city=karlsruhe&period=90d',
    });

    expect(items.map((item) => item.key)).toEqual([
      'overview',
      'requests',
      'providers',
      'analysis',
      'profile',
      'chat',
    ]);
    expect(items.find((item) => item.key === 'providers')?.isActive).toBe(true);
    expect(items.find((item) => item.key === 'analysis')?.href).toBe('/workspace?city=karlsruhe&period=90d&section=stats');
    expect(items.find((item) => item.key === 'chat')?.href).toBe('/workspace?city=karlsruhe&period=90d&section=chat');
  });
});
