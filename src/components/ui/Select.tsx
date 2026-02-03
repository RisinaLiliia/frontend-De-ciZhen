// src/components/ui/Select.tsx
'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/lib/utils/cn';

export type Option = { value: string; label: string; key?: string };

type Props = {
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
};

export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Auswählen…',
  disabled,
  className,
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
      <SelectPrimitive.Trigger className={cn('field dc-select-trigger', className)} {...a11y}>
        <SelectPrimitive.Value placeholder={placeholder} />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="dc-select-content"
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
