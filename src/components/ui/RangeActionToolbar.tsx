'use client';

import { Button } from '@/components/ui/Button';

type RangeActionToolbarOption<T extends string> = {
  value: T;
  label: string;
};

type RangeActionToolbarProps<T extends string> = {
  options: ReadonlyArray<RangeActionToolbarOption<T>>;
  value: T;
  onChange: (next: T) => void;
  groupLabel: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function RangeActionToolbar<T extends string>({
  options,
  value,
  onChange,
  groupLabel,
  className,
  action,
}: RangeActionToolbarProps<T>) {
  return (
    <div className={`chip-row ${className ?? ''}`.trim()}>
      <div className="home-activity__ranges" role="group" aria-label={groupLabel}>
        {options.map((item) => {
          const isActive = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              className={`home-activity__range ${isActive ? 'is-active' : ''}`.trim()}
              onClick={() => onChange(item.value)}
              aria-pressed={isActive}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {action ? (
        <Button type="button" variant="secondary" fullWidth={false} onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
