import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { PublicRequestsSort } from '@/lib/api/requests';
import {
  ALL_OPTION_KEY,
  WORKSPACE_PUBLIC_ORDERS_SEEN_TOTAL_KEY_PREFIX,
  WORKSPACE_PUBLIC_REQUESTS_SEEN_TOTAL_KEY_PREFIX,
} from '@/features/workspace/shared';

export type SortKey = PublicRequestsSort;

export type SortOption = {
  value: SortKey;
  labelKey: I18nKey;
};

export const SORT_OPTIONS: SortOption[] = [
  { value: 'date_desc', labelKey: I18N_KEYS.requestsPage.sortNewest },
  { value: 'date_asc', labelKey: I18N_KEYS.requestsPage.sortOldest },
  { value: 'price_asc', labelKey: I18N_KEYS.requestsPage.sortPriceAsc },
  { value: 'price_desc', labelKey: I18N_KEYS.requestsPage.sortPriceDesc },
];

export {
  ALL_OPTION_KEY,
  WORKSPACE_PUBLIC_ORDERS_SEEN_TOTAL_KEY_PREFIX,
  WORKSPACE_PUBLIC_REQUESTS_SEEN_TOTAL_KEY_PREFIX,
};
