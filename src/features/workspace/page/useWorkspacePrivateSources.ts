'use client';

import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useWorkspaceData } from '@/features/workspace/requests';
import {
  useWorkspaceCollections,
  useWorkspacePublicFilters,
  useWorkspacePublicRequestsState,
} from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import {
  buildWorkspacePrivateSourcesCollectionsArgs,
  buildWorkspacePrivateSourcesDataArgs,
  buildWorkspacePrivateSourcesRequestsStateArgs,
  resolveWorkspacePrivateSourcesResult,
} from '@/features/workspace/page/workspacePrivateSources.model';

type SourcesParams = Pick<WorkspaceBranchProps, 't' | 'locale' | 'isAuthed' | 'isWorkspaceAuthed'> & {
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  requestsScope?: WorkspaceBranchProps['routeState']['requestsScope'];
  activeRequestsRole?: WorkspaceBranchProps['routeState']['activeRequestsRole'];
  activeRequestsState?: WorkspaceBranchProps['routeState']['activeRequestsState'];
  activeRequestsPeriod?: WorkspaceBranchProps['routeState']['activeRequestsPeriod'];
  activeRequestsSort?: WorkspaceBranchProps['routeState']['activeRequestsSort'];
};

export function useWorkspacePrivateSources({
  t,
  locale,
  isAuthed,
  isWorkspaceAuthed,
  activePublicSection,
  activeWorkspaceTab,
  requestsScope = 'market',
  activeRequestsRole = 'all',
  activeRequestsState = 'all',
  activeRequestsPeriod = '30d',
  activeRequestsSort = null,
}: SourcesParams) {
  const {
    cities,
    categories,
    services,
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    setPage,
    hasActivePublicFilter,
  } = useWorkspacePublicFilters({
    t,
    locale,
    shouldLoadCatalog: true,
    activePublicSection,
  });

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });

  const data = useWorkspaceData(
    buildWorkspacePrivateSourcesDataArgs({
      filter,
      locale,
      isAuthed,
      isWorkspaceAuthed,
      activeWorkspaceTab,
      activePublicSection,
      requestsScope,
      activeRequestsRole,
      activeRequestsState,
      activeRequestsPeriod,
      activeRequestsSort,
    }),
  );

  const publicRequestsState = useWorkspacePublicRequestsState(
    buildWorkspacePrivateSourcesRequestsStateArgs({
      filters: {
        limit,
        page,
        setPage,
        hasActivePublicFilter,
        cityId,
        categoryKey,
        subcategoryKey,
        sortBy,
      },
      data,
      activePublicSection,
    }),
  );

  const catalogIndex = { serviceByKey, categoryByKey, cityById };
  const collections = useWorkspaceCollections(
    buildWorkspacePrivateSourcesCollectionsArgs({
      requests: publicRequestsState.requests,
      data,
      catalogIndex,
      locale,
    }),
  );

  return resolveWorkspacePrivateSourcesResult({
    data,
    catalogIndex,
    collections,
    publicRequestsState,
  });
}
