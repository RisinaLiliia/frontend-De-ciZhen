'use client';

import Link from 'next/link';

import type { WorkspaceModeItem } from '@/features/workspace/navigation/workspaceSection.model';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type Translator = (key: I18nKey) => string;

type WorkspaceModeNavProps = {
  items: WorkspaceModeItem[];
  t: Translator;
  variant?: 'cards' | 'sidebar';
  className?: string;
  onItemClick?: (item: WorkspaceModeItem) => void;
};

export function WorkspaceModeNav({
  items,
  t,
  variant = 'cards',
  className,
  onItemClick,
}: WorkspaceModeNavProps) {
  const rootClassName = variant === 'sidebar' ? 'workspace-sidebar-nav' : 'workspace-mode-nav';

  const itemClassName =
    variant === 'sidebar' ? 'workspace-sidebar-nav__item' : 'workspace-mode-nav__item';

  const iconClassName =
    variant === 'sidebar' ? 'workspace-sidebar-nav__icon' : 'workspace-mode-nav__icon';

  const copyClassName =
    variant === 'sidebar' ? 'workspace-sidebar-nav__copy' : 'workspace-mode-nav__copy';

  const labelClassName =
    variant === 'sidebar' ? 'workspace-sidebar-nav__label' : 'workspace-mode-nav__label';

  const descriptionClassName =
    variant === 'sidebar'
      ? 'workspace-sidebar-nav__description'
      : 'workspace-mode-nav__description';

  return (
    <nav
      className={[rootClassName, className ?? ''].filter(Boolean).join(' ')}
      aria-label={t(I18N_KEYS.workspace.modeNavAriaLabel)}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          prefetch={false}
          className={`${itemClassName}${item.isActive ? ' is-active' : ''}`.trim()}
          data-mode-key={item.key}
          aria-current={item.isActive ? 'page' : undefined}
          onClick={() => onItemClick?.(item)}
        >
          <span className={iconClassName} aria-hidden="true">
            {item.icon}
          </span>
          <span className={copyClassName}>
            <strong className={labelClassName}>{item.label}</strong>
            <span className={descriptionClassName}>{item.description}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
