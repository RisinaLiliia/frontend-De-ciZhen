'use client';

import * as React from 'react';
import { FilterX } from 'lucide-react';

import { IconCalendar, IconSort } from '@/components/ui/icons/icons';
import { WorkspaceButton, WorkspaceFilterSelect, useMediaMatch } from '@/features/workspace/shared';
import type {
  WorkspaceContextAction,
  WorkspaceContextRangeControl,
  WorkspaceContextSelectControl,
} from './context.types';
import { resolveRangeValue } from './range.model';

type Props = {
  mobile: boolean;
  range: WorkspaceContextRangeControl;
  sort?: WorkspaceContextSelectControl;
  actionRowControl?: React.ReactNode;
  resetLabel: string;
  onReset: () => void;
  action?: WorkspaceContextAction;
};

export function WorkspaceContextResultControls({
  mobile,
  range,
  sort,
  actionRowControl,
  resetLabel,
  onReset,
  action,
}: Props) {
  const shouldShowCompactSortText = useMediaMatch('(max-width: 1179px)');

  if (mobile) {
    const compactRangeOptions = (range.mobileOptions ?? range.options).map((option) => ({
      value: option.value,
      label: option.label,
    }));
    const hasToolbarRow = Boolean(sort || actionRowControl || action);

    return (
      <div className="workspace-context-controls__mobile-footer">
        {hasToolbarRow ? (
          <div className="workspace-context-controls__footer-row workspace-context-controls__footer-row--compact">
            <div className="workspace-context-controls__filter workspace-context-controls__period-filter workspace-context-controls__period-filter--compact">
              <WorkspaceFilterSelect
                options={compactRangeOptions}
                value={range.value}
                onChange={(next) => range.onChange(resolveRangeValue(next))}
                className="workspace-context-select workspace-context-controls__select"
                ariaLabel={range.groupLabel}
                triggerIcon={<IconCalendar />}
              />
            </div>

            {sort ? (
              <div className="workspace-context-controls__filter workspace-context-controls__sort-filter workspace-context-controls__sort-filter--compact">
                <WorkspaceFilterSelect
                  options={sort.options}
                  value={sort.value}
                  onChange={sort.onChange}
                  className={`workspace-context-select workspace-context-controls__select workspace-context-select--sort-inline${
                    shouldShowCompactSortText ? '' : ' workspace-context-select--sort-icon'
                  }`}
                  contentClassName="workspace-context-select-content workspace-context-select-content--sort"
                  ariaLabel={sort.ariaLabel}
                  triggerIcon={<IconSort />}
                  iconOnly={!shouldShowCompactSortText}
                />
              </div>
            ) : null}

            <div className="workspace-context-controls__footer-actions workspace-context-controls__footer-actions--compact">
              {actionRowControl ? (
                <div className="workspace-context-controls__action-row-control">{actionRowControl}</div>
              ) : null}

              <WorkspaceButton
                type="button"
                variant="ghost"
                className="workspace-context-controls__action workspace-context-controls__action--reset"
                onClick={onReset}
                aria-label={resetLabel}
                title={resetLabel}
              >
                <span className="workspace-context-controls__action-icon" aria-hidden="true">
                  <FilterX size={16} strokeWidth={2.1} />
                </span>
              </WorkspaceButton>

              {action ? (
                <WorkspaceButton
                  type="button"
                  variant="secondary"
                  className="workspace-context-controls__secondary-button"
                  aria-label={action.label}
                  title={action.tooltip ?? action.label}
                  onClick={action.onClick}
                >
                  {action.icon ?? action.label}
                </WorkspaceButton>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="workspace-context-controls__footer-row">
      <div className="workspace-context-controls__footer-meta">
        {sort ? (
          <div className="workspace-context-controls__sort-group">
            <div className="workspace-context-controls__filter workspace-context-controls__sort-filter">
              <WorkspaceFilterSelect
                options={sort.options}
                value={sort.value}
                onChange={sort.onChange}
                className="workspace-context-select workspace-context-controls__select workspace-context-select--sort-inline workspace-context-select--sort-icon"
                contentClassName="workspace-context-select-content workspace-context-select-content--sort"
                ariaLabel={sort.ariaLabel}
                triggerIcon={<IconSort />}
                iconOnly
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="workspace-context-controls__footer-actions">
        {actionRowControl ? (
          <div className="workspace-context-controls__action-row-control">{actionRowControl}</div>
        ) : null}

        <WorkspaceButton
          type="button"
          variant="ghost"
          className="workspace-context-controls__action workspace-context-controls__action--reset"
          onClick={onReset}
          aria-label={resetLabel}
          title={resetLabel}
        >
          <span className="workspace-context-controls__action-icon" aria-hidden="true">
            <FilterX size={16} strokeWidth={2.1} />
          </span>
        </WorkspaceButton>
      </div>
    </div>
  );
}
