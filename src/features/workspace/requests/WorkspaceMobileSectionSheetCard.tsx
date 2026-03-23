'use client';

import Link from 'next/link';

import { CountBadge } from '@/components/ui/CountBadge';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import {
  formatWorkspaceMobileSheetBadgeValue,
  resolveWorkspaceMobileSheetBadgeValue,
} from '@/features/workspace/requests/workspaceMobileSectionSheet.model';

type WorkspaceMobileSectionSheetCardProps = {
  item: PersonalNavItem;
  active: boolean;
  onSelect: (item: PersonalNavItem) => void;
};

export function WorkspaceMobileSectionSheetCard({
  item,
  active,
  onSelect,
}: WorkspaceMobileSectionSheetCardProps) {
  const badgeValue = resolveWorkspaceMobileSheetBadgeValue(item);
  const content = (
    <>
      <span className="workspace-mobile-nav-sheet__card-head">
        <span className="workspace-mobile-nav-sheet__card-icon" aria-hidden="true">
          {item.icon}
        </span>
        {badgeValue !== null ? (
          <CountBadge
            as="strong"
            size="sm"
            className="workspace-mobile-nav-sheet__card-badge"
            value={formatWorkspaceMobileSheetBadgeValue(badgeValue)}
          />
        ) : null}
      </span>
      <span className="workspace-mobile-nav-sheet__card-label">{item.label}</span>
    </>
  );

  const className = [
    'workspace-mobile-nav-sheet__card',
    item.tier === 'secondary' ? 'workspace-mobile-nav-sheet__card--secondary' : null,
    active ? 'is-active' : null,
    item.disabled ? 'is-disabled' : null,
  ]
    .filter(Boolean)
    .join(' ');

  if (item.disabled && !item.lockedHref) {
    return (
      <span className={className} aria-disabled="true">
        {content}
      </span>
    );
  }

  const href = item.disabled && item.lockedHref ? item.lockedHref : item.href;

  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(item)}
    >
      {content}
    </Link>
  );
}
