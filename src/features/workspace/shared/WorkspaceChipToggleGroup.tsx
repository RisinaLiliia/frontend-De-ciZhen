'use client';

import * as React from 'react';

type WorkspaceChipToggleItem = {
  key: string;
  label: string;
};

type WorkspaceChipToggleGroupProps = {
  items: ReadonlyArray<WorkspaceChipToggleItem>;
  selectedKey: string;
  onSelect: (key: string) => void;
  ariaLabel: string;
  className?: string;
};

export function WorkspaceChipToggleGroup({
  items,
  selectedKey,
  onSelect,
  ariaLabel,
  className,
}: WorkspaceChipToggleGroupProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={`chip-row workspace-chip-toggle ${className ?? ''}`.trim()}
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const isActive = selectedKey === item.key;

        return (
          <button
            key={item.key}
            type="button"
            className={`chip workspace-chip-toggle__chip ${isActive ? 'is-active' : ''}`.trim()}
            onClick={() => onSelect(item.key)}
            aria-pressed={isActive}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
