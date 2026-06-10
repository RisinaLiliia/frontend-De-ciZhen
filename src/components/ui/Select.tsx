// src/components/ui/Select.tsx
'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { IconChevronDown } from '@/components/ui/icons/icons';
import { cn } from '@/lib/utils/cn';

export type Option = { value: string; label: string; key?: string };

type Props = {
  options: Option[];
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  triggerIcon?: React.ReactNode;
  iconOnly?: boolean;
  'aria-label'?: string;
};

export function Select({
  options,
  id,
  value,
  defaultValue,
  onChange,
  placeholder = 'Auswählen…',
  disabled,
  className,
  contentClassName,
  triggerIcon,
  iconOnly = false,
  ...a11y
}: Props) {
  const items = React.useMemo(() => options.filter((o) => o.value !== ''), [options]);

  return (
    <SelectPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn('field dc-select-trigger', className)}
        data-icon-only={iconOnly ? 'true' : undefined}
        {...a11y}
      >
        {triggerIcon ? (
          <span className="dc-select-trigger__icon" aria-hidden="true">
            {triggerIcon}
          </span>
        ) : null}
        {iconOnly ? null : (
          <>
            <SelectPrimitive.Value placeholder={placeholder} className="dc-select-trigger__label" />
            <IconChevronDown />
          </>
        )}
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn('dc-select-content', contentClassName)}
          position="popper"
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
        >
          <SelectPrimitive.Viewport className="dc-select-viewport">
            {items.map((o, index) => (
              <SelectPrimitive.Item
                key={o.key ?? o.value ?? String(index)}
                value={o.value}
                className="dc-select-item"
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
