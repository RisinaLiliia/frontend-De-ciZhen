'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export type WorkspaceMobileDockItem = {
  key: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  variant?: 'default' | 'primary';
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  render?: ReactNode;
};

export function WorkspaceMobileDock({
  items,
  ariaLabel,
}: {
  items: WorkspaceMobileDockItem[];
  ariaLabel: string;
}) {
  return (
    <nav className="workspace-mobile-dock" aria-label={ariaLabel}>
      {items.map((item) => {
        if (item.render) {
          return (
            <div key={item.key} className="workspace-mobile-dock__custom">
              {item.render}
            </div>
          );
        }

        const classes = [
          'workspace-mobile-dock__item',
          item.active ? 'is-active' : '',
          item.variant === 'primary' ? 'workspace-mobile-dock__item--primary' : '',
        ]
          .filter(Boolean)
          .join(' ');

        const content = (
          <>
            <span className="workspace-mobile-dock__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="workspace-mobile-dock__label">{item.label}</span>
          </>
        );

        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              prefetch={false}
              aria-current={item.active ? 'page' : undefined}
              aria-label={item.ariaLabel ?? item.label}
              title={item.title}
              className={classes}
              onClick={item.onClick}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            className={classes}
            aria-label={item.ariaLabel ?? item.label}
            title={item.title}
            onClick={item.onClick}
            disabled={item.disabled}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
