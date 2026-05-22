'use client';

import * as React from 'react';

import { CitySearchSelect } from '@/components/ui/CitySearchSelect';
import { WorkspaceFilterBar, WorkspaceFilterSelect } from '@/features/workspace/shared';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import type {
  WorkspaceContextCityControl,
  WorkspaceContextRangeControl,
  WorkspaceContextSelectControl,
} from '@/features/workspace/context/workspaceContext.types';

type Props = {
  locale: Locale;
  city: WorkspaceContextCityControl;
  category: WorkspaceContextSelectControl;
  service?: WorkspaceContextSelectControl;
  range: WorkspaceContextRangeControl;
  mobile: boolean;
};

export function WorkspaceContextFilters({
  locale,
  city,
  category,
  service,
  range,
  mobile,
}: Props) {
  const rangeSelectOptions = range.options.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  return (
    <WorkspaceFilterBar className="workspace-context-controls__filters-grid">
      <div className="workspace-context-controls__filter">
        <div className="workspace-context-select-wrap">
          <CitySearchSelect
            mode="inline"
            inlineBehavior="auto"
            locale={locale}
            value={city.value}
            onChange={city.onChange}
            className="workspace-context-select workspace-context-select--city workspace-context-controls__select"
            ariaLabel={city.ariaLabel}
            placeholder={city.placeholder}
            allOption={city.allOption}
            searchPlaceholder={city.searchPlaceholder}
            loadingLabel={city.loadingLabel}
            emptyLabel={city.emptyLabel}
            errorLabel={city.errorLabel}
          />
        </div>
      </div>

      <div className="workspace-context-controls__filter">
        <WorkspaceFilterSelect
          options={category.options}
          value={category.value}
          onChange={category.onChange}
          className="workspace-context-select workspace-context-controls__select"
          ariaLabel={category.ariaLabel}
        />
      </div>

      {service ? (
        <div className="workspace-context-controls__filter">
          <WorkspaceFilterSelect
            options={service.options}
            value={service.value}
            onChange={service.onChange}
            className="workspace-context-select workspace-context-controls__select"
            ariaLabel={service.ariaLabel}
            disabled={service.disabled}
          />
        </div>
      ) : null}

      {!mobile ? (
        <div className="workspace-context-controls__filter workspace-context-controls__period-filter">
          <WorkspaceFilterSelect
            options={rangeSelectOptions}
            value={range.value}
            onChange={(next) => range.onChange(next as WorkspaceStatisticsRange)}
            className="workspace-context-select workspace-context-controls__select"
            ariaLabel={range.groupLabel}
          />
        </div>
      ) : null}
    </WorkspaceFilterBar>
  );
}
