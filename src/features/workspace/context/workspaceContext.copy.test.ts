import { describe, expect, it } from 'vitest';

import {
  buildWorkspacePrivateSortOptions,
  getWorkspaceChipLabels,
  getWorkspaceRangeGroupLabel,
  getWorkspaceRequestsScopeAriaLabel,
  getWorkspaceScopeSwitchLabels,
  getWorkspaceStateAriaLabel,
  getWorkspaceStateToggleItems,
} from './workspaceContext.copy';

describe('workspaceContext.copy', () => {
  it('builds localized private sort options', () => {
    expect(buildWorkspacePrivateSortOptions('de')).toEqual([
      { value: 'activity', label: 'Neueste Aktivität' },
      { value: 'deadline', label: 'Bald fällig' },
      { value: 'newest', label: 'Neu erstellt' },
      { value: 'budget', label: 'Höchstes Budget' },
    ]);

    expect(buildWorkspacePrivateSortOptions('en')).toEqual([
      { value: 'activity', label: 'Latest activity' },
      { value: 'deadline', label: 'Due soon' },
      { value: 'newest', label: 'Newest' },
      { value: 'budget', label: 'Highest budget' },
    ]);
  });

  it('builds localized shared-context labels', () => {
    expect(getWorkspaceRequestsScopeAriaLabel('de')).toBe('Auftragsmodus');
    expect(getWorkspaceRequestsScopeAriaLabel('en')).toBe('Request scope');
    expect(getWorkspaceStateAriaLabel('de')).toBe('Status');
    expect(getWorkspaceRangeGroupLabel('en')).toBe('Range');
    expect(getWorkspaceScopeSwitchLabels('de')).toEqual({ market: 'Markt', my: 'Meine Arbeit' });
    expect(getWorkspaceChipLabels('en')).toEqual({
      city: 'Location',
      category: 'Category',
      range: 'Range',
      service: 'Service',
    });
  });

  it('builds localized state toggle items', () => {
    expect(getWorkspaceStateToggleItems('de')).toEqual([
      { key: 'all', label: 'Alle' },
      { key: 'attention', label: 'Aktiv' },
      { key: 'execution', label: 'In Ausführung' },
      { key: 'completed', label: 'Abgeschlossen' },
    ]);

    expect(getWorkspaceStateToggleItems('en')).toEqual([
      { key: 'all', label: 'All' },
      { key: 'attention', label: 'Active' },
      { key: 'execution', label: 'In execution' },
      { key: 'completed', label: 'Completed' },
    ]);
  });
});
