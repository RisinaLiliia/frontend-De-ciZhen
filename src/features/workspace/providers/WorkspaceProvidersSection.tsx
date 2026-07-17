'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useProviderFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { pickRequestsExplorerSharedFilters, buildRequestsExplorerNextPath } from '@/components/requests/requestsExplorer.model';
import { useRequestsExplorerFilters } from '@/components/requests/useRequestsExplorerFilters';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { resolveWorkspaceRequestsPeriod, resolveWorkspaceViewerMode } from '@/features/workspace/state';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { resolveRequestsPageSizeForDensity } from '@/lib/requests/pagination';
import { WorkspaceProviderDetailStage } from '@/features/workspace/providers/WorkspaceProviderDetailStage';
import { WorkspaceProvidersBrowseStage } from '@/features/workspace/providers/WorkspaceProvidersBrowseStage';
import {
  WORKSPACE_PROVIDER_ID_QUERY_KEY,
  buildWorkspaceProviderDetailHref,
} from '@/features/workspace/providers/workspaceProviderRoute.model';
import { useWorkspaceProvidersMainData } from '@/features/workspace/providers/useWorkspaceProvidersMainData';

type WorkspaceProvidersSectionProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  onListDensityChange: (value: 'single' | 'double') => void;
};

type WorkspaceProvidersBrowseContentProps = WorkspaceProvidersSectionProps;

const WorkspaceProvidersBrowseContent = React.memo(function WorkspaceProvidersBrowseContent({
  t,
  locale,
  onListDensityChange,
}: WorkspaceProvidersBrowseContentProps) {
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const viewerMode = resolveWorkspaceViewerMode(searchParams.get('viewerMode'));
  const period = resolveWorkspaceRequestsPeriod(searchParams.get('period') ?? searchParams.get('range'));
  const filters = useRequestsExplorerFilters({ t, locale });
  const sharedFilters = pickRequestsExplorerSharedFilters(filters);

  const handleListDensityChange = React.useCallback(
    (value: 'single' | 'double') => {
      filters.setLimit(resolveRequestsPageSizeForDensity(value));
      onListDensityChange(value);
    },
    [filters, onListDensityChange],
  );

  const providersData = useWorkspaceProvidersMainData({
    cityId: filters.cityId,
    subcategoryKey: filters.subcategoryKey,
    categoryKey: filters.categoryKey,
    sortBy: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
    setPage: filters.setPage,
    period,
    viewerMode,
  });

  const nextPath = React.useMemo(
    () => buildRequestsExplorerNextPath(pathname, searchParams),
    [pathname, searchParams],
  );

  const {
    pendingFavoriteProviderIds,
    toggleProviderFavorite,
  } = useProviderFavoriteToggle({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteProviderIds: providersData.favoriteProviderIds,
    providerById: providersData.providerById,
  });

  const providerProfileHrefResolver = React.useMemo(
    () => (providerId: string) => buildWorkspaceProviderDetailHref({ currentSearch: searchParams, providerId }),
    [searchParams],
  );

  const providerReviewsHrefResolver = React.useMemo(
    () => (providerId: string) => `${providerProfileHrefResolver(providerId)}#reviews`,
    [providerProfileHrefResolver],
  );

  return (
    <section className={workspacePanelShell()}>
      <WorkspaceProvidersBrowseStage
        t={t}
        locale={locale}
        {...sharedFilters}
        totalProvidersLabel={providersData.totalLabel}
        totalProviderPages={providersData.totalPages}
        emptyTitle={providersData.emptyTitle}
        emptyHint={providersData.emptyHint}
        providersListDensity={providersData.listDensity}
        onListDensityChange={handleListDensityChange}
        isProvidersLoading={providersData.isLoading}
        isProvidersError={providersData.isError}
        filteredProvidersCount={providersData.totalCount}
        providerCards={providersData.providerCards}
        favoriteProviderIds={providersData.favoriteProviderIds}
        pendingFavoriteProviderIds={pendingFavoriteProviderIds}
        onToggleProviderFavorite={toggleProviderFavorite}
        showFilterControls={false}
        providerProfileHrefResolver={providerProfileHrefResolver}
        providerReviewsHrefResolver={providerReviewsHrefResolver}
      />
    </section>
  );
});

export const WorkspaceProvidersSection = React.memo(function WorkspaceProvidersSection({
  t,
  locale,
  onListDensityChange,
}: WorkspaceProvidersSectionProps) {
  const searchParams = useSearchParams();
  const activeProviderId = searchParams.get(WORKSPACE_PROVIDER_ID_QUERY_KEY)?.trim() || null;
  const rootClassName = 'workspace-section-pane workspace-explore-grid workspace-explore-grid--single';

  return (
    <div className={rootClassName}>
      {activeProviderId ? (
        <WorkspaceProviderDetailStage providerId={activeProviderId} />
      ) : (
        <WorkspaceProvidersBrowseContent
          t={t}
          locale={locale}
          onListDensityChange={onListDensityChange}
        />
      )}
    </div>
  );
});
