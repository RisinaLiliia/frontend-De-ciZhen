'use client';

import type { Option } from '@/components/ui/Select';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { RequestsListDensity } from '@/lib/requests/pagination';

export type WorkspaceFilterOption = Option;

export type WorkspaceFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

export type WorkspaceFiltersProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  categoryOptions: WorkspaceFilterOption[];
  serviceOptions: WorkspaceFilterOption[];
  cityOptions: WorkspaceFilterOption[];
  sortOptions: WorkspaceFilterOption[];
  categoryKey: string;
  subcategoryKey: string;
  cityId: string;
  sortBy: string;
  totalResults: string;
  resultsLabel?: string;
  page?: number;
  totalPages?: number;
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  isPending?: boolean;
  listDensity?: RequestsListDensity;
  appliedChips?: WorkspaceFilterChip[];
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onListDensityChange?: (value: RequestsListDensity) => void;
};

export type WorkspaceFilterControlsProps = Pick<
  WorkspaceFiltersProps,
  | 't'
  | 'locale'
  | 'categoryOptions'
  | 'serviceOptions'
  | 'cityOptions'
  | 'sortOptions'
  | 'categoryKey'
  | 'subcategoryKey'
  | 'cityId'
  | 'sortBy'
  | 'page'
  | 'totalPages'
  | 'isCategoriesLoading'
  | 'isServicesLoading'
  | 'isPending'
  | 'appliedChips'
  | 'onCategoryChange'
  | 'onSubcategoryChange'
  | 'onCityChange'
  | 'onSortChange'
  | 'onReset'
  | 'onPrevPage'
  | 'onNextPage'
> & {
  variant?: 'panel' | 'shell';
  surface?: 'card' | 'embedded';
  showMobileToolbar?: boolean;
  mobileMode?: 'inline' | 'sheet';
};

export type WorkspaceResultsSummaryProps = Pick<
  WorkspaceFiltersProps,
  | 't'
  | 'totalResults'
  | 'resultsLabel'
  | 'page'
  | 'totalPages'
  | 'isPending'
  | 'listDensity'
  | 'onPrevPage'
  | 'onNextPage'
  | 'onListDensityChange'
> & {
  controls?: {
    resultsCount?: boolean;
    densityToggle?: boolean;
    pagination?: boolean;
  };
};

export type WorkspacePaginatedPanelProps = {
  t: (key: I18nKey) => string;
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  listAriaLabel: string;
  listId?: string;
  listDensity?: RequestsListDensity;
  topSlot?: React.ReactNode;
  secondarySlot?: React.ReactNode;
  surface?: 'panel' | 'bare';
  panelClassName?: string;
  listClassName?: string;
  isLoading: boolean;
  isError?: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyHint: string;
  errorTitle?: string;
  errorHint?: string;
  emptyCtaLabel?: string;
  emptyCtaHref?: string;
  children: React.ReactNode;
};
