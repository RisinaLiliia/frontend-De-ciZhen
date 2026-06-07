'use client';

import { RequestsFilterControls } from '@/components/requests/RequestsFilters';
import { useRequestsExplorerFilters } from '@/components/requests/useRequestsExplorerFilters';
import { buildWorkspaceRequestsShellControlsProps } from '@/features/workspace/requests/workspaceRequestsShellControls.model';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspaceRequestsShellControlsProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  contentType?: 'requests' | 'providers';
};

export function WorkspaceRequestsShellControls({
  t,
  locale,
  contentType = 'requests',
}: WorkspaceRequestsShellControlsProps) {
  const filters = useRequestsExplorerFilters({ t, locale });
  const controlsProps = buildWorkspaceRequestsShellControlsProps({
    t,
    locale,
    contentType,
    filters,
  });

  return <RequestsFilterControls {...controlsProps} />;
}
