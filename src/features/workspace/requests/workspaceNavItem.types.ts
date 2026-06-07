'use client';

import type { ReactNode } from 'react';

export type WorkspaceNavItem = {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  tier?: 'primary' | 'secondary';
  disabled?: boolean;
  lockedHref?: string;
  value?: string | number;
  badgeValue?: number;
  hint?: string;
  onClick?: () => void;
  rating?: {
    value: string | number;
    reviewsCount: string | number;
    reviewsLabel: string;
    href?: string;
  };
  forceActive?: boolean;
  match?: 'exact' | 'prefix';
};
