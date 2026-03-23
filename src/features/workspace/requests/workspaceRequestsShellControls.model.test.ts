import { describe, expect, it } from 'vitest';

import { buildWorkspaceRequestsShellControlsProps } from './workspaceRequestsShellControls.model';

describe('workspaceRequestsShellControls.model', () => {
  it('builds shell controls props and removes sort chip in providers mode', () => {
    const props = buildWorkspaceRequestsShellControlsProps({
      t: (key) => key,
      locale: 'de',
      contentType: 'providers',
      filters: {
        categoryOptions: [{ value: 'all', label: 'All' }],
        serviceOptions: [{ value: 'design', label: 'Design' }],
        cityOptions: [{ value: 'berlin', label: 'Berlin' }],
        sortOptions: [{ value: 'date_desc', label: 'Newest' }],
        categoryKey: 'all',
        subcategoryKey: 'design',
        cityId: 'berlin',
        sortBy: 'date_desc',
        isCategoriesLoading: false,
        isServicesLoading: false,
        isPending: true,
        appliedFilterChips: [
          { key: 'city', label: 'Berlin', onRemove: () => {} },
          { key: 'sort', label: 'Newest', onRemove: () => {} },
        ],
        onCategoryChange: () => {},
        onSubcategoryChange: () => {},
        onCityChange: () => {},
        onSortChange: () => {},
        onReset: () => {},
      },
    });

    expect(props.variant).toBe('shell');
    expect(props.surface).toBe('embedded');
    expect(props.showMobileToolbar).toBe(false);
    expect(props.mobileMode).toBe('sheet');
    expect(props.appliedChips?.map((chip) => chip.key)).toEqual(['city']);
  });
});
