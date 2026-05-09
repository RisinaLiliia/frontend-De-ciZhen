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
  buildWorkspacePrivateCatalogIndexArgs,
  buildWorkspacePrivateSourcesCollectionsArgs,
  buildWorkspacePrivateSourcesIdleRequestsStateArgs,
  shouldLoadWorkspacePrivateCatalog,
  shouldLoadWorkspacePrivatePublicRequestsState,
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
  const shouldLoadCatalog = shouldLoadWorkspacePrivateCatalog({
    activePublicSection,
    activeWorkspaceTab,
    requestsScope,
  });
  const shouldLoadPublicRequestsState = shouldLoadWorkspacePrivatePublicRequestsState({
    activePublicSection,
    activeWorkspaceTab,
  });
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
    shouldLoadCatalog,
    activePublicSection,
  });

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex(
    buildWorkspacePrivateCatalogIndexArgs({
      enabled: shouldLoadCatalog,
      services,
      categories,
      cities,
    }),
  );

  const data = useWorkspaceData(
    buildWorkspacePrivateSourcesDataArgs({
      filter,
      shouldLoadCatalog,
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
  const { contractData, legacyPublicOverviewData, requestUserStateData, legacyPrivateData } = data;

  const publicRequestsState = useWorkspacePublicRequestsState(
    shouldLoadPublicRequestsState
      ? buildWorkspacePrivateSourcesRequestsStateArgs({
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
        contractData,
        legacyPublicOverviewData,
        activePublicSection,
      })
      : buildWorkspacePrivateSourcesIdleRequestsStateArgs({
        allRequestsSummary: contractData.allRequestsSummary,
        limit,
        page,
        setPage,
        activePublicSection,
      }),
  );

  const catalogIndex = { serviceByKey, categoryByKey, cityById };
  const collections = useWorkspaceCollections(
    buildWorkspacePrivateSourcesCollectionsArgs({
      activePublicSection,
      activeWorkspaceTab,
      requestsScope,
      requests: publicRequestsState.requests,
      requestUserStateData,
      legacyPrivateData,
      catalogIndex,
      locale,
    }),
  );

  return resolveWorkspacePrivateSourcesResult({
    contractData,
    legacyPublicOverviewData,
    requestUserStateData,
    legacyPrivateData,
    catalogIndex,
    collections,
    publicRequestsState,
  });
}
