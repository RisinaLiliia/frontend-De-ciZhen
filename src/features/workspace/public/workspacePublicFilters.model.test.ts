import { describe, expect, it } from 'vitest';

import {
  hasWorkspacePublicActiveFilters,
  resolveWorkspacePublicSearchEventPayload,
  resolveWorkspacePublicSearchSelection,
} from '@/features/workspace/public/workspacePublicFilters.model';

describe('workspacePublicFilters.model', () => {
  it('normalizes all-option values out of public search selection', () => {
    expect(
      resolveWorkspacePublicSearchSelection(
        { cityId: 'all', categoryKey: 'design', subcategoryKey: 'all' },
        { cityId: 'berlin', subcategoryKey: 'logo' },
      ),
    ).toEqual({
      cityId: 'berlin',
      categoryKey: 'design',
      subcategoryKey: 'logo',
    });
  });

  it('builds provider search analytics payload with localized city name', () => {
    expect(
      resolveWorkspacePublicSearchEventPayload({
        activePublicSection: 'providers',
        locale: 'de',
        cities: [{ id: 'berlin', i18n: { en: 'Berlin', de: 'Berlin' } }],
        current: {
          cityId: 'all',
          categoryKey: 'all',
          subcategoryKey: 'all',
        },
        next: {
          cityId: 'berlin',
          categoryKey: 'design',
        },
      }),
    ).toEqual({
      target: 'provider',
      source: 'workspace_providers',
      cityId: 'berlin',
      cityName: 'Berlin',
      categoryKey: 'design',
      subcategoryKey: undefined,
    });
  });

  it('returns null when no public search filter remains active', () => {
    expect(
      resolveWorkspacePublicSearchEventPayload({
        activePublicSection: 'requests',
        locale: 'en',
        cities: [],
        current: {
          cityId: 'all',
          categoryKey: 'all',
          subcategoryKey: 'all',
        },
      }),
    ).toBeNull();

    expect(hasWorkspacePublicActiveFilters([])).toBe(false);
    expect(hasWorkspacePublicActiveFilters([{ key: 'city' }])).toBe(true);
  });
});
