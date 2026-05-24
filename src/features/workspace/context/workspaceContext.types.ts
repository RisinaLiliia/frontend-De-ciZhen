'use client';

import type { ReactNode } from 'react';

import type { Option as FilterOption } from '@/components/ui/Select';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

export type WorkspaceContextCityControl = {
  value: string;
  allOption?: FilterOption;
  ariaLabel: string;
  onChange: (value: string) => void;
  summaryLabel: string;
  placeholder: string;
  searchPlaceholder: string;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
};

export type WorkspaceContextSelectControl = {
  value: string;
  options: FilterOption[];
  ariaLabel: string;
  onChange: (value: string) => void;
  summaryLabel: string;
  disabled?: boolean;
};

export type WorkspaceContextRangeControl = {
  value: WorkspaceStatisticsRange;
  options: ReadonlyArray<{ value: WorkspaceStatisticsRange; label: string }>;
  mobileOptions?: ReadonlyArray<{ value: WorkspaceStatisticsRange; label: string }>;
  groupLabel: string;
  onChange: (next: WorkspaceStatisticsRange) => void;
  summaryLabel: string;
};

export type WorkspaceContextExtraFilter = {
  key: string;
  value: string;
  options: FilterOption[];
  ariaLabel: string;
  onChange: (value: string) => void;
  summaryLabel: string;
  disabled?: boolean;
  display?: 'select' | 'chips';
};

export type WorkspaceContextAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  tooltip?: string;
};

export type WorkspaceContextPanelProps = {
  title: string;
  locale: Locale;
  resetLabel: string;
  applyLabel?: string;
  city: WorkspaceContextCityControl;
  category: WorkspaceContextSelectControl;
  service?: WorkspaceContextSelectControl;
  range: WorkspaceContextRangeControl;
  sort?: WorkspaceContextSelectControl;
  actionRowControl?: ReactNode;
  extraFilters?: WorkspaceContextExtraFilter[];
  inlineControl?: ReactNode;
  onReset: () => void;
  action?: WorkspaceContextAction;
  className?: string;
  surface?: 'shell' | 'embedded';
  mobileTriggerLabel?: string;
  mobileBehavior?: 'sheet-trigger' | 'inline';
};
