'use client';

import * as React from 'react';

import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import { IconRotateCcw } from '@/components/ui/icons/icons';
import { WorkspaceButton, WorkspaceFilterSelect } from '@/features/workspace/shared';
import type {
  WorkspaceContextAction,
  WorkspaceContextRangeControl,
  WorkspaceContextSelectControl,
} from '@/features/workspace/context/workspaceContext.types';

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
  if (mobile) {
    return (
      <div className="workspace-context-controls__range-row">
        <RangeActionToolbar
          className="workspace-context-controls__range-toolbar"
          groupLabel={range.groupLabel}
          options={range.mobileOptions ?? range.options}
          value={range.value}
          onChange={range.onChange}
        />
        {sort ? (
          <div className="workspace-context-controls__filter workspace-context-controls__sort-filter">
            <WorkspaceFilterSelect
              options={sort.options}
              value={sort.value}
              onChange={sort.onChange}
              className="workspace-context-select workspace-context-controls__select"
              ariaLabel={sort.ariaLabel}
            />
          </div>
        ) : null}
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
    );
  }

  return (
    <div className="workspace-context-controls__footer-row">
      <div className="workspace-context-controls__footer-meta">
        {sort ? (
          <div className="workspace-context-controls__sort-group">
            <span className="workspace-context-controls__footer-label">
              {sort.ariaLabel}
            </span>
            <div className="workspace-context-controls__filter workspace-context-controls__sort-filter">
              <WorkspaceFilterSelect
                options={sort.options}
                value={sort.value}
                onChange={sort.onChange}
                className="workspace-context-select workspace-context-controls__select workspace-context-select--sort-inline"
                contentClassName="workspace-context-select-content workspace-context-select-content--sort"
                ariaLabel={sort.ariaLabel}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="workspace-context-controls__footer-actions">
        {actionRowControl ? (
          <div className="workspace-context-controls__action-row-control">
            {actionRowControl}
          </div>
        ) : null}

        <WorkspaceButton
          type="button"
          variant="ghost"
          className="workspace-context-controls__action workspace-context-controls__action--reset"
          onClick={onReset}
          aria-label={resetLabel}
          title={resetLabel}
        >
          <IconRotateCcw />
        </WorkspaceButton>
      </div>
    </div>
  );
}
