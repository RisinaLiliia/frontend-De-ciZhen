import { REQUESTS_PAGE_SIZE } from '@/lib/requests/pagination';

export const WORKSPACE_PATH = '/workspace';
export const PUBLIC_REQUESTS_SEED_LIMIT = REQUESTS_PAGE_SIZE;
export const EMPTY_PROVIDER_IDS = new Set<string>();
export const NOOP_PROVIDER_TOGGLE = () => {};

export const EMPTY_ASIDE_BASE_PROPS = {
  isLoading: false,
  isError: false,
  errorLabel: '',
  title: '',
  subtitle: '',
  ctaLabel: '',
  providers: [],
  favoriteProviderIds: EMPTY_PROVIDER_IDS,
};
