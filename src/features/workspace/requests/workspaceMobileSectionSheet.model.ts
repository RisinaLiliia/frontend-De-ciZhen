'use client';

import type { WorkspaceNavItem } from '@/features/workspace/navigation/workspaceNavItem.types';

type SearchParamsLike = Pick<URLSearchParams, 'get'>;

export function parseWorkspaceMobileSheetNumericValue(value: WorkspaceNavItem['value']) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value !== 'string') return null;
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
}

export function resolveWorkspaceMobileSheetBadgeValue(item: WorkspaceNavItem) {
  const count =
    typeof item.badgeValue === 'number'
      ? Math.max(0, Math.round(item.badgeValue))
      : parseWorkspaceMobileSheetNumericValue(item.value);
  if (count === null) return null;

  const showAlways =
    item.key === 'public-requests' ||
    item.key === 'public-providers' ||
    item.key === 'public-stats' ||
    item.key === 'my-requests';
  const showWhenPositive = item.key === 'my-offers' || item.key === 'my-favorites';

  if (showAlways) return count;
  if (showWhenPositive) return count > 0 ? count : null;
  return null;
}

export function formatWorkspaceMobileSheetBadgeValue(value: number) {
  return value > 99 ? '99+' : String(value);
}

export function splitWorkspaceMobileSheetItems(items: WorkspaceNavItem[]) {
  return {
    primaryItems: items.filter((item) => item.tier !== 'secondary'),
    secondaryItems: items.filter((item) => item.tier === 'secondary'),
  };
}

export function hasWorkspaceMobileSheetHrefMatch(
  item: WorkspaceNavItem,
  pathname: string,
  searchParams: SearchParamsLike,
) {
  const href = String(item.href ?? '').trim();
  if (!href) return false;

  const [hrefPath, hrefQuery = ''] = href.split('?');
  const normalizedHrefPath = hrefPath || '';
  if (normalizedHrefPath && normalizedHrefPath !== pathname) {
    if (item.match === 'prefix') {
      if (!(pathname === normalizedHrefPath || pathname.startsWith(`${normalizedHrefPath}/`)))
        return false;
    } else {
      return false;
    }
  }

  if (!hrefQuery) return normalizedHrefPath ? normalizedHrefPath === pathname : false;

  const hrefParams = new URLSearchParams(hrefQuery);
  for (const [key, value] of hrefParams.entries()) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

export function isWorkspaceMobileSheetItemActive(
  item: WorkspaceNavItem,
  pathname: string,
  searchParams: SearchParamsLike,
) {
  if (item.disabled) return false;
  if (item.forceActive === true) return true;
  if (hasWorkspaceMobileSheetHrefMatch(item, pathname, searchParams)) return true;
  if (item.forceActive === false) return false;
  if (item.match === 'prefix')
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  return pathname === item.href;
}
