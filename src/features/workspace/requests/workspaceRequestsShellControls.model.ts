import { selectRequestsAppliedChipsForContentType } from '@/components/requests/requestsFilters.model';
import type { RequestsFilterControlsProps } from '@/components/requests/requestsFilters.types';
import type { RequestsExplorerAppliedFilterChip } from '@/components/requests/requestsExplorer.types';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspaceRequestsShellContentType = 'requests' | 'providers';

type WorkspaceRequestsShellFilters = {
  categoryOptions: RequestsFilterControlsProps['categoryOptions'];
  serviceOptions: RequestsFilterControlsProps['serviceOptions'];
  cityOptions: RequestsFilterControlsProps['cityOptions'];
  sortOptions: RequestsFilterControlsProps['sortOptions'];
  categoryKey: string;
  subcategoryKey: string;
  cityId: string;
  sortBy: string;
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  isPending: boolean;
  appliedFilterChips: RequestsExplorerAppliedFilterChip[];
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
};

type BuildWorkspaceRequestsShellControlsPropsArgs = {
  t: (key: I18nKey) => string;
  locale: Locale;
  contentType: WorkspaceRequestsShellContentType;
  filters: WorkspaceRequestsShellFilters;
};

export function buildWorkspaceRequestsShellControlsProps({
  t,
  locale,
  contentType,
  filters,
}: BuildWorkspaceRequestsShellControlsPropsArgs): RequestsFilterControlsProps {
  return {
    t,
    locale,
    categoryOptions: filters.categoryOptions,
    serviceOptions: filters.serviceOptions,
    cityOptions: filters.cityOptions,
    sortOptions: filters.sortOptions,
    categoryKey: filters.categoryKey,
    subcategoryKey: filters.subcategoryKey,
    cityId: filters.cityId,
    sortBy: filters.sortBy,
    isCategoriesLoading: filters.isCategoriesLoading,
    isServicesLoading: filters.isServicesLoading,
    isPending: filters.isPending,
    appliedChips: selectRequestsAppliedChipsForContentType(filters.appliedFilterChips, contentType),
    onCategoryChange: filters.onCategoryChange,
    onSubcategoryChange: filters.onSubcategoryChange,
    onCityChange: filters.onCityChange,
    onSortChange: filters.onSortChange,
    onReset: filters.onReset,
    variant: 'shell',
    surface: 'embedded',
    showMobileToolbar: false,
    mobileMode: 'sheet',
  };
}
