'use client';

import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useWorkspaceData } from '@/features/workspace/data/useWorkspaceData';
import { useWorkspaceProviderSupportData } from '@/features/workspace/providers/useWorkspaceProviderSupportData';
import {
  useWorkspaceCollections,
  useWorkspacePublicFilters,
} from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import {
  buildWorkspacePrivateCatalogIndexArgs,
  buildWorkspacePrivateSourcesCollectionsArgs,
  buildWorkspacePrivateSourcesDataArgs,
  resolveWorkspacePrivateSourcesResult,
  shouldLoadWorkspacePrivateCatalog,
} from '@/features/workspace/orchestration/workspacePrivateSources.model';

type SourcesParams = Pick<WorkspaceBranchProps, 't' | 'locale' | 'isAuthed' | 'isWorkspaceAuthed'> & {
  enabled?: boolean;
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  requestsScope?: WorkspaceBranchProps['routeState']['requestsScope'];
  activeRequestsRole?: WorkspaceBranchProps['routeState']['activeRequestsRole'];
  activeRequestsState?: WorkspaceBranchProps['routeState']['activeRequestsState'];
  activeRequestsPeriod?: WorkspaceBranchProps['routeState']['activeRequestsPeriod'];
  activeRequestsSort?: WorkspaceBranchProps['routeState']['activeRequestsSort'];
};

export function useWorkspacePrivateSources({
  enabled = true,
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
  const shouldLoadCatalog = enabled && shouldLoadWorkspacePrivateCatalog({
    activePublicSection,
    activeWorkspaceTab,
    requestsScope,
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
      enabled,
      filter,
      page,
      limit,
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
  const {
    contractData,
    requestUserStateData,
  } = data;
  const providerSupportData = useWorkspaceProviderSupportData({
    enabled: enabled && activePublicSection === null,
    isAuthed,
  });

  const catalogIndex = { serviceByKey, categoryByKey, cityById };
  const collections = useWorkspaceCollections(
    buildWorkspacePrivateSourcesCollectionsArgs({
      activePublicSection,
      activeWorkspaceTab,
      requestsScope,
      requests: [],
      requestUserStateData,
      providerSupportData,
      catalogIndex,
      locale,
    }),
  );

  return resolveWorkspacePrivateSourcesResult({
    activePublicSection,
    activeWorkspaceTab,
    requestsScope,
    contractData,
    requestUserStateData,
    providerSupportData,
    catalogIndex,
    collections,
    filters: {
      page,
      limit,
      setPage,
    },
  });
}
