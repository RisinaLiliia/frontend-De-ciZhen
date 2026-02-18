import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { PublicRequestsSort } from '@/lib/api/requests';

export const ALL_OPTION_KEY = 'all';

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

export const NEW_ORDERS_SEEN_TOTAL_KEY_PREFIX = 'dc_requests_new_seen_total_v1';

