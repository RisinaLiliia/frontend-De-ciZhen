'use client';

import { IconBriefcase, IconCalendar, IconFilter } from '@/components/ui/icons/icons';
import { CitySearchSelect } from '@/components/ui/CitySearchSelect';
import { WorkspaceFilterBar, WorkspaceFilterSelect } from '@/features/workspace/shared';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceContextMobileSheet } from './contextMobileSheet';
import type {
  WorkspaceContextCityControl,
  WorkspaceContextRangeControl,
  WorkspaceContextSelectControl,
} from './context.types';
import { buildRangeSelectOptions, resolveRangeValue } from './range.model';

type Props = {
  locale: Locale;
  city: WorkspaceContextCityControl;
  category: WorkspaceContextSelectControl;
  service?: WorkspaceContextSelectControl;
  range: WorkspaceContextRangeControl;
  mobile: boolean;
  compact?: boolean;
  title?: string;
  applyLabel?: string;
  mobileTriggerLabel?: string;
};

export function WorkspaceContextFilters({
  locale,
  city,
  category,
  service,
  range,
  mobile,
  compact = false,
  title,
  applyLabel,
  mobileTriggerLabel,
}: Props) {
  const rangeSelectOptions = buildRangeSelectOptions(range);
  const baseFields = (
    <>
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
          triggerIcon={<IconFilter />}
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
            triggerIcon={<IconBriefcase />}
          />
        </div>
      ) : null}
    </>
  );

  if (mobile) {
    return (
      <div className="workspace-context-controls__mobile-toolbar">
        <WorkspaceContextMobileSheet
          title={title ?? mobileTriggerLabel ?? city.ariaLabel}
          triggerLabel={mobileTriggerLabel ?? title ?? city.ariaLabel}
          applyLabel={applyLabel}
          className="workspace-context-controls__mobile-sheet"
        >
          <WorkspaceFilterBar className="workspace-context-controls__filters-grid workspace-context-controls__filters-grid--sheet">
            {baseFields}
          </WorkspaceFilterBar>
        </WorkspaceContextMobileSheet>
      </div>
    );
  }

  if (compact) {
    return (
      <WorkspaceFilterBar className="workspace-context-controls__filters-grid">
        {baseFields}
      </WorkspaceFilterBar>
    );
  }

  return (
    <WorkspaceFilterBar className="workspace-context-controls__filters-grid">
      {baseFields}

      <div className="workspace-context-controls__filter workspace-context-controls__period-filter">
        <WorkspaceFilterSelect
          options={rangeSelectOptions}
          value={range.value}
          onChange={(next) => range.onChange(resolveRangeValue(next))}
          className="workspace-context-select workspace-context-controls__select"
          ariaLabel={range.groupLabel}
          triggerIcon={<IconCalendar />}
        />
      </div>
    </WorkspaceFilterBar>
  );
}
