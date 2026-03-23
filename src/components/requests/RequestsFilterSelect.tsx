'use client';

import * as React from 'react';

import { Select, type Option } from '@/components/ui/Select';

type RequestsFilterSelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
};

export function RequestsFilterSelect({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  className,
  icon,
  iconClassName,
}: RequestsFilterSelectProps) {
  const resolvedValue = React.useMemo(
    () => (options.some((option) => option.value === value) ? value : undefined),
    [options, value],
  );

  return (
    <div className="requests-select-wrap">
      {icon ? (
        <span className={`requests-select-icon ${iconClassName ?? ''}`.trim()} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <Select
        options={options}
        value={resolvedValue}
        onChange={onChange}
        className={className}
        aria-label={ariaLabel}
        disabled={disabled}
      />
    </div>
  );
}
