'use client';

import * as React from 'react';

import { Select, type Option } from '@/components/ui/Select';

type WorkspaceFilterSelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  triggerIcon?: React.ReactNode;
  iconOnly?: boolean;
};

export function WorkspaceFilterSelect({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  className,
  contentClassName,
  triggerIcon,
  iconOnly = false,
}: WorkspaceFilterSelectProps) {
  const resolvedValue = React.useMemo(
    () => (options.some((option) => option.value === value) ? value : undefined),
    [options, value],
  );

  return (
    <div className="workspace-context-select-wrap">
      <Select
        options={options}
        value={resolvedValue}
        onChange={onChange}
        className={className}
        contentClassName={contentClassName}
        triggerIcon={triggerIcon}
        iconOnly={iconOnly}
        aria-label={ariaLabel}
        disabled={disabled}
      />
    </div>
  );
}
