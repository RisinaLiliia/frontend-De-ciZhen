'use client';

import { WorkspaceChipToggleGroup } from '@/features/workspace/shared';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceStatusFilter } from '../../state';
import type { WorkspaceContentChipFilter } from '../workspaceContent.types';

type Props = {
  t: (key: I18nKey) => string;
  statusFilters: WorkspaceContentChipFilter[];
  activeStatusFilter: WorkspaceStatusFilter;
  setStatusFilter: (status: WorkspaceStatusFilter) => void;
};

export function WorkspaceContentStatusFilters({
  t,
  statusFilters,
  activeStatusFilter,
  setStatusFilter,
}: Props) {
  return (
    <WorkspaceChipToggleGroup
      items={statusFilters}
      selectedKey={activeStatusFilter}
      onSelect={(key) => setStatusFilter(key as WorkspaceStatusFilter)}
      ariaLabel={t(I18N_KEYS.requestsPage.statusFiltersLabel)}
    />
  );
}
