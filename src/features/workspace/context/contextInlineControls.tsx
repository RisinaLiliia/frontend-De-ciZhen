'use client';

import * as React from 'react';

import { WorkspaceChipToggleGroup, WorkspaceFilterSelect } from '@/features/workspace/shared';
import type { WorkspaceContextExtraFilter } from './context.types';

type Props = {
  inlineControl?: React.ReactNode;
  extraFilters?: WorkspaceContextExtraFilter[];
};

export function WorkspaceContextInlineControls({ inlineControl, extraFilters }: Props) {
  const hasControlCluster = Boolean(inlineControl) || Boolean(extraFilters?.length);

  if (!hasControlCluster) return null;

  const controlClusterClassName =
    inlineControl && !extraFilters?.length
      ? 'workspace-context-controls__control-row'
      : 'workspace-context-controls__control-cluster';

  return (
    <div className={controlClusterClassName}>
      {inlineControl ? (
        <div className="workspace-context-controls__inline-control">{inlineControl}</div>
      ) : null}

      {extraFilters?.map((filter) => (
        <div
          key={filter.key}
          className={
            filter.display === 'chips' ? 'workspace-context-controls__chip-filter' : undefined
          }
        >
          {filter.display === 'chips' ? (
            <WorkspaceChipToggleGroup
              items={filter.options.map((option) => ({
                key: option.value,
                label: option.label,
              }))}
              selectedKey={filter.value}
              onSelect={filter.onChange}
              ariaLabel={filter.ariaLabel}
              className="workspace-context-controls__chip-group"
            />
          ) : (
            <WorkspaceFilterSelect
              options={filter.options}
              value={filter.value}
              onChange={filter.onChange}
              className="workspace-context-select workspace-context-controls__select"
              ariaLabel={filter.ariaLabel}
              disabled={filter.disabled}
            />
          )}
        </div>
      ))}
    </div>
  );
}
