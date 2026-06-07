import { describe, expect, it } from 'vitest';

import {
  buildRequestsExplorerCategoryOptions,
  buildRequestsExplorerCityOptions,
  buildRequestsExplorerFilterChips,
  buildRequestsExplorerServiceOptions,
  buildRequestsExplorerSortOptions,
} from '@/components/requests/requestsExplorerFilters.model';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';

const t = (key: string) => key;

describe('requestsExplorerFilters.model', () => {
  it('builds translated sort options', () => {
    expect(buildRequestsExplorerSortOptions(t)[0]).toEqual({
      value: 'date_desc',
      label: 'requestsPage.sortNewest',
    });
  });

  it('builds sorted category, service and city options with all placeholders', () => {
    expect(
      buildRequestsExplorerCategoryOptions({
        categories: [
          { key: 'photo', sortOrder: 2, i18n: { en: 'Photo', de: 'Foto' } },
          { key: 'design', sortOrder: 1, i18n: { en: 'Design', de: 'Design' } },
        ],
        locale: 'en',
        t,
      }).map((option) => option.value),
    ).toEqual([ALL_OPTION_KEY, 'design', 'photo']);

    expect(
      buildRequestsExplorerServiceOptions({
        services: [
          { key: 'landing', sortOrder: 2, i18n: { en: 'Landing', de: 'Landing' } },
          { key: 'logo', sortOrder: 1, i18n: { en: 'Logo', de: 'Logo' } },
        ],
        locale: 'en',
        t,
      }).map((option) => option.value),
    ).toEqual([ALL_OPTION_KEY, 'logo', 'landing']);

    expect(
      buildRequestsExplorerCityOptions({
        cities: [
          { id: 'munich', i18n: { en: 'Munich', de: 'Muenchen' } },
          { id: 'berlin', i18n: { en: 'Berlin', de: 'Berlin' } },
        ],
        locale: 'en',
        t,
      }).map((option) => option.value),
    ).toEqual([ALL_OPTION_KEY, 'berlin', 'munich']);
  });

  it('builds filter chips only for active filters and uses resolved labels', () => {
    const chips = buildRequestsExplorerFilterChips({
      cityId: 'berlin',
      cityOptions: [{ value: 'berlin', label: 'Berlin' }],
      onCityReset: () => {},
      categoryKey: 'design',
      categoryOptions: [{ value: 'design', label: 'Design' }],
      onCategoryReset: () => {},
      subcategoryKey: ALL_OPTION_KEY,
      serviceOptions: [{ value: 'logo', label: 'Logo' }],
      onSubcategoryReset: () => {},
      sortBy: 'price_desc',
      sortOptions: [{ value: 'price_desc', label: 'Price high to low' }],
      onSortReset: () => {},
    });

    expect(chips.map((chip) => `${chip.key}:${chip.label}`)).toEqual([
      'city:Berlin',
      'category:Design',
      'sort:Price high to low',
    ]);
  });
});
