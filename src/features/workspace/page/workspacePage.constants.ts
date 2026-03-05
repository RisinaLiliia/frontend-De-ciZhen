import type { ComponentProps } from 'react';

import { WorkspacePageLayout } from '@/features/workspace';

export const WORKSPACE_PATH = '/workspace';
export const PUBLIC_REQUESTS_SEED_LIMIT = 10;
export const PUBLIC_CITY_ACTIVITY_FETCH_LIMIT = 20;
export const EMPTY_PROVIDER_IDS = new Set<string>();
export const NOOP_PROVIDER_TOGGLE = () => {};

export const EMPTY_EXPLORE: ComponentProps<typeof WorkspacePageLayout>['explore'] = {
  setExploreListDensity: () => {},
  sidebarNearbyLimit: 0,
  sidebarTopProvidersLimit: 0,
  sidebarProofCases: [],
  proofIndex: 0,
};

export const EMPTY_ASIDE_BASE_PROPS: ComponentProps<typeof WorkspacePageLayout>['workspaceAsideBaseProps'] = {
  isLoading: false,
  isError: false,
  errorLabel: '',
  title: '',
  subtitle: '',
  ctaLabel: '',
  providers: [],
  favoriteProviderIds: EMPTY_PROVIDER_IDS,
};
